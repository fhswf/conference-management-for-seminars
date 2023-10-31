function isAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }else{
        res.status(401).json({msg: "Not authenticated"});
    }
}

function isInstructor (req, res, next) {
    if (req.user.lti.roles.includes("Instructor")) {
        return next();
    }else{
        res.status(401).json({msg: "Not authorized"});
    }
}

function isStudent (req, res, next) {
    if (req.user.lti.roles.includes("Learner")) {
        return next();
    }else{
        res.status(401).json({msg: "Not authorized"});
    }
}

module.exports = {
    isAuthenticated,
    isInstructor,
    isStudent
};
