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


/**
 * Uploads a Paper associated with a user and seminar, with optional file.
 * Returns 415 if the file is not a PDF.
 * Returns 409 if the user has already uploaded a paper in phase 7.
 * @param req
 * @param res
 * @throws {Error} if the user has already uploaded a paper in phase 7
 * @returns {Promise<*>}
 */
async function uploadPaper(req, res) {
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.body.seminarOID;

        const file = req.files?.file



        if(!await isValidPdf(file.data)){
            return res.status(415).json({error: 'Unsupported Media Type; Only PDF files are allowed'});
        }
        const currentPhase = await Seminar.findByPk(seminarOID, {attributes: ["phase"]});
        // TODO
        //file.name = replaceInFilename(file.name, ["xyz", "abc"]);

        let attachment = await attachmentController.createAttachment(file, t)

        let paper = await Paper.create({
            seminarOID: seminarOID,
            authorOID: userOID,
            attachmentOID: attachment.attachmentOID
        }, {transaction: t});

        if(currentPhase.phase === 7){
            // TODO
            if(!await setPhase7PaperOID(t, paper.paperOID, userOID, seminarOID)){
                return res.status(409).json({error: 'Bad Request'});
            }
        }

        // add created attachment to paper
        attachment = attachment.get({plain: true});
        paper = paper.get({plain: true});
        delete attachment.file;
        paper.attachmentO = attachment;

        await t.commit();
        return res.status(200).json(paper);
    } catch (error) {
        await t.rollback();
        console.error("Error :" + error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}


/**
 * Retrieves all papers assigned to a user within a seminar.
 * Returns a list of papers with their reviews.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getAssignedPaper(req, res) {
    try {
        //const userOID = req.user.userOID;
        const userOID = req.user.userOID;
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
            },
                {
                    model: Review,
                    as: "reviews",
                    where: {
                        reviewerOID: userOID
                    },
                }
            ],
            attributes: ["paperOID"]
        });


        return res.status(200).json(papersToReview);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Retrieves all papers uploaded by a user within a seminar.
 * Returns a list of papers with their attachments.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
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

/**
 * Checks if a user is the author of a paper.
 * Returns false if userOID or paperOID is null.
 * @param userOID
 * @param paperOID
 * @returns {Promise<boolean>}
 */
async function userIsAuthorOfPaper(userOID, paperOID ) {
    if (!userOID || !paperOID) {
        return false;
    }

    const paper = await Paper.findByPk(paperOID, {attributes: ["authorOID"]});
    return paper.authorOID === userOID;
}

/**
 * Checks if a paper has an attachment and if the user is the author of the paper.
 * @param userOID
 * @param attachmentOID
 * @returns {Promise<boolean>}
 */
async function paperHasAttachmentAndUserIsAuthor(userOID, attachmentOID) {
    const paper = await Paper.findOne({
        where: {
            attachmentOID: attachmentOID
        }
    });
    return paper !== null;
}

/**
 * Checks if a paper has an attachment.
 * Returns the paper if it exists, null otherwise.
 * @param attachmentOID
 * @returns {Promise<Object|null>}
 */
async function paperHasAttachment(attachmentOID) {
    const paper = await Paper.findOne({
        where: {
            attachmentOID: attachmentOID
        }
    });
    return paper;
}

/**
 * Returns the seminarOID associated with a paper.
 * @param paperOID
 * @returns {Promise<*>}
 */
async function getSeminarOIDOfPaper(paperOID) {
    const paper = await Paper.findByPk(paperOID, {attributes: ["seminarOID"]});
    return paper.seminarOID;
}

module.exports = {
    uploadPaper,
    getAssignedPaper,
    getUploadedPaper,
    userIsAuthorOfPaper,
    paperHasAttachmentAndUserIsAuthor,
    paperHasAttachment,
    getSeminarOIDOfPaper
}
