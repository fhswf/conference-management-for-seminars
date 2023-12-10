const db = require("../models");

const Op = db.Sequelize.Op;
const User = db.user;
const Concept = db.concept;
const Status = db.status;
const RoleAssignment = db.roleassignment;
const OidcUser = db.oidcuser;

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
 * Returns a list of supervisors for a seminar with the given seminarOID.
 * @param req
 * @param res
 * @returns {Promise<void>}
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
            attributes: ["userOID", "firstName", "lastName"],
        });
        res.status(200).json(supervisors);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


/**
 * Returns a list of oidc users that can be assigned to a seminar.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getAddableUsers = async (req, res) => {
    try {
        const seminarOID = req.params.seminarOID;
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
            attributes: ["userOID", "firstName", "lastName", "mail"],
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

/**
 * Assigns a user to a seminar with the given role and seminarOID.
 * TODO also send mail to user
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
        // TODO send Mail to User
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

module.exports = {
    //getUserById,
    getSupervisorList,
    getAddableUsers,
    assignToSeminar,
    userIsSystemAdmin
}
