const db = require("../models");
const path = require("path");

const Concept = db.concept;

//Seminar in dem man sich befindet muss ermittelt werden
const getConcept = async (req, res) => {
    try {
        const concept = await Concept.findAll({
            where: { conceptOID: 1 }
        });
        //console.log(concept);
        //const pdfPath = path.join("./userFiles", concept[0].dataValues.filename);
        res.status(200).json(concept);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getConceptPdf = async (req, res) => {
    // TODO check if user is allowed to download this file
    try {
        //const pdfPath = path.join("./userFiles/concept", req.params.filename);
        //res.status(200).download(pdfPath);

        const concept = await Concept.findByPk(req.params.id);

        if (concept) {
            res.setHeader('Content-Type', 'application/pdf');

            //concept.pdf.data.data

            res.setHeader('Content-Type', concept.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${concept.filename}"`);
            res.send(Buffer.from(concept.pdf, 'utf8'));
        } else {
            res.status(404);
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const uploadConcept = async (req, res) => {
    try {
        const text = req.body.text;
        const filename = req.files.file.name;
        const pdf = req.files.file;
        const supervisorOID = req.body.supervisorOID;

        await Concept.create({
            text: text,
            pdf: pdf.data, // TODO Optimieren
            filename: filename,
            mimetype: pdf.mimetype,
            personOIDSupervisor: supervisorOID,
            personOIDStudent: 1, // TODO req.user.personOID
            seminarOID: 1, // TODO req.user.lti.context_id
            statusOID: 1, // TODO ersetzen
        } );

        // Antwort senden
        res.status(200);
    } catch (error) {
        console.error("Error :" + error);
        res.status(500);
    }
}


module.exports = {
    getConcept,
    getConceptPdf,
    uploadConcept
}