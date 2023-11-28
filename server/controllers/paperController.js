const db = require("../models");
const attachmentController = require("./attachmentController");

const Op = db.Sequelize.Op;
const Paper = db.paper;
const Review = db.review;
const User = db.user;
const Attachment = db.attachment;

async function uploadPaper(req, res) {
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.body.seminarOID;
        let attachment = await attachmentController.createAttachment(req.files?.file, t)

        await Paper.create({
            seminarOID: seminarOID, // TODO req.user.lti.context_id
            authorOID: userOID, // TODO req.user.userOID
            attachmentOID: attachment.attachmentOID
        }, {transaction: t});

        await t.commit();
        return res.status(200).end();
    } catch (error) {
        await t.rollback();
        console.error("Error :" + error);
        return res.status(500).end();
    }
}

async function getAssignedPaper(req, res) {
    try {
        //const userOID = req.user.userOID;
        const userOID = 11; // TODO req.user.userOID
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
                attributes: ["filename"]
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
                authorOID: userOID
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
