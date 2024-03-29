const {sendMailConceptUploaded} = require("../utils/mailer");
const db = require("../models");
const attachmentController = require("./attachmentController");
const {isValidPdf} = require("../utils/PdfUtils");

const Concept = db.concept;
const User = db.user;
const Attachment = db.attachment;
const Seminar = db.seminar;
const RoleAssignment = db.roleassignment;

/**
 * Retrieves the newest Concept associated with the current user and the given seminar.
 *
 * If no Concept is found, it returns an empty response.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the newest concept or an empty object if not found.
 */
const getNewestConceptOfCurrentUser = async (req, res) => {
    try {
        const seminarOID = req.params.seminarOID;
        const userOID = req.user.userOID;
        const concept = await Concept.findOne({
            where: {
                userOIDStudent: userOID,
                seminarOID: seminarOID
            },
            include: [{
                model: Attachment,
                as: 'attachmentO',
                attributes: ['filename'],
            },
                {
                    model: User,
                    as: 'userOIDSupervisor_user',
                    attributes: ["userOID", "firstname", "lastname"]
                }],
            order: [['createdAt', 'DESC']], //Das neueste Concept
            limit: 1
        });
        if (!concept) {
            return res.status(200).json({})
        }
        return res.status(200).json(concept);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Uploads a Concept associated with a user and seminar, optionally with text and attachments.
 * Sends an email notification to admin and supervisor.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves once the concept is uploaded.
 */
const uploadConcept = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.body.seminarOID;
        const text = req.body.text || null;

        const supervisorOID = req.body?.supervisorOID || undefined;
        const file = req.files?.file || undefined;

        if(!text && !file){
            await t.rollback();
            return res.status(400).json({error: "No text or file provided."})
        }

        const seminar = await Seminar.findByPk(seminarOID);

        if(seminar.phase !== 2 && seminar.phase !== 3) {
            await t.rollback();
            return res.status(403).json({error: "You are not allowed to upload a Concept for this seminar."})
        }

        if (!file && !text.trim()) {
            await t.rollback();
            return res.status(400).json({error: "No text or file provided."})
        }

        if (!await userIsAllowedToUploadConcept(userOID, seminarOID)) {
            await t.rollback();
            return res.status(403).json({error: "You are not allowed to upload a Concept for this seminar."})
        }

        if (supervisorOID) {
            const givenUserIsSupervisor = await RoleAssignment.findOne({
                where: {
                    userOID: supervisorOID,
                    roleOID: 2,
                    seminarOID: seminarOID
                }
            });

            if (!givenUserIsSupervisor) {
                await t.rollback();
                return res.status(409).send({msg: "User is not a supervisor of this seminar."});
            }
        }

        let attachment = null;
        if(file && !await isValidPdf(file)){
            await t.rollback();
            return res.status(415).json({error: 'Unsupported Media Type; Only PDF files are allowed'});
        }
        if (file) {
            attachment = await attachmentController.createAttachment(req.files?.file, t)
        }

        const concept = await Concept.create({
            text: text,
            userOIDSupervisor: supervisorOID,
            userOIDStudent: userOID,
            feedback: null,
            seminarOID: seminarOID,
            accepted: null,
            attachmentOID: attachment?.attachmentOID,
        }, {transaction: t});

        const courseAdminUsers = await User.findAll({
            include: [{
                model: RoleAssignment,
                as: 'roleassignments',
                where: {
                    seminarOID: seminarOID,
                    roleOID: 1 // 1 = Course Admin
                },
                attributes: [],
            }],
        });

        const student = await User.findByPk(userOID);

        sendMailConceptUploaded(courseAdminUsers, seminar, student)

        //throw new Error("Test");
        await t.commit();

        return res.status(200).json(concept);
    } catch (error) {
        await t.rollback();
        console.error("Error :" + error);
        return res.status(500).end();
    }
}

/**
 * Checks if the given user is allowed to upload a Concept for the given seminar:
 * if last one was rejected or if no Concept was uploaded yet.
 *
 * @param userOID
 * @param seminarOID
 * @returns {Promise<boolean>}
 */
async function userIsAllowedToUploadConcept(userOID, seminarOID) {
    const concept = await Concept.findOne({
        where: {
            userOIDStudent: userOID,
            seminarOID: seminarOID
        },
        order: [['createdAt', 'DESC']], //Das neueste Concept
        limit: 1
    });
    if (!concept) {
        return true;
    }
    return concept.accepted === false;
}

/**
 * Checks if the given user is the author of the given Concept.
 *
 * @param userOID
 * @param conceptOID
 * @returns {Promise<boolean>}
 */
async function userIsAuthorOfConcept(userOID, conceptOID) {
    const concept = await Concept.findOne({
        where: {
            conceptOID: conceptOID
        }
    });
    return concept.userOIDStudent === userOID;
}

/**
 * Checks if there is a Concept associated with the given attachmentOID.
 * Returns the found Concept if it exists, otherwise null.
 *
 * @param {number} attachmentOID - The attachmentOID to be checked for association with a Concept.
 * @returns {Promise<Object|null>} - A Promise that resolves to the found Concept or null if not found.
 */
async function conceptHasAttachment(attachmentOID) {
    const concept = await Concept.findOne({
        where: {
            attachmentOID: attachmentOID
        }
    });
    return concept;
}

module.exports = {
    getNewestConceptOfCurrentUser,
    uploadConcept,
    userIsAuthorOfConcept,
    conceptHasAttachment
}
