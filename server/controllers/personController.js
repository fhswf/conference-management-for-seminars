const db = require("../models");

const Person = db.person;
const Concept = db.concept;
const Status = db.status;
const RolleAssignment = db.rolleassignment;


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
            where: {PersonOID: req.params.id}
        });
        res.status(200).json(person);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

const getSupervisorList = async (req, res) => {
    // TODO check if USer is member of requested Seminar
    try {
        const supervisors = await Person.findAll({
            include: [{
                model: RolleAssignment,
                as: 'rolleassignments',
                where: {
                    seminarOID: req.params.seminarOID,
                    roleOID: 2 // 2 = Supervisor
                },
                attributes: [],
            }],
            attributes: ["personOID", "firstname", "lastname"],
        });
        res.status(200).json(supervisors);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


module.exports = {
    addPerson,
    getAllPersons,
    getPersonById,
    getSupervisorList
}