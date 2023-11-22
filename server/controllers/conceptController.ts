import { Request, Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';

const db = require("../models");
const Concept = db.concept;
const Person = db.person;
const Status = db.status;

const getConcept = async (req: Request, res: Response) => {
    // TODO ggf anpassen
    console.log("HALLO")
    try {
        const concept = await Concept.findOne({
            where: {
                personOIDStudent: 1, // TODO req.user.personOID
                seminarOID: 1 // TODO req.user.lti.context_id
            },
            include: [{
                model: Person,
                as: 'personOIDSupervisor_person',
                attributes: ["personOID", "firstname", "lastname"]
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

const getConceptPdf = async (req: Request, res: Response) => {
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

const uploadConcept = async (req: Request, res: Response) => {
    try {
        const text = (req.body.text && req.body.text.length > 0) ? req.body.text : null;

        const pdf: any = req.files?.file;
        const filename = (pdf as UploadedFile)?.name;
        const pdfData = (pdf as UploadedFile)?.data;
        const mimetype = (pdf as UploadedFile)?.mimetype;
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

        // TODO send mail to Admin and supervisor
        return res.status(200).end();
    } catch (error) {
        console.error("Error :" + error);
        return res.status(500).end();
    }
}

export default {
    getConcept,
    getConceptPdf,
    uploadConcept
}