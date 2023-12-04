const db = require("../models");
const attachmentController = require("./attachmentController");
const pdf = require('pdf-parse');
const {isValidPdf, replaceInFilename} = require("../util/PdfUtils");
const {setPhase7PaperOID} = require("./roleassignmentController");

const Op = db.Sequelize.Op;
const Paper = db.paper;
const Review = db.review;
const User = db.user;
const Attachment = db.attachment;
const Seminar = db.seminar;
const RoleAssignment = db.roleassignment;

async function uploadPaper(req, res) {
    const t = await db.sequelize.transaction();
    try {
        const userOID = 3;
        const seminarOID = 1;

        const file = req.files?.file



        if(!await isValidPdf(file.data)){
            return res.status(415).json({error: 'Unsupported Media Type; Only PDF files are allowed'});
        }
        const currentPhase = await Seminar.findByPk(seminarOID, {attributes: ["phase"]});
        // TODO
        //file.name = replaceInFilename(file.name, ["xyz", "abc"]);

        let attachment = await attachmentController.createAttachment(file, t)

        const paper = await Paper.create({
            seminarOID: seminarOID,
            authorOID: userOID,
            attachmentOID: attachment.attachmentOID
        }, {transaction: t});

        if(currentPhase.phase === 7){
            // TODO
            if(!await setPhase7PaperOID(t, paper.paperOID, userOID, seminarOID)){
                throw new Error("Phase 7 Paper already set");
            }
        }

        await t.commit();
        return res.status(200).end();
    } catch (error) {
        await t.rollback();
        console.error("Error :" + error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

async function getAssignedPaper(req, res) {
    try {
        //const userOID = req.user.userOID;
        const userOID = 3; // TODO req.user.userOID;
        const seminarOID = req.params.seminarOID;

        if (!seminarOID) {
            return res.status(400).json({error: 'Bad Request'});
        }

        const idsToReview = await Review.findAll({
            where: {
                reviewerOID: userOID
            },
            attributes: ["paperOID"]
        });


        const papersToReview = await Paper.findAll({
            where: {
                paperOID: {[Op.in]: idsToReview.map((paper) => paper.paperOID)},
                seminarOID: seminarOID
            },
            include: [{
                model: Attachment,
                as: "attachmentO",
                attributes: ["attachmentOID", "filename"]
            },],
            attributes: ["paperOID"]
        });


        return res.status(200).json(papersToReview);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

async function getUploadedPaper(req, res) {
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.params.seminarOID;
        const paper = await Paper.findAll({
            where: {
                authorOID: userOID,
                seminarOID: seminarOID
            },
            include: [{
                model: Attachment,
                as: "attachmentO",
                attributes: ["attachmentOID", "filename"]
            }],
            attributes: ["paperOID"]
        });
        if (!paper) {
            return res.status(404).json({error: 'Not Found'});
        }
        return res.status(200).json(paper);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports = {
    uploadPaper,
    getAssignedPaper,
    getUploadedPaper
}
