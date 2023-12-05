const db = require("../models");

const Attachment = db.attachment;

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

const getAttachment = async (req, res) => {
    try {
        // TODO if not allowed to download -> 403
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

module.exports = {
    createAttachment,
    getAttachment
}
