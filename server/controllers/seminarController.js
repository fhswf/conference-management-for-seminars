const crypto = require('crypto');
const db = require("../models");
const {setPhase4PaperOID} = require("./roleassignmentController");
const {assignReviewer} = require("./reviewController");

const Seminar = db.seminar;
const RoleAssignment = db.roleassignment;
const User = db.user;
const Concept = db.concept;
const Attachment = db.attachment;
const Paper = db.paper;

/**
 * Returns the seminar with the given seminarOID.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getSeminar = async (req, res) => {
    try {
        if(!req.params.seminarOID){
            return res.status(400).json({error: 'Not Found'});
        }

        //const userOID = req.user.userOID;
        const userOID = req.user.userOID;
        const seminarOID = req.params.seminarOID;
        const seminar = await Seminar.findByPk(seminarOID,
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

/**
 * Returns all existing seminars in database.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getSeminars = async (req, res) => {
    try {
        const seminars = await Seminar.findAll({
            attributes: ["seminarOID", "description", "assignmentkey", "phase", "createdAt"]
        });
        if (seminars) {
            res.status(200).send(seminars);
        } else {
            res.status(404).send({message: "Seminar not found."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({message: "Error while retrieving seminar."});
    }
}

/**
 * Go to next phase of seminar with given seminarOID.
 * If next phase is phase 4, sets the phase4paperOID for all users and assign reviewer.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const gotoNextPhase = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const seminarOID = req.params.seminarOID;

        if (!seminarOID) {
            return res.status(400).send({message: "SeminarOID is missing."});
        }

        const currentPhase = await Seminar.findByPk(seminarOID, {attributes: ["phase"]});
        if(currentPhase.phase+1 >= 8){
            return res.status(200).send({message: "Seminar is already in the last phase."});
        }

        if(currentPhase.phase+1 === 4){
            await setPhase4PaperOID(seminarOID, t);
            await assignReviewer(seminarOID, t);
            currentPhase.phase++;
        }

        //await t.rollback()
        //return res.status(500).send({message: ""});

        const seminar = await Seminar.update({phase: currentPhase.phase+1}, {where: {seminaroid: seminarOID}});

        // TODO affectedRows prüfen
        if (seminar[0] === 1) {
            // TODO handle phase change
            await t.commit();
            return res.status(200).send({message: "Phase successfully changed."});
        } else {
            await t.rollback();
            return res.status(500).send({message: "Error while changing phase."});
        }
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).send({message: "Error while changing phase."});
    }
}

/**
 * Returns all users of a seminar with their roleassignments and newest concept, with given seminarOID.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getUserList = async (req, res) => {
    try {
        const seminarOID = req.params.seminarOID;

        if (!seminarOID) {
            return res.status(400).send({message: "SeminarOID is missing."});
        }

        const users = await Seminar.findByPk(seminarOID,
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
                            attributes: ["conceptOID", "accepted", "userOIDSupervisor", "text", "attachmentOID", "feedback"],
                            include: [{
                                model: User,
                                as: "userOIDSupervisor_user",
                                attributes: ["userOID", "firstName", "lastName", "mail"],

                            },
                                {
                                    model: Attachment,
                                    as: "attachmentO",
                                    attributes: ["attachmentOID", "filename"]
                                }
                            ],
                            order: [['createdAt', 'DESC']], //Das neueste Concept
                            limit: 1
                        }]
                    }],
                }],
            });


        if (users) {
            return res.status(200).send(users);
        } else {
            return res.status(404).send({message: "Seminar not found."});
        }

    } catch
        (e) {
        console.log(e);
        return res.status(500).send({message: "Error while retrieving user."});
    }
}

/**
 * Updates the roleassignment of a user in a seminar.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const updateUserInSeminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userOid = req.body.userOID;
        const roleOid = req.body.roleOID;
        const seminarOid = req.body.seminarOID;
        //const supervisorOid = req.body.supervisorOID;

        if (!userOid || !roleOid || !seminarOid) {
            return res.status(400).send({message: "Missing required parameters."});
        }

        //change:
        // 1. roleassignment
        const assignment = await RoleAssignment.update(
            {roleOID: roleOid},
            {where: {userOID: userOid, seminarOID: seminarOid}},
            {transaction: t}
        );
        // 2. user
        /*
        const user = await User.update(
            {comment: comment},
            {where: {useroid: userOid}},
            {transaction: t}
        );
         */
        //3. concept
        //const newestConcept = await Concept.findOne({
        //    where: {userOIDStudent: userOid},
        //    order: [['createdAt', 'DESC']],
        //});
        //if (newestConcept && supervisorOid) {
        //    const concept = await Concept.update(
        //        {userOIDSupervisor: supervisorOid},
        //        {where: {conceptoid: newestConcept.conceptoid}},
        //        {transaction: t}
        //    );
        //}

        await t.commit();
        return res.status(200).send({message: "user successfully changed."});
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).send({message: "Error while changing user."});
    }
}


