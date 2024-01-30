const db = require("../models");

const Attachment = db.attachment;
const Concept = db.concept;
const Paper = db.paper;
const Chatmessage = db.chatmessage;


/**
 * Creates a new attachment entry in the database.
 * @param file - The file object containing data, mimetype, and filename.
 * @param t - The database transaction object.
 * @throws {Error} - Throws an error if the file size is too large or if the file is null.
 * @returns {Promise} - Returns a Promise that resolves to the created attachment entry.
 */
const createAttachment = async (file, t) => {
    if((file.size / (1024* 1024)) >= 16){
        throw new Error("File too large");
    }

    if(!file){
        throw new Error("File is null");
    }

    return await Attachment.create({
        file: file.data,
        mimetype: file.mimetype,
        filename: file.name,
    }, {transaction: t});
}

/**
 * Returns the file associated with the given attachmentOID.
 *
 * @param {Object} req - The HTTP request object containing the attachmentOID.
 * @param {Object} res - The HTTP response object for sending the attachment or an error response.
 * @returns {Promise<void>} - A Promise that resolves with the attachment as a response or an error response.
 */
const getAttachment = async (req, res) => {
    try {
        if(!req.params.attachmentOID){
            return res.status(400).json({error: 'Bad Request'});
        }

        const paper = await Attachment.findByPk(req.params.attachmentOID);

        if (paper && paper.file) {
            res.setHeader('Content-Type', paper.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${paper.filename}"`);
            res.send(Buffer.from(paper.file, 'utf8'));
        } else {
            return res.status(404).json({error: 'Not Found'});
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}


/**
 * This function determines to which entity (Chatmessage, Concept, or Paper) a given attachmentOID belongs.
 *
 * @param attachmentOID - The attachmentOID to be associated.
 * @throws {Error} - Throws an error if attachmentOID is null.
 * @returns {Promise<Object|null>} - The found object of the associated entity or null.
 */
const getAttachmentDetails = async (attachmentOID) => {
    if(!attachmentOID){
        throw new Error("attachmentOID is null");
    }

   const chatmessage = await AttachmentIsChatmessage(attachmentOID);
   if (chatmessage) {
       return chatmessage;
   }

    const concept = await AttachmentIsConcept(attachmentOID);
    if (concept) {
        return concept;
    }

    const paper = await AttachmentIsPaper(attachmentOID);
    if (paper) {
        return paper;
    }

    return null;
}

/**
 * Checks if the given attachmentOID belongs to a concept in the database.
 *
 * @param {number} attachmentOID - The attachmentOID to check.
 * @returns {Promise<Object|null>} - A Promise that resolves to the Concept if the attachment is associated with one, or null if not found.
 * @throws {Error} - Throws an error if attachmentOID is null or if there's an error during the database query.
 */
const AttachmentIsConcept = async (attachmentOID) => {
    if(!attachmentOID){
        throw new Error("attachmentOID is null");
    }

    const concept = await Concept.findOne({
        where: {
            attachmentOID: attachmentOID
        }
    });
    return concept;
}

/**
 * Checks if the given attachmentOID belongs to a paper in the database.
 *
 * @param {number} attachmentOID - The attachmentOID to check.
 * @returns {Promise<Paper|null>} - A Promise that resolves to the Paper if the attachment is associated with one, or null if not found.
 * @throws {Error} - Throws an error if attachmentOID is null or if there's an error during the database query.
 */
const AttachmentIsPaper = async (attachmentOID) => {
    if(!attachmentOID){
        throw new Error("attachmentOID is null");
    }

    const paper = await Paper.findOne({
        where: {
            attachmentOID: attachmentOID
        }
    });
    return paper;
}

/**
 * Checks if the given attachmentOID belongs to a chatmessage in the database.
 *
 * @param {number} attachmentOID - The attachmentOID to check.
 * @returns {Promise<Chatmessage|null>} - A Promise that resolves to the Chatmessage if the attachment is associated with one, or null if not found.
 * @throws {Error} - Throws an error if attachmentOID is null or if there's an error during the database query.
 */
const AttachmentIsChatmessage = async (attachmentOID) => {
    if(!attachmentOID){
        throw new Error("attachmentOID is null");
    }

    const chatmessage = await Chatmessage.findOne({
        where: {
            attachmentOID: attachmentOID
        }
    });
    return chatmessage;
}

module.exports = {
    createAttachment,
    getAttachment,
    getAttachmentDetails
}
