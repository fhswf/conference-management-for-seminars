const jwt = require('jsonwebtoken');

const db = require("../models");
const Chatmessage = db.chatmessage;
const Concept = db.concept;
const Paper = db.paper;

const {isAccessTokenExpired, refreshAccessToken, introspectToken} = require("../util/TokenUtils");
const {
    userIsMemberOfSeminar,
    userRoleIsCourseAdmin,
    userRoleIsStudent,
    userRoleIsSupervisor
} = require("../controllers/roleassignmentController");

const {userIsChatParticipant} = require("../controllers/chatmessageController");
const {userIsAuthorOfConcept, conceptHasAttachment} = require("../controllers/conceptController");
const {userIsAuthorOfPaper, paperHasAttachment, getSeminarOIDOfPaper} = require("../controllers/paperController");
const {userIsReviewerOfPaper, userIsReviewerOfReviewOID} = require("../controllers/reviewController");
const {getAttachmentDetails} = require("../controllers/attachmentController");
const {userIsSystemAdmin} = require("../controllers/userController");

/**
 * Checks if the user is authenticated.
 * If user has logged in with OIDC, the access token will be checked for expiration.
 * If the access token is expired, a new one will be requested with the refresh token.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({msg: "Not authenticated"});
    }

    if(!req.user.authtype) {
        return res.status(400).json({msg: "No authtype"});
    }

    if (req.user.authtype === "lti") {
        return next();
    } else if (req.user.authtype === "oidc") {
        //alternativ: public key vom Server holen
        //jwt.verify(req.user.accessToken, `-----BEGIN PUBLIC KEY-----\n${process.env.KEYCLOAK_PUBLIC_KEY}\n-----END PUBLIC KEY-----`, (err, decodedToken) => {
        //    if (err) {
        //        console.error(err);
        //        return res.status(403).json({msg: "Token is not valid"});
        //    }
        //});

        let newAccessToken = null;
        if (isAccessTokenExpired(req.user.accessToken)) {
            console.log("refreshing token");
            try {
                newAccessToken = await refreshAccessToken(req.user.refreshToken);
                req.session.passport.user.accessToken = newAccessToken;
            } catch (e) {
                console.error(e);
                req.logout(() => {
                });
                return res.status(401).json({msg: "Logged out because token could not be refreshed"});
            }
        }

        // check if token is active
        //const tokenActive = newAccessToken ? await introspectToken(newAccessToken) : await introspectToken(req.user.accessToken);
        // setted to true, because if the introspectToken failed the user will be logged out
        const tokenActive = true;

        if (tokenActive) {
            return next();
        } else {
            req.logout(() => {
                return res.status(401).json({msg: "Logged out because token is not active"});
            });
        }
    }
}

/**
 * Checks if the user is a student in the seminar.
 * Needs the seminarOID in the request body or as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isStudentInSeminar(req, res, next) {
    try {
        const userOID = req.user.userOID;
        const seminarOID = req.params.seminarOID || req.body.seminarOID;

        if (!userOID || !seminarOID) {
            return res.status(400).json({msg: "No userOID or seminarOID"});
        }

        if (await userRoleIsStudent(userOID, seminarOID)) {
            return next();
        } else {
            return res.status(403).json({msg: "Not authorized"});
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({msg: "Internal server error"});
    }
}

/**
 * Checks if the user is a supervisor in the seminar.
 * Needs the seminarOID in the request body or as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isSupervisorInSeminar(req, res, next) {
    const userOID = req.user.userOID;
    const seminarOID = req.params.seminarOID || req.body.seminarOID;

    if(!userOID || !seminarOID) {
        return res.status(400).json({msg: "No userOID or seminarOID"});
    }

    if (await userIsMemberOfSeminar(userOID, seminarOID) && await userRoleIsSupervisor(userOID, seminarOID)) {
        return next();
    } else {
        return res.status(403).json({msg: "Not authorized"});
    }
}


/**
 * Checks if the user is a course admin in the seminar.
 * Needs the seminarOID in the request body or as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isCourseAdminInSeminar(req, res, next) {
    const userOID = req.user.userOID;
    const seminarOID = req.params.seminarOID || req.body.seminarOID;

    if(!userOID && !seminarOID) {
        return res.status(400).json({msg: "No userOID or seminarOID"});
    }

    if (await userRoleIsCourseAdmin(userOID, seminarOID)) {
        return next();
    } else {
        return res.status(403).json({msg: "Not authorized"});
    }
}


/**
 * Checks if the user is a course admin or a supervisor in the seminar with the given seminarOID or paperOID.
 * Needs the seminarOID or paperOID in the request body or as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isCourseAdminOrSupervisorInSeminar(req, res, next) {
    const userOID = req.user.userOID;
    let seminarOID = req.params.seminarOID || req.body.seminarOID;
    const paperOID = req.params.paperOID || req.body.paperOID;

    if(!userOID || (!seminarOID && !paperOID)) {
        return res.status(400).json({msg: "No userOID or seminarOID or paperOID"});
    }

    if (paperOID) {
        seminarOID = await getSeminarOIDOfPaper(paperOID);
    }

    if (await userRoleIsCourseAdmin(userOID, seminarOID) || await userRoleIsSupervisor(userOID, seminarOID)) {
        return next();
    } else {
        return res.status(403).json({msg: "Not authorized"});
    }
}

/**
 * Checks if the user is the author of the concept with the given conceptOID.
 * Needs the conceptOID in the request body or as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isConceptAuthor(req, res, next) {
    const userOID = req.user.userOID;
    const conceptOID = req.params.conceptOID;

    if(!userOID || !conceptOID) {
        return res.status(400).json({msg: "No userOID or conceptOID"});
    }

    if (await userIsAuthorOfConcept(userOID, conceptOID)) {
        return next();
    } else {
        return res.status(403).json({msg: "Not authorized"});
    }
}

/**
 * Checks if the user is permitted to access the file with the given attachmentOID.
 * Needs the attachmentOID as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isPermittedToAccessFile(req, res, next) {
    const userOID = req.user.userOID;
    const attachmentOID = req.params.attachmentOID;

    if(!userOID || !attachmentOID) {
        return res.status(400).json({msg: "No userOID or attachmentOID"});
    }

    const model = await getAttachmentDetails(attachmentOID);

    if (model instanceof Chatmessage) {
        if (await userIsChatParticipant(userOID, attachmentOID)) {
            return next();
        }
    } else if (model instanceof Concept) {
        if (await userIsAuthorOfConcept(userOID, model.conceptOID) ||
            await userRoleIsCourseAdmin(userOID, model.seminarOID) ||
            await userRoleIsSupervisor(userOID, model.seminarOID)) {
            return next();
        }
        //return res.status(403).json({msg: "concept"});
    } else if (model instanceof Paper) {
        if (await userIsAuthorOfPaper(userOID, model.paperOID) ||
            await userRoleIsCourseAdmin(userOID, model.seminarOID) ||
            await userRoleIsSupervisor(userOID, model.seminarOID) ||
            await userIsReviewerOfPaper(userOID, model.paperOID)) {
            return next();
        }
        //return res.status(403).json({msg: "paper"});
    }

    return res.status(403).json({msg: "Not authorized"});
}

/**
 * Checks if the user is a member of the seminar with the given seminarOID.
 * Needs the seminarOID in the request body or as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isMemberOfSeminar(req, res, next) {
    const userOID = req.user.userOID;
    const seminarOID = req.params.seminarOID || req.body.seminarOID;

    if(!userOID || !seminarOID) {
        return res.status(400).json({msg: "No userOID or seminarOID"});
    }

    if (await userIsMemberOfSeminar(userOID, seminarOID)) {
        return next();
    } else {
        return res.status(403).json({msg: "Not authorized"});
    }
}

async function isSystemAdmin(req, res, next) {
    const userOID = req.user.userOID;

    if(await userIsSystemAdmin(userOID)) {
        return next();
    }
}

/**
 * Checks if the user is a participant of the chat with the given chatmessageOID or reviewOID.
 * Needs the chatmessageOID and reviewOID in the request body or as a parameter.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isChatParticipant(req, res, next) {
    const userOID = req.user.userOID;
    const chatmessageOID = req.params.chatmessageOID || req.body.chatmessageOID;
    const reviewOID = req.params.reviewOID || req.body.reviewOID;

    if(!userOID || (!chatmessageOID && !reviewOID)) {
        return res.status(400).json({msg: "No userOID or chatmessageOID or reviewOID"});
    }

    if (await userIsChatParticipant(userOID, chatmessageOID, reviewOID)) {
        return next();
    } else {
        return res.status(403).json({msg: "Not authorized"});
    }
}

/**
 * Checks if the user is a reviewer or author of the paper with the given paperOID.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function isReviewerOrAuthorOfPaper(req, res, next) {
    if(!req.user.userOID || (!req.params.paperOID && !req.params.reviewOID) && (!req.body.paperOID && !req.body.reviewOID)) {
        return res.status(400).json({msg: "No userOID or paperOID or reviewOID"});
    }

    if(req.params.reviewOID){
        console.log("review");
    }

    if(userIsReviewerOfPaper || userIsAuthorOfPaper) {
        return next();
    }
    return res.status(403).json({msg: "Not authorized"});
}

async function isReviewer(req, res, next) {
    if(!req.user.userOID || !req.body.reviewOID) {
        return res.status(400).json({msg: "No userOID or reviewOID"});
    }

    if(userIsReviewerOfReviewOID) {
        return next();
    }
    return res.status(403).json({msg: "Not authorized"});
}

module.exports = {
    isAuthenticated,
    isStudentInSeminar,
    isSupervisorInSeminar,
    isCourseAdminInSeminar,
    isCourseAdminOrSupervisorInSeminar,
    isPermittedToAccessFile,
    isConceptAuthor,
    isMemberOfSeminar,
    isSystemAdmin,
    isChatParticipant,
    isReviewerOrAuthorOfPaper,
    isReviewer
};