/**
 * Evaluates a concept with given conceptOID, accepted, feedback and userOIDSupervisor.
 * TODO Also sends mail to author.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const evaluateConcept = async (req, res) => {
    try {
        const conceptOID = req.body.conceptOID;
        const accepted = req.body.accepted;
        // TODO set note
        const feedback = req.body.feedback;
        const userOIDSupervisor = req.body.userOIDSupervisor;

        if(!conceptOID || accepted === null || accepted === undefined || (!userOIDSupervisor && accepted)){
            return res.status(400).send({message: "Missing required parameters."});
        }

        const concept = await Concept.update(
            {
                accepted: accepted,
                feedback: feedback,
                userOIDSupervisor: userOIDSupervisor
            },
            {where: {conceptOID: conceptOID}}
        );
        if (concept[0] === 1) {
            // TODO send mail to author
            return res.status(200).send({message: "Concept successfully evaluated."});
        } else {
            return res.status(500).send({message: "Error while evaluating concept."});
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send({message: "Error while evaluating concept."});
    }
}

/**
 * Creates a new seminar with a random assignmentkey.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const createSeminar = async (req, res) => {
    try {
        let existingSeminar = null;
        let key = null;
        do {
            key = crypto.randomUUID()

            //check if seminar already exists with this key
            existingSeminar = await Seminar.findOne({
                where: {assignmentkey: key}
            });
        } while (existingSeminar)

        const seminar = await Seminar.create({
            description: req.body.name,
            phase: 1,
            assignmentkey: key.toString()
        });
        return res.status(200).send(seminar);
    } catch (e) {
        console.log(e);
        return res.status(500).send({message: "Error while creating seminar."});
    }
}

/**
 * Returns all seminars assigned to the current user with their roleassignments.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getAssignedSeminars = async (req, res) => {
    try {
        const userOID = req.user.userOID;

        if (!userOID) {
            return res.status(400).send({message: "UserOID is missing."});
        }

        const seminars = await Seminar.findAll({
            include: [{
                model: RoleAssignment,
                as: "roleassignments",
                where: {userOID: userOID},
                attributes: ["roleOID"],
            }],
            attributes: ["seminarOID", "description", "phase"]
        });
        if (seminars) {
            res.status(200).send(seminars);
        } else {
            res.status(404).send({message: "Seminar not found."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({message: "Error while retrieving seminar."});
    }
}

/**
 * Returns a student with all uploaded concepts with attachments and paper with attachments.
 * Also returns the roleassignments phase4paperOID and phase7paperOID.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getStudent = async (req, res) => {
    try{
        // get student in seminar with all uploaded concepts with attachments and paper with attachments
        const seminarOID = req.params.seminarOID;
        const userOID = req.params.userOID;

        if (!seminarOID || !userOID) {
            return res.status(400).send({message: "SeminarOID or userOID is missing."});
        }

        const user = await User.findByPk(userOID, {
            include: [{
                model: Concept,
                as: "userOIDStudent_concepts",
                attributes: ["conceptOID", "accepted", "userOIDSupervisor", "text", "attachmentOID", "feedback", "createdAt"],
                where: {seminarOID: seminarOID},
                required: false,
                include: [{
                    model: User,
                    as: "userOIDSupervisor_user",
                    attributes: ["userOID", "firstName", "lastName", "mail"],

                },
                    {
                        model: Attachment,
                        as: "attachmentO",
                        attributes: ["attachmentOID", "filename"]
                    }
                ],
            },
                {
                    model: Paper,
                    as: "papers",
                    attributes: ["paperOID", "attachmentOID", "seminarOID", "createdAt"],
                    where: {seminarOID: seminarOID},
                    required: false,
                    include: [{
                        model: Attachment,
                        as: "attachmentO",
                        attributes: ["attachmentOID", "filename"]
                    }]
                },
                {
                    model: RoleAssignment,
                    as: "roleassignments",
                    attributes: ["phase4paperOID", "phase7paperOID"],
                    where: {seminarOID: seminarOID},
                    required: false,
                }

            ]
        });

        if(user){
            res.status(200).send(user);
        }else{
            res.status(404).send({message: "Student not found."});
        }
    }catch(e){
        console.log(e);
        res.status(500).send({message: "Error while retrieving student."});
    }
}

/**
 * Adds a user to a seminar associated with the given assignmentkey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const enterSeminar = async (req, res) => {
    try {
        const userOID = req.user.userOID;
        const assignmentkey = req.params.assignmentkey;

        if (!userOID || !assignmentkey) {
            return res.status(400).send({message: "UserOID or assignmentkey is missing."});
        }

        const seminar = await Seminar.findOne({
            where: {
                assignmentkey: assignmentkey
            }
        });

        if (!seminar) {
            res.status(404).json({error: 'Seminar not found'});
            return;
        }

        const [roleassignment, created] = await RoleAssignment.findOrCreate({
            where: {
                userOID: userOID,
                seminarOID: seminar.seminarOID,
            },
            defaults: {
                userOID: userOID,
                seminarOID: seminar.seminarOID,
                roleOID: 3,
            }
        });

        if(!created){
            res.status(400).json({error: 'User already in seminar'});
            return;
        }

        if (roleassignment) {
            res.status(200).json(roleassignment.seminarOID);
        } else {
            res.status(500).json({error: 'Internal Server Error'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports = {
    gotoNextPhase,
    getSeminar,
    getSeminars,
    getUserList,
    updateUserInSeminar,
    evaluateConcept,
    createSeminar,
    getAssignedSeminars,
    getStudent,
    enterSeminar
}
