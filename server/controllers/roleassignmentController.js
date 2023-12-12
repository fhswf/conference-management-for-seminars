const db = require("../models");

const RoleAssignment = db.roleassignment;
const User = db.user;
const Paper = db.paper;
const Concept = db.concept;

/**
 * Sets phase4paperOID for all students of a seminar to the newest paper they have uploaded.
 * @param seminarOID
 * @param t
 * @returns {Promise<void>}
 */
async function setPhase4PaperOID(seminarOID, t) {
    const user = await User.findAll({
        include: [{
            model: RoleAssignment,
            as: "roleassignments",
            where: {
                seminarOID: seminarOID,
                roleOID: 3,
            },
        }],
    });

    for(const user1 of user) {
        const newestPaper = await Paper.findOne({
            where: {
                authorOID: user1.userOID,
                seminarOID: seminarOID,
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        if (newestPaper) {
            await RoleAssignment.update({
                phase4paperOID: newestPaper.paperOID
            }, {
                where: {
                    userOID: user1.userOID,
                    seminarOID: seminarOID,
                }, transaction: t
            });
        }
    }
}

/*
async function setPhase4PaperOID(t, paperOID, userOID, seminarOID) {
    await RoleAssignment.update({
        phase4paperOID: paperOID
    }, {
        where: {
            userOID: userOID,
            seminarOID: seminarOID,
        }, transaction: t
    });

    return true;
}
* */

/**
 * Sets phase7paperOID of a student to the given data.
 * @param t
 * @param paperOID
 * @param userOID
 * @param seminarOID
 * @returns {Promise<boolean>}
 */
async function setPhase7PaperOID(t, paperOID, userOID, seminarOID){
    const [updatedRows] = await RoleAssignment.update({
        phase7paperOID: paperOID
    }, {
        where: {
            userOID: userOID,
            seminarOID: seminarOID,
            phase7paperOID: null
        }, transaction: t
    });

    if (updatedRows === 0) {
        console.log("Phase 7 Paper already set");
        return false;
    }
    return true;
}

/**
 * Checks if a user is a member of a seminar.
 * @param userOID
 * @param seminarOID
 * @returns {Promise<boolean>}
 */
async function userIsMemberOfSeminar(userOID, seminarOID) {
    const roleAssignment = await RoleAssignment.findOne({
        where: {
            userOID: userOID,
            seminarOID: seminarOID
        }
    });
    return roleAssignment !== null;
}

/**
 * Checks if a user is a student of a seminar.
 * @param userOID
 * @param seminarOID
 * @returns {Promise<boolean>}
 */
async function userRoleIsStudent(userOID, seminarOID) {
    const roleAssignment = await RoleAssignment.findOne({
        where: {
            userOID: userOID,
            seminarOID: seminarOID
        }
    });
    return roleAssignment.roleOID === 3;
}

/**
 * Checks if a user is a supervisor of a seminar.
 * @param userOID
 * @param seminarOID
 * @returns {Promise<boolean>}
 */
async function userRoleIsSupervisor(userOID, seminarOID) {
    const roleAssignment = await RoleAssignment.findOne({
        where: {
            userOID: userOID,
            seminarOID: seminarOID
        }
    });
    return roleAssignment.roleOID === 2;
}

/**
 * Checks if a user is a course admin of a seminar.
 * @param userOID
 * @param seminarOID
 * @returns {Promise<boolean>}
 */
async function userRoleIsCourseAdmin(userOID, seminarOID) {
    const roleAssignment = await RoleAssignment.findOne({
        where: {
            userOID: userOID,
            seminarOID: seminarOID
        }
    });
    return roleAssignment.roleOID === 1;
}

module.exports = {
    setPhase4PaperOID,
    setPhase7PaperOID,
    userIsMemberOfSeminar,
    userRoleIsStudent,
    userRoleIsSupervisor,
    userRoleIsCourseAdmin
}
