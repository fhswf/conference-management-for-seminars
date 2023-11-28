const db = require("../models");

const Op = db.Sequelize.Op;
const User = db.user;
const Concept = db.concept;
const Status = db.status;
const RoleAssignment = db.roleassignment;
const OidcUser = db.oidcuser;

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
};

const getSupervisorList = async (req, res) => {
    // TODO check if USer is member of requested Seminar
    try {
        const supervisors = await User.findAll({
            include: [{
                model: RoleAssignment,
                as: 'roleassignments',
                where: {
                    seminarOID: req.params.seminarOID,
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
            attributes: ["userOID", "firstname", "lastname", "mail", "comment"],
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};


//TODO check if User isAdmin
const assignToSeminar = async (req, res) => {
    try {
        const userOID = req.body.userOID;
        const seminarOID = req.body.seminarOID;
        const roleOID = req.body.roleOID;
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


module.exports = {
    getUserById,
    getSupervisorList,
    getAddableUsers,
    assignToSeminar
}
