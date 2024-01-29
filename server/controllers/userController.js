const db = require("../models");

const Op = db.Sequelize.Op;
const User = db.user;
const Concept = db.concept;
const Status = db.status;
const RoleAssignment = db.roleassignment;
const OidcUser = db.oidcuser;
const Seminar = db.seminar;

/*
const getUserById = async (req, res) => {
    try {
        const user = await User.findAll({
            include: [{
                model: Concept,
                as: 'userOIDStudent_concepts',
                include: [{
                    model: Status,
                    as: 'statusO'
                }]
            }],
            where: {userOID: req.params.id}
        });
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};*/



/**
 * Assigns a user to a seminar with the given role and seminarOID.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const assignToSeminar = async (req, res) => {
    try {
        const userOID = req.body.userOID;
        const seminarOID = req.body.seminarOID;
        const roleOID = req.body.roleOID;

        if(!userOID || !seminarOID || !roleOID) {
            return res.status(400).json({error: 'Bad Request'});
        }

        const roleassignment = await RoleAssignment.create({
            userOID: userOID,
            seminarOID: seminarOID,
            roleOID: roleOID
        });
        // optional: send Mail to User
        res.status(200).json(roleassignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

/**
 * Returns true if the user is a system admin.
 * @param userOID
 * @returns {Promise<boolean|*>}
 */
async function userIsSystemAdmin(userOID) {
    if (!userOID) {
        return false;
    }

    const user = await User.findByPk(userOID);
    return user.isAdmin;
}

/**
 * Returns a list of Course Admins and Supervisors for a seminar with the given seminarOID.
 * @param seminarOID
 * @returns {Promise<*>}
 */
async function getCAdminsAndSupervisors(seminarOID) {
    const users = await User.findAll({
        include: [{
            model: RoleAssignment,
            as: 'roleassignments',
            where: {
                seminarOID: seminarOID,
                [Op.or]: [{ roleOID: 2 }, { roleOID: 1 }]
            },
            attributes: [],
        }],
    });

    return users;
}

/**
 * Return a User with the given userOID.
 * @param userOID
 * @returns {Promise<Model|null>}
 */
async function getUserWithOID(userOID) {
    const user = await User.findByPk(userOID);

    return user;
}

/**
 * Return a User with a concept with the given conceptOID.
 * @param conceptOID
 * @returns {Promise<Model|null>}
 */
async function getUserWithConceptOID(conceptOID) {
    const user = await User.findOne({
        include: [{
            model: Concept,
            as: 'userOIDStudent_concepts',
            where: {
                conceptOID: conceptOID
            },
            attributes: [],
        }],
    });

    return user;
}

/**
 * Return a list of supervisors for a seminar with the given seminarOID.
 * @param seminarOID
 * @returns {Promise<*>}
 */
async function getSupervisorUsersInSeminar(seminarOID){
    const user = await User.findAll({
        include: [{
            model: RoleAssignment,
            as: 'roleassignments',
            where: {
                seminarOID: seminarOID,
                roleOID: 2 // 2 = Supervisor
            },
            attributes: [],
        }],
    });

    return user;
}

async function getCourseAdminUserInSeminar(seminarOID){
    const user = await User.findAll({
        include: [{
            model: RoleAssignment,
            as: 'roleassignments',
            where: {
                seminarOID: seminarOID,
                roleOID: 1 // 1 = Course Admin
            },
            attributes: [],
        }],
    });

    return user;
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
            return res.status(400).send({msg: "UserOID is missing."});
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
            res.status(404).send({msg: "Seminar not found."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({msg: "Error while retrieving seminar."});
    }
}

module.exports = {
    //getUserById,
    assignToSeminar,
    userIsSystemAdmin,
    getCAdminsAndSupervisors,
    getUserWithOID,
    getUserWithConceptOID,
    getSupervisorUsersInSeminar,
    getCourseAdminUserInSeminar,
    getAssignedSeminars
}
