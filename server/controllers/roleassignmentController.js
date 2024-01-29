const db = require("../models");

const RoleAssignment = db.roleassignment;
const User = db.user;
const Paper = db.paper;
const Concept = db.concept;

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
    if(!roleAssignment) return false;
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
    if(!roleAssignment) return false;
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
    if(!roleAssignment) return false;
    return roleAssignment.roleOID === 1;
}

module.exports = {
    userIsMemberOfSeminar,
    userRoleIsStudent,
    userRoleIsSupervisor,
    userRoleIsCourseAdmin
}
