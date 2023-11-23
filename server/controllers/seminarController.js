const crypto = require('crypto');
const db = require("../models");

const Seminar = db.seminar;
const RolleAssignment = db.rolleassignment;
const User = db.user;
const Concept = db.concept;

const getSeminar = async (req, res) => {
    try {
        const seminar = await Seminar.findByPk(1, // TODO req.user.lti.context_id
            {
                include: [{
                    model: RolleAssignment,
                    as: "rolleassignments",
                    where: {userOID: 1}, // TODO req.user.userOID
                }],
                attributes: ["description", "phase"]
            },
        );

        if (seminar) {
            res.status(200).send(seminar);
        } else {
            res.status(404).send({message: "Seminar not found."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({message: "Error while retrieving seminar."});
    }
}

const setPhase = async (req, res) => {
    try {
        const seminaroid = req.params.phase; // TODO req.user.lti.context_id
        const phase = req.body.phase;
        const seminar = await Seminar.update({phase: phase}, {where: {seminaroid: seminaroid}});

        if (seminar[0] === 1) {
            res.status(200).send({message: "Phase successfully changed."});
        } else {
            res.status(500).send({message: "Error while changing phase."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({message: "Error while changing phase."});
    }
}

const getUserList = async (req, res) => {
    try{
        const users = await Seminar.findByPk(1, // TODO req.user.lti.context_id
             {
            include: [{
                model: RolleAssignment,
                as: "rolleassignments",
                attributes: ["userOID", "roleOID"],
                include: [{
                    model: User,
                    as: "userO",
                    include: [{
                        model: Concept,
                        as: "userOIDStudent_concepts",
                        attributes: ["conceptOID", "statusOID", "userOIDSupervisor", "text", "filename"],
                        include: [{
                            model: User,
                            as: "userOIDSupervisor_person",
                            attributes: ["firstname", "lastname", "mail"]
                        }],
                        order: [['submitted', 'DESC']], //Das neueste Concept
                        limit: 1
                    }]
                }],
            }],
        });


        if (persons) {
            res.status(200).send(persons);
        } else {
            res.status(404).send({message: "Persons not found."});
        }

    }catch (e){
        console.log(e);
        res.status(500).send({message: "Error while retrieving persons."});
    }
}

const updateUserInSeminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try{
        const personOid = req.body.personOID;
        const roleOid = req.body.roleOID;
        const seminarOid = req.body.seminarOID;
        const supervisorOid = req.body.supervisorOID;
        const comment = req.body.comment;

        //change:
        // 1. rolleassignment
        const assignment = await RolleAssignment.update(
            {roleOID: roleOid},
            {where: {personOID: personOid, seminarOID: seminarOid}},
            {transaction: t}
        );
        // 2. person
        const person = await Person.update(
            {comment: comment},
            {where: {personoid: personOid}},
            {transaction: t}
        );
        //3. concept
        const newestConcept = await Concept.findOne({
            where: { personOIDStudent: personOid},
            order: [['createdAt', 'DESC']],
        });
        if(newestConcept && supervisorOid){
            const concept = await Concept.update(
                {personOIDSupervisor: supervisorOid},
                {where: {conceptoid: newestConcept.conceptoid}},
                {transaction: t}
            );
        }

        await t.commit();
        res.status(200).send({message: "Person successfully changed."});
    }catch (e){
        await t.rollback();
        console.log(e);
        res.status(500).send({message: "Error while changing person."});
    }
}

const evaluateConcept = async (req, res) => {
    // TODO check permissions
    try{
        const conceptoid = req.body.conceptOID;
        const accepted = req.body.accepted;
        const statusoid = accepted ? 2 : 3;
        // TODO set note
        const note = req.body.note;
        const concept = await Concept.update(
            {statusOID: statusoid},
            {where: {conceptoid: conceptoid}}
        );
        if(concept[0] === 1){
            res.status(200).send({message: "Concept successfully evaluated."});
        }else{
            res.status(500).send({message: "Error while evaluating concept."});
        }
    }catch (e){
        console.log(e);
        res.status(500).send({message: "Error while evaluating concept."});
    }
}

const createSeminar = async (req, res) => {
    try{
        let existingSeminar = null;
        let key = null;
        do{
            key = crypto.randomUUID()

            //check if seminar already exists with this key
            existingSeminar = await Seminar.findOne({
                where: {key: key}
            });
        }while(existingSeminar)

        const seminar = await Seminar.create({
            description: req.body.name,
            phase: 1,
            key: key.toString()
        });
        res.status(200).send({message: "Seminar successfully created."});
    }catch (e){
        console.log(e);
        res.status(500).send({message: "Error while creating seminar."});
    }
}

module.exports = {
    getSeminar,
    setPhase,
    getUserList,
    updateUserInSeminar,
    evaluateConcept,
    createSeminar
}
