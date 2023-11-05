const db = require("../models");
const path = require("path");

const Concept = db.concept;
const Person = db.person;
const Status = db.status;

const getConcept = async (req, res) => {
    // TODO ggf anpassen
    try {
        const concept = await Concept.findOne({
            where: {
                personOIDStudent: 1, // TODO req.user.personOID
                seminarOID: 1 // TODO req.user.lti.context_id
            },
            include: [{
                model: Person,
                as: 'personOIDSupervisor_person',
                attributes: ["firstname", "lastname"]
            },
            {
                model: Status,
                as: 'statusO'
            }],
            attributes: ["conceptOID", "text", "filename"]
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

const getConceptPdf = async (req, res) => {
    // TODO check if user is allowed to download this file
    try {
        //const pdfPath = path.join("./userFiles/concept", req.params.filename);
        //res.status(200).download(pdfPath);

        const concept = await Concept.findByPk(req.params.id);

        if (concept && concept.pdf) {
            res.setHeader('Content-Type', 'application/pdf');

            //concept.pdf.data.data

            res.setHeader('Content-Type', concept.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${concept.filename}"`);
            res.send(Buffer.from(concept.pdf, 'utf8'));
        } else {
            return res.status(404).json({ error: 'Not Found' });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const uploadConcept = async (req, res) => {
    try {
        const text = (req.body.text && req.body.text.length > 0) ? req.body.text : null;

        const filename = (req.files) ? req.files.file.name : null;
        const pdf = (req.files) ? req.files.file : null;
        const pdfData = (pdf) ? pdf.data : null;
        const mimetype = (pdf) ? pdf.mimetype : null;
        const supervisorOID = (!req.body.supervisorOID && req.body.supervisorOID !== undefined) ? req.body.supervisorOID : null; // TODO use below

        await Concept.create({
            text: text,
            pdf: pdfData, // TODO Optimieren
            filename: filename,
            mimetype: mimetype,
            personOIDSupervisor: null,
            personOIDStudent: 1, // TODO req.user.personOID
            seminarOID: 1, // TODO req.user.lti.context_id
            statusOID: 1, // TODO ersetzen
        } );

        // TODO send mail to Admin
        return res.status(200).end();
    } catch (error) {
        console.error("Error :" + error);
        return res.status(500).end();
    }
}

module.exports = {
    getConcept,
    getConceptPdf,
    uploadConcept
}