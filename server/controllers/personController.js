const db = require("../models");

const Person = db.person;
const Concept = db.concept;
const Status = db.status;


const addPerson = async (req, res) => {

}

const getAllPersons = async (req, res) => {
    const persons = await Person.findAll({});
    res.status(200).json(persons);
}

const getPersonById = async (req, res) => {
    try {
        const person = await Person.findAll({
            include: [{
                model: Concept,
                as: 'personOIDStudent_concepts',
                include: [{
                    model: Status,
                    as: 'statusO'
                }]
            }],
            where: { PersonOID: req.params.id }
        });
        res.status(200).json(person);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    addPerson,
    getAllPersons,
    getPersonById
}