import { Request, Response } from 'express';
const db = require("../models");

const Op = db.Sequelize.Op;
const Person = db.person;
const Concept = db.concept;
const Status = db.status;
const RolleAssignment = db.rolleassignment;
const OidcUser = db.oidcuser;

const getPersonById = async (req: Request, res: Response) => {
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

const getSupervisorList = async (req: Request, res: Response) => {
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

const getAddableUsers = async (req: Request, res: Response) => {
    try {
        const seminarOID = req.params.seminarOID;
        const users = await Person.findAll({
            where: {
                personOID: {
                    [Op.notIn]: db.sequelize.literal(`(SELECT personOID FROM rolleassignment WHERE seminarOID = ${seminarOID})`)
                }
            },
            include: [{
                model: OidcUser,
                as: 'oidcusers',
                attributes: [],
            }],
            attributes: ["personOID", "firstname", "lastname", "mail", "comment"],
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};


//TODO check if User isAdmin
const assignToSeminar = async (req: Request, res: Response) => {
    try {
        const personOID = req.body.personOID;
        const seminarOID = req.body.seminarOID;
        const roleOID = req.body.roleOID;
        const rolleassignment = await RolleAssignment.create({
            personOID: personOID,
            seminarOID: seminarOID,
            roleOID: roleOID
        });
        // TODO send Mail to User
        res.status(200).json(rolleassignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


export default {
    getPersonById,
    getSupervisorList,
    getAddableUsers,
    assignToSeminar
}