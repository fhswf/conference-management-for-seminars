const db = require("../models");
const attachmentController = require("./attachmentController");
const path = require("path");

const Concept = db.concept;
const User = db.user;
const Status = db.status;
const Attachment = db.attachment;


const getNewestConcept = async (req, res) => {
    // TODO ggf anpassen
    try {
        const concept = await Concept.findOne({
            where: {
                userOIDStudent: 11, // TODO req.user.userOID
                seminarOID: 2 // TODO req.user.lti.context_id
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
        });
        if(!concept) {
            return res.status(404).json({ error: 'Not Found' });
        }
        return res.status(200).json(concept);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const uploadConcept = async (req, res) => {
    // TODO move
    const t = await db.sequelize.transaction();
    try {
        const seminarOID = req.body.seminarOID
        const text = req.body.text || null;

        const supervisorOID = req.body?.supervisorOID; // TODO use below
        let attachment = await attachmentController.createAttachment(req.files?.file, t)

        await Concept.create({
            text: text,
            userOIDSupervisor: null,
            userOIDStudent: 11, // TODO req.user.userOID
            feedback: null,
            seminarOID: seminarOID,
            accepted: null, // TODO ersetzen
            attachmentOID: attachment?.attachmentOID,
        }, {transaction: t});

        await t.commit();

        // TODO send mail to Admin and supervisor
        return res.status(200).end();
    } catch (error) {
        await t.rollback();
        console.error("Error :" + error);
        return res.status(500).end();
    }
}

module.exports = {
    getNewestConcept,
    uploadConcept
}
