const db = require("../models");
const attachmentController = require("./attachmentController");
const {isValidPdf, replaceInFilename} = require("../utils/PdfUtils");
const {sendMailPaperUploaded} = require("../utils/mailer");
const archiver = require("archiver");

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
 * Sends an email notification to admin and supervisor.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves once the paper is uploaded.
 */
async function uploadPaper(req, res) {
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.body.seminarOID;

        const file = req.files?.file

        if (!seminarOID || !file) {
            await t.rollback();
            return res.status(400).json({error: 'seminarOID or file missing'});
        }

        if(!await isValidPdf(file.data)){
            await t.rollback();
            return res.status(415).json({error: 'Unsupported Media Type; Only PDF files are allowed'});
        }
        const currentPhase = await Seminar.findByPk(seminarOID, {attributes: ["phase"]});

        const student = await User.findByPk(userOID, {attributes: ["firstname", "lastname"]});

        if(currentPhase.phase !== 3 && currentPhase.phase !== 7){
            await t.rollback();
            return res.status(400).json({error: 'Current phase is not 3 or 7'});
        }

        if (currentPhase.phase === 3) {
            file.name = replaceInFilename(file.name, [student.firstname, student.lastname]);
        }

        let attachment = await attachmentController.createAttachment(file, t)

        let paper = await Paper.create({
            seminarOID: seminarOID,
            authorOID: userOID,
            attachmentOID: attachment.attachmentOID
        }, {transaction: t});

        // set paperOID in roleassignment
        if(currentPhase.phase === 7){
            const [updatedRows] = await RoleAssignment.update({
                phase7paperOID: paper.paperOID
            }, {
                where: {
                    userOID: userOID,
                    seminarOID: seminarOID,
                    phase7paperOID: null
                }, transaction: t
            });

            if (updatedRows === 0) {
                await t.rollback();
                return res.status(409).json({error: 'Already uploaded a paper'});
            }
        }else if(currentPhase.phase === 3){
            await RoleAssignment.update({
                phase3paperOID: paper.paperOID
            }, {
                where: {
                    userOID: userOID,
                    seminarOID: seminarOID,
                }, transaction: t
            });
        }

        // add created attachment to paper
        attachment = attachment.get({plain: true});
        paper = paper.get({plain: true});
        delete attachment.file;
        paper.attachmentO = attachment;

        await t.commit();

        const users = await User.findAll({
            include: [{
                model: RoleAssignment,
                as: 'roleassignments',
                where: {
                    seminarOID: seminarOID,
                    [Op.or]: [{ roleOID: 2 }, { roleOID: 1 }]
                },
                attributes: [],
            }],
        });

        const seminar = await Seminar.findByPk(seminarOID);

        sendMailPaperUploaded(users, seminar, student);

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
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the papers assigned to the user for review.
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
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the papers uploaded by the user for the specified seminar.
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
 * @param userOID - The userOID to be checked.
 * @param paperOID - The paperOID to be checked.
 * @returns {Promise<boolean>}
 */
async function userIsAuthorOfPaper(userOID, paperOID ) {
    if (!userOID || !paperOID) {
        return false;
    }

    const paper = await Paper.findByPk(paperOID, {attributes: ["authorOID"]});

    return paper?.authorOID === userOID;
}

/**
 * Checks if a paper has an attachment and if the user is the author of the paper.
 * @param userOID - The userOID to be checked.
 * @param attachmentOID
 * @returns {Promise<boolean>}
 */
//async function paperHasAttachmentAndUserIsAuthor(userOID, attachmentOID) {
//    const paper = await Paper.findOne({
//        where: {
//            attachmentOID: attachmentOID
//        }
//    });
//    return paper !== null;
//}

/**
 * Checks if a paper has an attachment.
 * Returns the paper if it exists, null otherwise.
 * @param attachmentOID - The attachmentOID to be checked.
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
 * @param {number} paperOID - The unique identifier of the paper.
 * @returns {Promise<number|null>} - A Promise that resolves with the seminarOID if found, or null if not found.
 */
async function getSeminarOIDOfPaper(paperOID) {
    const paper = await Paper.findByPk(paperOID, {attributes: ["seminarOID"]});
    return paper?.seminarOID;
}

async function paperExists(paperOID) {
    const paper = await Paper.findByPk(paperOID);
    return paper !== null;
}

/**
 * Get all final papers in a seminar as a ZIP file and send it as a response.
 *
 * @param {Object} req - The HTTP request object containing the seminarOID.
 * @param {Object} res - The HTTP response object for sending the ZIP file.
 * @returns {Promise<void>} - A Promise that resolves after creating and sending the ZIP file or an error response.
 */
async function getAllFinalPaperZip(req, res) {
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.params.seminarOID;

        if (!seminarOID) {
            return res.status(400).json({error: 'Bad Request'});
        }

        const seminar = await Seminar.findByPk(seminarOID);

        //get all papers with attachment
        const papers = await RoleAssignment.findAll({
            where: {
                seminarOID: seminarOID,
                phase7paperOID: {
                    [Op.not]: null
                }
            },
            include: [{
                model: Paper,
                as: "phase7paperO",
                include: [{
                    model: Attachment,
                    as: "attachmentO",
                    attributes: ["filename", "file"]
                }],
                attributes: ["paperOID"]
            },
                {
                    model: User,
                    as: "userO",
                    attributes: ["firstname", "lastname"]
                }],
            attributes: ["phase7paperOID"]
        });

        //create and send zip
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${seminar.description}.zip`);

        archive.pipe(res);

        papers.forEach((paper) => {
            const filename = paper.userO.firstname + "_" + paper.userO.lastname + "_" + paper.phase7paperO.attachmentO.filename;
            const fileData = paper.phase7paperO.attachmentO.file;

            if (!Buffer.isBuffer(fileData)) {
                const bufferData = Buffer.from(fileData.data);
                archive.append(bufferData, { name: filename });
            } else {
                archive.append(fileData, { name: filename });
            }
        });

        await archive.finalize();

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports = {
    uploadPaper,
    getAssignedPaper,
    getUploadedPaper,
    userIsAuthorOfPaper,
    //paperHasAttachmentAndUserIsAuthor,
    paperHasAttachment,
    getSeminarOIDOfPaper,
    paperExists,
    getAllFinalPaperZip
}
