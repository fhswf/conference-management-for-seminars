const db = require("../models");

const RoleAssignment = db.roleassignment;
const User = db.user;
const Paper = db.paper;
const Concept = db.concept;

/**
 * Checks if a user is a member of a seminar.
 *
 * @param {number} userOID - The user's identifier.
 * @param {number} seminarOID - The seminar's identifier.
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the user is a member, or `false` if not.
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
 * Checks if a user's role in a specific seminar is a student based on userOID and seminarOID.
 *
 * @param {number} userOID - The user's identifier.
 * @param {number} seminarOID - The seminar's identifier.
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the user's role is student, or `false` if not.
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
 * Checks if a user's role in a specific seminar is a supervisor based on userOID and seminarOID.
 *
 * @param {number} userOID - The user's identifier.
 * @param {number} seminarOID - The seminar's identifier.
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the user's role is supervisor, or `false` if not.
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
 * Checks if a user's role in a specific seminar is a course administrator based on userOID and seminarOID.
 *
 * @param {number} userOID - The user's identifier.
 * @param {number} seminarOID - The seminar's identifier.
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if the user's role is course administrator, or `false` if not.
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
