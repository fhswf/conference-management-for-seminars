const crypto = require('crypto');
const db = require("../models");

const Seminar = db.seminar;
const RoleAssignment = db.roleassignment;
const User = db.user;
const Concept = db.concept;
const Attachment = db.attachment;

const getSeminar = async (req, res) => {
    try {
        //const userOID = req.user.userOID;
        const userOID = 11; // TODO req.user.userOID
        const seminarOID = req.params.seminarOID;
        const seminar = await Seminar.findByPk(seminarOID, // TODO req.user.lti.context_id
            {
                include: [{
                    model: RoleAssignment,
                    as: "roleassignments",
                    where: {userOID: userOID},
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
    try {
        const users = await Seminar.findByPk(2, // TODO req.user.lti.context_id
            {
                include: [{
                    model: RoleAssignment,
                    as: "roleassignments",
                    attributes: ["userOID", "roleOID"],
                    include: [{
                        model: User,
                        as: "userO",
                        include: [{
                            model: Concept,
                            as: "userOIDStudent_concepts",
                            attributes: ["conceptOID", "accepted", "userOIDSupervisor", "text"],
                            include: [{
                                model: User,
                                as: "userOIDSupervisor_user",
                                attributes: ["firstname", "lastname", "mail"],

                            },
                                {
                                    model: Attachment,
                                    as: "attachmentO",
                                    attributes: ["filename", "mimetype"]
                                }
                            ],
                            order: [['createdAt', 'DESC']], //Das neueste Concept
                            limit: 1
                        }]
                    }],
                }],
            });


        if (users) {
            res.status(200).send(users);
        } else {
            res.status(404).send({message: "Users not found."});
        }

    } catch
        (e) {
        console.log(e);
        res.status(500).send({message: "Error while retrieving user."});
    }
}

const updateUserInSeminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userOid = req.body.userOID;
        const roleOid = req.body.roleOID;
        const seminarOid = req.body.seminarOID;
        const supervisorOid = req.body.supervisorOID;
        const comment = req.body.comment;

        //change:
        // 1. roleassignment
        const assignment = await RoleAssignment.update(
            {roleOID: roleOid},
            {where: {userOID: userOid, seminarOID: seminarOid}},
            {transaction: t}
        );
        // 2. user
        const user = await User.update(
            {comment: comment},
            {where: {useroid: userOid}},
            {transaction: t}
        );
        //3. concept
        const newestConcept = await Concept.findOne({
            where: {userOIDStudent: userOid},
            order: [['createdAt', 'DESC']],
        });
        if (newestConcept && supervisorOid) {
            const concept = await Concept.update(
                {userOIDSupervisor: supervisorOid},
                {where: {conceptoid: newestConcept.conceptoid}},
                {transaction: t}
            );
        }

        await t.commit();
        res.status(200).send({message: "user successfully changed."});
    } catch (e) {
        await t.rollback();
        console.log(e);
        res.status(500).send({message: "Error while changing user."});
    }
}

const evaluateConcept = async (req, res) => {
    // TODO check permissions
    try {
        const conceptoid = req.body.conceptOID;
        const accepted = req.body.accepted;
        // TODO set note
        const note = req.body.note;
        const concept = await Concept.update(
            {accepted: accepted},
            {where: {conceptoid: conceptoid}}
        );
        if (concept[0] === 1) {
            res.status(200).send({message: "Concept successfully evaluated."});
        } else {
            res.status(500).send({message: "Error while evaluating concept."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({message: "Error while evaluating concept."});
    }
}

const createSeminar = async (req, res) => {
    try {
        let existingSeminar = null;
        let key = null;
        do {
            key = crypto.randomUUID()

            //check if seminar already exists with this key
            existingSeminar = await Seminar.findOne({
                where: {key: key}
            });
        } while (existingSeminar)

        const seminar = await Seminar.create({
            description: req.body.name,
            phase: 1,
            key: key.toString()
        });
        res.status(200).send({message: "Seminar successfully created."});
    } catch (e) {
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
