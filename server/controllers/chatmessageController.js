const db = require("../models");
const {isValidPdf} = require("../utils/PdfUtils");

const Op = db.Sequelize.Op;
const Review = db.review;
const Attachment = db.attachment;
const Chatmessage = db.chatmessage;
const Paper = db.paper;

/**
 * Retrieves chat messages related to a specific review.
 * The messages are ordered by creation date in ascending order.
 * Removes the partners user ID from each message for privacy reasons if user is not sender.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the retrieved chat messages or an error response.
 */
const getMessagesOfReview = async (req, res) => {
    try {
        const userOID = req.user.userOID
        const reviewOID = req.params.reviewOID

        if (!reviewOID) {
            return res.status(400).json({error: 'Bad Request'});
        }

        const messages = await Chatmessage.findAll({
            where: {
                reviewOID: reviewOID,
                [Op.or]: [{sender: userOID}, {receiver: userOID}]
            },
            include: [{
                model: Attachment,
                as: 'attachmentO',
                attributes: ['attachmentOID', 'filename'],
            }],
            attributes: ['message', 'createdAt', 'sender', 'receiver'],
            order: [['createdAt', 'ASC']],
        });

        const messagesWithoutPartnerId = messages.map(message => {
            message = message.get();

            if (message.sender === userOID) {
                //delete message.receiver;
                message.receiver = null;
            } else if (message.receiver === userOID) {
                //delete message.sender;
                message.sender = null;
            }

            return message;
        });

        return res.status(200).json(messagesWithoutPartnerId);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Creates a chat message associated with a review, including optional attachments.
 * Returns the created message and attachment (if any).
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the created message and attachment (if any) or an error response.
 */
const createMessage = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.user.userOID
        const paperOID = req.body.paperOID
        const message = req.body.message
        const file = req.files?.file
        const reviewOID = req.body.reviewOID

        if (!paperOID || (!message && !file)) {
            await t.rollback();
            return res.status(400).json({error: 'Bad Request'});
        }

        if (file && file.data && !await isValidPdf(file.data)) {
            await t.rollback();
            return res.status(415).json({error: 'Unsupported Media Type; Only PDF files are allowed'});
        }

        const review = await Review.findByPk(reviewOID);

        if (!review) {
            await t.rollback();
            return res.status(404).json({error: 'Review Not Found'});
        }


        // create attachment if file is present
        let createdAttachment = null
        if (file) {
            createdAttachment = await Attachment.create({
                file: file.data,
                mimetype: file.mimetype,
                filename: file.name,
            }, {transaction: t});
        }

        let receiverId;
        if (review.reviewerOID === userOID) {
            const paper = await Paper.findByPk(review.paperOID);
            receiverId = paper.authorOID;
        } else {
            receiverId = review.reviewerOID;
        }

        // create message
        const createdMessage = await Chatmessage.create({
            message: message,
            attachmentOID: createdAttachment?.attachmentOID,
            reviewOID: reviewOID,
            sender: userOID,
            receiver: receiverId
        }, {transaction: t});
        delete createdMessage.dataValues.receiver;
        await t.commit();

        //delete file attribute from attachment
        if (createdAttachment) {
            createdAttachment = createdAttachment.get();
            delete createdAttachment.file;
        }
        createdMessage.attachmentO = createdAttachment;

        // optional: send mail to receiver

        return res.status(200).json({createdMessage, createdAttachment});
    } catch (e) {
        await t.rollback();
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Checks if a user with the provided userOID is a participant in a chat conversation.
 *
 * @param userOID - The userOID to be checked.
 * @param attachmentOID - The attachmentOID associated with the chat (optional).
 * @param reviewOID - The reviewOID associated with the chat (optional).
 * @throws {Error} - Throws an error if userOID, attachmentOID, or reviewOID is null.
 * @returns {Promise<boolean>} - True if the user is a chat participant, otherwise false.
 */
async function userIsChatParticipant(userOID, attachmentOID = false, reviewOID = false) {
    if (!userOID || (!attachmentOID && !reviewOID)) {
        throw new Error("userOID or attachmentOID or reviewOID is null");
    }

    let chatmessage = null;

    if (attachmentOID) {
        chatmessage = await Chatmessage.findOne({
            where: {
                attachmentOID: attachmentOID,
                [Op.or]: [{sender: userOID}, {receiver: userOID}]
            },
        })
    } else if (reviewOID) {
        chatmessage = await Chatmessage.findOne({
            where: {
                reviewOID: reviewOID,
                [Op.or]: [{sender: userOID}, {receiver: userOID}]
            },
        })
    }

    return chatmessage !== null;
}

/**
 * Checks if a user with the provided userOID is a participant in a chat conversation associated with the given attachmentOID.
 *
 * @param userOID - The userOID to be checked.
 * @param attachmentOID - The attachmentOID to be associated with a chat.
 * @throws {Error} - Throws an error if userOID or attachmentOID is null.
 * @returns {Promise<boolean>} - True if the user is a participant and the attachment is associated, otherwise false.
 */
async function chatHasAttachmentAndUserIsParticipant(userOID, attachmentOID) {
    if (!userOID || !attachmentOID) {
        throw new Error("userOID or attachmentOID is null");
    }

    const chatmessage = await Chatmessage.findOne({
        where: {
            attachmentOID: attachmentOID
        }
    });
    return chatmessage !== null;
}

/**
 * Checks if there is a chat message associated with the given attachmentOID.
 *
 * @param attachmentOID
 * @throws {Error} - Throws an error if attachmentOID is null.
 * @returns {Promise<Object|null>} - The found chat message or null if not found.
 */
async function chatHasAttachment(attachmentOID) {
    if (!attachmentOID) {
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
    getMessagesOfReview,
    createMessage,
    userIsChatParticipant,
    chatHasAttachmentAndUserIsParticipant,
    chatHasAttachment
}
