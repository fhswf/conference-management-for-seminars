const crypto = require('crypto');
const db = require("../models");
const {assignReviewer} = require("./reviewController");
const {sendMailPhaseChanged, sendMailConceptEvaluated} = require("../utils/mailer");
//const {getUser, getUserWithConceptOID} = require("./userController");

const Op = db.Sequelize.Op;
const Seminar = db.seminar;
const RoleAssignment = db.roleassignment;
const User = db.user;
const Concept = db.concept;
const Attachment = db.attachment;
const Paper = db.paper;
const OidcUser = db.oidcuser;

/**
 * Returns the seminar with the given seminarOID.
 * The user must be assigned to the seminar.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the seminar or an error response.
 */
const getSeminar = async (req, res) => {
    try {
        if (!req.params.seminarOID) {
            return res.status(400).json({error: 'seminarOID is missing'});
        }

        const userOID = req.user.userOID;
        const seminarOID = req.params.seminarOID;
        const seminar = await Seminar.findByPk(seminarOID,
            {
                include: [{
                    model: RoleAssignment,
                    as: "roleassignments",
                    where: {userOID: userOID},
                    required: true,
                }],
                attributes: ["description", "phase"]
            },
        );

        if (seminar) {
            res.status(200).send(seminar);
        } else {
            res.status(404).send({msg: "Seminar not found."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({msg: "Error while retrieving seminar."});
    }
}

/**
 * Returns all existing seminars in database.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the list of seminars or an error response.
 */
const getSeminars = async (req, res) => {
    try {
        const seminars = await Seminar.findAll({
            attributes: ["seminarOID", "description", "assignmentkey", "phase", "createdAt"]
        });
        if (seminars) {
            res.status(200).send(seminars);
        } else {
            res.status(404).send({msg: "Seminar not found."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({msg: "Error while retrieving seminar."});
    }
}

/**
 * Go to next phase of seminar with given seminarOID.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with a success message or an error response.
 */
const gotoNextPhase = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const seminarOID = req.params.seminarOID;

        if (!seminarOID) {
            await t.rollback();
            return res.status(400).send({msg: "SeminarOID is missing."});
        }

        const currentPhase = await Seminar.findByPk(seminarOID, {attributes: ["phase"]});
        if (currentPhase.phase + 1 >= 8) {
            await t.rollback();
            return res.status(200).send({msg: "Seminar is already in the last phase."});
        }

        if (currentPhase.phase + 1 === 4) {
            await assignReviewer(seminarOID, t);
            currentPhase.phase++;
        }

        //throw new Error("Test");

        //const seminar = await Seminar.update({phase: currentPhase.phase + 1}, {where: {seminaroid: seminarOID}, transaction: t});
        const [updatedRows] = await Seminar.update({phase: currentPhase.phase + 1}, {where: {seminaroid: seminarOID}, transaction: t});

        //if (seminar[0] === 1) {
        if (updatedRows === 1) {
            //send mail to all users of seminar
            const users = await User.findAll({
                include: [{
                    model: RoleAssignment,
                    as: "roleassignments",
                    where: {
                        seminarOID: seminarOID,
                    },
                }],
            });
            await t.commit();
            const updatedSeminar = await Seminar.findByPk(seminarOID);

            sendMailPhaseChanged(users, updatedSeminar)

            return res.status(200).send({msg: "Phase successfully changed."});
        } else {
            await t.rollback();
            return res.status(500).send({msg: "Error while changing phase."});
        }
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).send({msg: "Error while changing phase."});
    }
}

/**
 * Returns a list of oidc users that can be assigned to a seminar.
 *
 * @param {Object} req - The HTTP request object containing the seminarOID.
 * @param {Object} res - The HTTP response object for sending the list of supervisors or an error response.
 * @returns {Promise<void>} - A Promise that resolves with the list of supervisors or an error response.
 */
const getAddableUsers = async (req, res) => {
    try {
        const seminarOID = req.params.seminarOID;

        if (!seminarOID){
            return res.status(400).json({error: 'Bad Request'});
        }

        const seminar = await Seminar.findByPk(seminarOID);

        if (!seminar) {
            return res.status(404).json({error: 'Seminar not found'});
        }

        const users = await User.findAll({
            where: {
                userOID: {
                    [Op.notIn]: db.sequelize.literal(`(SELECT userOID FROM roleassignment WHERE seminarOID = ${seminarOID})`)
                }
            },
            include: [{
                model: OidcUser,
                as: 'oidcusers',
                attributes: [],
                required: true
            }],
            attributes: ["userOID", "firstname", "lastname", "mail"],
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

/**
 * Returns all users of a seminar with their roleassignments and newest concept, with given seminarOID.
 *
 * @param {Object} req - The HTTP request object containing the seminarOID.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the list of users or an error response.
 */
const getUserList = async (req, res) => {
    try {
        const seminarOID = req.params.seminarOID;

        if (!seminarOID) {
            return res.status(400).send({msg: "SeminarOID is missing."});
        }

        const users = await Seminar.findByPk(seminarOID,
            {
                include: [{
                    model: RoleAssignment,
                    as: "roleassignments",
                    include: [{
                        model: User,
                        as: "userO",
                        include: [{
                            model: Concept,
                            as: "userOIDStudent_concepts",
                            include: [{
                                model: User,
                                as: "userOIDSupervisor_user",
                                attributes: ["userOID", "firstname", "lastname", "mail"],

                            },
                                {
                                    model: Attachment,
                                    as: "attachmentO",
                                    attributes: ["attachmentOID", "filename"]
                                }
                            ],
                            where: {seminarOID: seminarOID},
                            order: [['createdAt', 'DESC']], //Das neueste Concept
                            limit: 1
                        }]
                    }],
                }],
            });


        if (users) {
            return res.status(200).send(users);
        } else {
            return res.status(404).send({msg: "Seminar not found."});
        }

    } catch
        (e) {
        console.log(e);
        return res.status(500).send({msg: "Error while retrieving user."});
    }
}

/**
 * Updates the roleassignment of a user in a seminar.
 *
 * @param {Object} req - The HTTP request object containing userOID, roleOID, and seminarOID.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with a success message or an error response.
 */
const updateUserInSeminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.body.userOID;
        const roleOID = req.body.roleOID;
        const seminarOID = req.body.seminarOID;

        if (!userOID || !roleOID || !seminarOID) {
            await t.rollback();
            return res.status(400).send({msg: "Missing required parameters."});
        }

        if (roleOID < 1 || roleOID > 3) {
            await t.rollback();
            return res.status(400).json({error: 'Invalid roleOID'});
        }

        const userInSeminar = await RoleAssignment.findOne({
            where: {
                userOID: userOID,
                seminarOID: seminarOID,
            }
        });
        if (!userInSeminar) {
            await t.rollback();
            return res.status(404).send({msg: "User not found in seminar."});
        }

        //const phase = await Seminar.findByPk(seminarOID, {attributes: ["phase"]});

        const supervisorHasAssignedConcepts = await Concept.findOne({
            where: {
                userOIDSupervisor: userOID,
                seminarOID: seminarOID
            }
        });

        if (supervisorHasAssignedConcepts) {
            await t.rollback();
            return res.status(409).send({msg: "Supervisor has already assigned concepts."});
        }

        const assignment = await RoleAssignment.update(
            {roleOID: roleOID},
            {where: {userOID: userOID, seminarOID: seminarOID}, transaction: t},
        );

        await t.commit();
        return res.status(200).send({msg: "user successfully changed."});
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).send({msg: "Error while changing user."});
    }
}


/**
 * Evaluates a concept with given conceptOID, accepted, feedback and userOIDSupervisor.
 * Also sends mail to author.
 *
 * @param {Object} req - The HTTP request object containing concept evaluation data.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the evaluated concept or an error response.
 */
const evaluateConcept = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const conceptOID = req.body.conceptOID;
        const accepted = req.body.accepted;
        const feedback = req.body.feedback;
        const userOIDSupervisor = req.body.userOIDSupervisor;

        if (!conceptOID || accepted === null || accepted === undefined || (!userOIDSupervisor && accepted)) {
            await t.rollback();
            return res.status(400).send({msg: "Missing required parameters."});
        }

        const concept = await Concept.findByPk(conceptOID);

        if (!concept) {
            return res.status(404).send({msg: "Concept not found."});
        }

        if(concept.accepted === true) {
            await t.rollback();
            return res.status(409).send({msg: "Concept already accepted."});
        }

        const givenUserIsSupervisor = await RoleAssignment.findOne({
            where: {
                userOID: userOIDSupervisor,
                roleOID: 2,
                seminarOID: concept.seminarOID
            }
        });

        if (!givenUserIsSupervisor) {
            await t.rollback();
            return res.status(409).send({msg: "User is not a supervisor of this seminar."});
        }

        //const concept = await Concept.update(
        const [updatedRows] = await Concept.update(
            {
                accepted: accepted,
                feedback: feedback,
                userOIDSupervisor: userOIDSupervisor
            },
            {where: {conceptOID: conceptOID}, transaction: t}
        );
        //if (concept[0] === 1) {
        if (updatedRows === 1) {
            const conc = await getConceptInformation(conceptOID);
            await t.commit();

            sendMailConceptEvaluated(conc)

            const concept = await Concept.findByPk(conceptOID);

            return res.status(200).send(concept);
        } else {
            return res.status(500).send({msg: "Error while evaluating concept."});
        }
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).send({msg: "Error while evaluating concept."});
    }
}

/**
 * Returns the Concept with the given conceptOID.
 * The Object contains all relevant information about the Concept.
 * Relevant for sending mail
 *
 * @param {number} conceptOID - The conceptOID of the Concept to be found.
 * @returns {Promise<Object|null>}
 */
async function getConceptInformation(conceptOID) {
    const concept = await Concept.findOne({
        where: {
            conceptOID: conceptOID
        },
        include: [{
            model: Attachment,
            as: 'attachmentO',
            attributes: ['filename'],
        },
            {
                model: User,
                as: 'userOIDSupervisor_user',
                attributes: ["userOID", "firstname", "lastname"]
            },
            {
                model: User,
                as: 'userOIDStudent_user',
                attributes: ["userOID", "firstname", "lastname", "mail"]
            },
            {
                model: Seminar,
                as: 'seminarO',
                attributes: ["seminarOID", "description"]
            }
        ],
    });

    return concept;
}

/**
 * Creates a new seminar with a random assignmentkey.
 *
 * @param {Object} req - The HTTP request object containing the seminar name.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the created seminar or an error response.
 */
const createSeminar = async (req, res) => {
    try {
        const name = req.body.name;

        if (!name) {
            return res.status(400).send({msg: "Name is missing."});
        }

        if (name.length > 32) {
            return res.status(400).send({msg: "Name is too long."});
        }

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
        return res.status(500).send({msg: "Error while creating seminar."});
    }
}

/**
 * Returns a student with all uploaded concepts with attachments and paper with attachments.
 * Also returns the roleassignments phase3paperOID and phase7paperOID.
 *
 * @param {Object} req - The HTTP request object containing seminarOID and userOID.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A Promise that resolves with the student's information or an error response.
 */
const getStudent = async (req, res) => {
    try {
        // get student in seminar with all uploaded concepts with attachments and paper with attachments
        const seminarOID = req.params.seminarOID;
        const userOID = req.params.userOID;

        if (!seminarOID || !userOID) {
            return res.status(400).send({msg: "SeminarOID or userOID is missing."});
        }

        const isMember = await RoleAssignment.findOne({
            where: {
                userOID: userOID,
                seminarOID: seminarOID,
            }
        });

        if (!isMember) {
            return res.status(403).send({msg: "User is not a member of this seminar."});
        }

        const user = await User.findByPk(userOID, {
            include: [{
                model: Concept,
                as: "userOIDStudent_concepts",
                attributes: ["conceptOID", "accepted", "userOIDSupervisor", "text", "attachmentOID", "feedback", "createdAt", "seminarOID"],
                where: {seminarOID: seminarOID},
                required: false,
                include: [{
                    model: User,
                    as: "userOIDSupervisor_user",
                    attributes: ["userOID", "firstname", "lastname", "mail"],

                },
                    {
                        model: Attachment,
                        as: "attachmentO",
                        attributes: ["attachmentOID", "filename"]
                    },
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
                    attributes: ["phase3paperOID", "phase7paperOID"],
                    where: {seminarOID: seminarOID},
                    required: false,
                }

            ]
        });

        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send({msg: "Student not found."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({msg: "Error while retrieving student."});
    }
}

/**
 * Adds a user to a seminar associated with the given assignmentkey.
 *
 * @param {Object} req - The HTTP request object containing the userOID and assignmentkey.
 * @param {Object} res - The HTTP response object for sending the result.
 * @returns {Promise<void>} - A Promise that resolves after entering the seminar and assigning a role or an error response.
 */
const enterSeminar = async (req, res) => {
    try {
        const userOID = req.user.userOID;
        const assignmentkey = req.params.assignmentkey;

        if (!userOID || !assignmentkey) {
            return res.status(400).send({msg: "UserOID or assignmentkey is missing."});
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
                roleOID: 3, // 3 = Student, default role
            }
        });

        if (!created) {
            res.status(400).json({error: 'User already in seminar'});
            return;
        }

        if (roleassignment) {
            res.status(200).json({seminarOID: roleassignment.seminarOID});
        } else {
            res.status(500).json({error: 'Internal Server Error'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Returns a list of supervisors for a seminar with the given seminarOID.
 *
 * @param {Object} req - The HTTP request object containing the seminarOID.
 * @param {Object} res - The HTTP response object for sending the list of supervisors or an error response.
 * @returns {Promise<void>} - A Promise that resolves with the list of supervisors or an error response.
 */
const getSupervisorList = async (req, res) => {
    try {
        const seminarOID = req.params.seminarOID;

        if (!seminarOID){
            return res.status(400).json({error: 'Bad Request'});
        }

        const supervisors = await User.findAll({
            include: [{
                model: RoleAssignment,
                as: 'roleassignments',
                where: {
                    seminarOID: seminarOID,
                    roleOID: 2 // 2 = Supervisor
                },
                attributes: [],
            }],
            attributes: ["userOID", "firstname", "lastname", "mail"],
        });
        res.status(200).json(supervisors);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Retrieves the phase of a seminar based on its OID.
 *
 * @param {number} seminarOID - The OID of the seminar to fetch the phase for.
 * @returns {Promise<number|null>} - A Promise that resolves with the phase number of the seminar or null if the seminarOID is missing or not found.
 * @throws {Error} - Throws an error if the seminarOID is missing.
 */
async function getPhaseOfSeminar(seminarOID) {
    if(!seminarOID) {
        throw new Error("SeminarOID is missing.");
    }

    const seminar = await Seminar.findByPk(seminarOID, {attributes: ["phase"]});

    if (seminar) {
        return seminar.phase;
    } else {
        return null;
    }
}

module.exports = {
    gotoNextPhase,
    getSeminar,
    getSeminars,
    getAddableUsers,
    getUserList,
    updateUserInSeminar,
    evaluateConcept,
    createSeminar,
    getStudent,
    enterSeminar,
    getSupervisorList,
    getPhaseOfSeminar
}
