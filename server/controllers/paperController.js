const db = require("../models");
const { Op } = require('sequelize');

const Paper = db.paper;
const ReviewerAssignment = db.reviewerassignment;
const Person = db.person;

const getPaperPdf = async (req, res) => {
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

async function uploadPaper(req, res) {
    try {
        if (!req.files) {
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

async function getAssignedPaper(req, res) {
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

module.exports = {
    getPaperPdf,
    uploadPaper,
    getAssignedPaper
}