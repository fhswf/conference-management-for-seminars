const db = require("../models");

const RoleAssignment = db.roleassignment;
const User = db.user;
const Paper = db.paper;
const Concept = db.concept;

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

module.exports = {
    setPhase4PaperOID,
    setPhase7PaperOID
}
