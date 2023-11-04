const db = require("../models");

const Paper = db.paper;

const getPaper = async (req, res) => {

}

async function uploadPaper(req, res)  {
    try {
        if(!req.files){
            return res.status(400).send('No files were uploaded.');
        }
        const filename = (req.files) ? req.files.file.name : null;
        const pdf = (req.files) ? req.files.file : null;
        const pdfData = (pdf) ? pdf.data : null;
        const mimetype = (pdf) ? pdf.mimetype : null;

        await Paper.create({
            studentOID: 1, // TODO req.user.personOID
            seminarOID: 1, // TODO req.user.lti.context_id
            pdf: pdfData,
            filename: filename,
            mimetype: mimetype,
        });


        return res.status(200).end();
    } catch (error) {
        console.error("Error :" + error);
        return res.status(500).end();
    }
}


module.exports = {
    getPaper,
    uploadPaper
}