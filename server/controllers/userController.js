const db = require("../models");

const Op = db.Sequelize.Op;
const User = db.user;
const Concept = db.concept;
const Status = db.status;
const RoleAssignment = db.roleassignment;
const OidcUser = db.oidcuser;
const Seminar = db.seminar;

/**
 * Assigns a user to a seminar with the given role and seminarOID.
 *
 * @param {Object} req - The HTTP request object containing userOID, seminarOID, and roleOID.
 * @param {Object} res - The HTTP response object for sending the roleassignment data or an error response.
 * @returns {Promise<void>} - A Promise that resolves with the created roleassignment data or an error response.
 */
const assignToSeminar = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userOID = req.body.userOID;
        const seminarOID = req.body.seminarOID;
        const roleOID = req.body.roleOID;

        if(!userOID || !seminarOID || !roleOID) {
            await t.rollback();
            return res.status(400).json({error: 'Missing parameters.'});
        }

        if (roleOID < 1 || roleOID > 3) {
            await t.rollback();
            return res.status(400).json({error: 'Invalid roleOID'});
        }

        const user = await User.findByPk(userOID);
        if(!user) {
            await t.rollback();
            return res.status(404).json({error: 'User not found.'});
        }

        const seminar = await Seminar.findByPk(seminarOID);
        if(!seminar) {
            await t.rollback();
            return res.status(404).json({error: 'Seminar not found.'});
        }

        const [roleassignment, created] = await RoleAssignment.findOrCreate({
            where: {
                userOID: userOID,
                seminarOID: seminarOID
            },
            defaults: {
                userOID: userOID,
                seminarOID: seminarOID,
                roleOID: roleOID
            },
            transaction: t
        });

        if(!created) {
            await t.rollback();
            return res.status(409).json({error: 'User already assigned to this seminar.'});
        }

        // optional: send Mail to User

        await t.commit();
        res.status(200).json(roleassignment);
    } catch (error) {
        await t.rollback();
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
 * @returns {Promise<Object|null>}
 */
async function getUserWithOID(userOID) {
    const user = await User.findByPk(userOID);

    return user;
}

/**
 * Return a User with a concept with the given conceptOID.
 * @param conceptOID
 * @returns {Promise<Object|null>}
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
 * @param {number} seminarOID
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

/**
 * Retrieves a list of users who are course admins in a specific seminar based on seminarOID.
 *
 * @param {string} seminarOID - The seminar's identifier.
 * @returns {Promise<*>} - A Promise that resolves with an array of users who are course admins in the specified seminar.
 */
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
 *
 * @param {Object} req - The HTTP request object containing userOID.
 * @param {Object} res - The HTTP response object for sending the list of assigned seminars or an error response.
 * @returns {Promise<void>} - A Promise that resolves with the list of assigned seminars or an error response.
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
    assignToSeminar,
    userIsSystemAdmin,
    getCAdminsAndSupervisors,
    getUserWithOID,
    getUserWithConceptOID,
    getSupervisorUsersInSeminar,
    getCourseAdminUserInSeminar,
    getAssignedSeminars
}
