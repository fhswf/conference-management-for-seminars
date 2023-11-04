const db = require("../models");

const Seminar = db.seminar;
const RolLeAssignment = db.rolleassignment;

const getSeminar = async (req, res) => {
    try {
        const seminar = await Seminar.findOne({
                where: {seminaroid: 1}, // TODO req.user.lti.context_id
                include: [{
                    model: RolLeAssignment,
                    as: "rolleassignments",
                    where: {personOID: 1}, // TODO req.user.personOID
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

const setPhase = async (req, res) => {
    try {
        const seminaroid = req.params.seminaroid; // TODO req.user.lti.context_id
        const phase = req.body.phase;
        const seminar = await Seminar.update({phase: phase}, {where: {seminaroid: seminaroid}});

        if (seminar[0] === 1) {
            res.status(200).send({message: "Phase successfully changed."});
        } else {
            res.status(500).send({message: "Error while changing phase."});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({message: "Error while changing phase."});
    }
}

module.exports = {
    getSeminar,
    setPhase,
}