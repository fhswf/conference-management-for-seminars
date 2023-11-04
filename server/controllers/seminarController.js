

const db = require("../models");

const Seminar = db.seminar;

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
    setPhase,
}