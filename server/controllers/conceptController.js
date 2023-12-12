const {sendMail} = require("../mailer");
const db = require("../models");
const attachmentController = require("./attachmentController");
const path = require("path");
const {getUserWithOID, getCourseAdminUserInSeminar} = require("./userController");
const {getSeminarWithOID} = require("./seminarController");

const Concept = db.concept;
const User = db.user;
const Attachment = db.attachment;
const Seminar = db.seminar;

/**
 * Retrieves the newest Concept associated with the current user and the given seminar.
 * If no Concept is found, it returns an empty response.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getNewestConceptOfCurrentUser = async (req, res) => {
    // TODO ggf anpassen
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
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const uploadConcept = async (req, res) => {
    // TODO move
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.body.seminarOID;
        const text = req.body.text || null;

        const supervisorOID = req.body?.supervisorOID || undefined;
        const file = req.files?.file || undefined;

        if (!file && !text.trim()) {
            return res.status(400).json({error: "No text or file provided."})
        }

        if (!await userIsAllowedToUploadConcept(userOID, seminarOID)) {
            return res.status(403).json({error: "You are not allowed to upload a Concept for this seminar."})
        }

        let attachment = null;
        if (file) {
            attachment = await attachmentController.createAttachment(req.files?.file, t)
        }

        await Concept.create({
            text: text,
            userOIDSupervisor: supervisorOID,
            userOIDStudent: userOID,
            feedback: null,
            seminarOID: seminarOID,
            accepted: null,
            attachmentOID: attachment?.attachmentOID,
        }, {transaction: t});

        await t.commit();

        const users = await getCourseAdminUserInSeminar(seminarOID);
        const student = await getUserWithOID(userOID);
        const seminar = await getSeminarWithOID(seminarOID);

        for (const user of users) {
            const emailText = `Hallo ${user.firstName} ${user.lastName},
                    \nSeminar: ${seminar.description}
                    \nder Student ${student.firstName} ${student.lastName} hat ein Konzept eingereicht.
                    \nKonzept ${text || "-"}
                    \nDatei ${attachment?.filename || "-"}
                    \n\nMit freundlichen Grüßen`;

            console.log("Send Mail to: " + user.mail);

            //await sendMail(user.mail, "Neues Konzept hochgeladen", emailText);
        }

        return res.status(200).end();
    } catch (error) {
        await t.rollback();
        console.error("Error :" + error);
        return res.status(500).end();
    }
}

/**
 * Checks if the given user is allowed to upload a Concept for the given seminar:
 * if last one was rejected or if no Concept was uploaded yet.
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

/**
 * Returns the Concept with the given conceptOID.
 * The Object contains all relevant information about the Concept.
 * @param conceptOID
 * @returns {Promise<Model|null>}
 */
async function getConceptWithOID(conceptOID) {
    const concept = await Concept.findOne({
        where: {
            conceptOID: conceptOID
        },
        include: [{
            model: Attachment,
            as: 'attachmentO',
            attributes: ['filename'],
        },
            {
                model: User,
                as: 'userOIDSupervisor_user',
                attributes: ["userOID", "firstName", "lastName"]
            },
            {
                model: User,
                as: 'userOIDStudent_user',
                attributes: ["userOID", "firstName", "lastName", "mail"]
            },
            {
                model: Seminar,
                as: 'seminarO',
                attributes: ["seminarOID", "description"]
            }
        ],
    });

    return concept;
}

module.exports = {
    getNewestConceptOfCurrentUser,
    uploadConcept,
    userIsAuthorOfConcept,
    conceptHasAttachment,
    getConceptWithOID,
}
