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
        const pdfPath = path.join("./userFiles/concept", req.params.filename);
        res.status(200).download(pdfPath);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const uploadConcept = async (req, res) => {

}


module.exports = {
    getConcept,
    getConceptPdf,
    uploadConcept
}