const db = require("../models");

const Op = db.Sequelize.Op;
const Review = db.review;
const Attachment = db.attachment;
const Chatmessage = db.chatmessage;
const Paper = db.paper;

const getMessagesOfReview = async (req, res) => {
    try {
        const userOID = req.user.userOID
        const reviewOID = req.params.reviewOID

        const messages = await Chatmessage.findAll({
            where: {
                reviewOID: reviewOID,
                [Op.or]: [{ sender: userOID }, { receiver: userOID }]
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

            if(message.sender === userOID) {
                delete message.receiver;
            }else if(message.receiver === userOID) {
                delete message.sender;
            }

            return message;
        });

        return res.status(200).json(messagesWithoutPartnerId);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

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

        const review = await Review.findByPk(reviewOID);

        if (!review) {
            await t.rollback();
            return res.status(404).json({error: 'Not Found'});
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
        if(review.reviewerOID === userOID) {
            const paper = await Paper.findByPk(review.paperOID);
            receiverId = paper.authorOID;
        }else{
            receiverId = review.reviewerOID;
        }

        // create message
        const createdMessage = await Chatmessage.create({
            message: message,
            attachmentOID: createdAttachment?.attachmentOID,
            reviewOID: reviewOID,
            sender: userOID, // TODO
            receiver: receiverId // TODO
        }, {transaction: t});
        delete createdMessage.dataValues.receiver;
        await t.commit();

        createdMessage.attachmentO = createdAttachment;

        return res.status(200).json({createdMessage, createdAttachment});
    } catch (e) {
        await t.rollback();
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports = {
    getMessagesOfReview,
    createMessage
}
