import { Request, Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';

const db = require("../models");

const Op = db.Sequelize.Op;
const Paper = db.paper;
const ReviewerAssignment = db.reviewerassignment;
const Person = db.person;

const getPaperPdf = async (req: Request, res: Response) => {
    // TODO check if user is allowed to download this file
    try {
        const paper = await Paper.findByPk(req.params.id);

        if (paper && paper.pdf) {
            res.setHeader('Content-Type', 'application/pdf');

            res.setHeader('Content-Type', paper.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${paper.filename}"`);
            res.send(Buffer.from(paper.pdf, 'utf8'));
        } else {
            return res.status(404).json({error: 'Not Found'});
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

async function uploadPaper(req: Request, res: Response) {
    try {
        if (!req.files) {
            return res.status(400).send('No files were uploaded.');
        }
        const pdf: any = req.files?.file;
        const filename = (pdf as UploadedFile)?.name;
        const pdfData = (pdf as UploadedFile)?.data;
        const mimetype = (pdf as UploadedFile)?.mimetype;

        await Paper.create({
            studentOID: 1, // TODO req.user.personOID
            seminarOID: 1, // TODO req.user.lti.context_id
            pdf: pdfData,
            filename: filename,
            mimetype: mimetype,
        });

        // TODO send mail to Admin and supervisor
        return res.status(200).end();
    } catch (error) {
        console.error("Error :" + error);
        return res.status(500).end();
    }
}

async function getAssignedPaper(req: Request, res: Response) {
    try {
        const paper = await Paper.findAll({
            include: [
                {
                    model: ReviewerAssignment,
                    as: 'reviewerassignments',
                    where: {
                        [Op.or]: [
                            { reviewerA: 2 },  // TODO req.user.personOID
                            { reviewerB: 2 }   // TODO req.user.personOID
                        ]
                    },
                    attributes: []
                }
            ],
            attributes: ["paperOID", "filename"]
        });
        if (!paper) {
            return res.status(404).json({error: 'Not Found'});
        }
        return res.status(200).json(paper);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

async function getUploadedPaper(req: Request, res: Response) {
    try {
        const paper = await Paper.findAll({
            where: {
                studentOID: 1 // TODO req.user.personOID
            },
            attributes: ["paperOID", "filename"]
        });
        if (!paper) {
            return res.status(404).json({error: 'Not Found'});
        }
        return res.status(200).json(paper);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

export default {
    getPaperPdf,
    uploadPaper,
    getAssignedPaper,
    getUploadedPaper
}