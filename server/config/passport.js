const passport = require('passport');
const LTIStrategy = require('passport-lti');
const OpenIDConnectStrategy = require('passport-openidconnect');

const db = require("../models");
const crypto = require("crypto");
const User = db.user;
const RoleAssignment = db.roleassignment;
const Seminar = db.seminar;
const OidcUser = db.oidcuser;
const LtiUser = db.ltiuser
const ContextToSeminar = db.contexttoseminar;

async function addOrUpdateUser(lti, t) {
    let ltiUser = await LtiUser.findOne({
        where: {
            LtiUserOID: lti.user_id,
            consumerURL: lti.tool_consumer_instance_guid
        }
    });

    if (!ltiUser) {
        // Create a new User
        const user = await User.create({
            firstName: lti.lis_person_name_given,
            lastName: lti.lis_person_name_family,
            mail: lti.lis_person_contact_email_primary,
            isAdmin: false,
        }, {transaction: t});

        // Create LtiUser
        ltiUser = await LtiUser.create({
            LtiUserOID: lti.user_id,
            consumerURL: lti.tool_consumer_instance_guid,
            userOID: user.userOID,
        }, {transaction: t});
    }
    // only the User table should be updated
    const [user, created] = await User.findOrCreate({
        where: {
            userOID: ltiUser.userOID
        },
        defaults: {
            firstName: lti.lis_person_name_given,
            lastName: lti.lis_person_name_family,
            mail: lti.lis_person_contact_email_primary,
            isAdmin: false,
        }, transaction: t
    });

    if (!created) {
        // update user
        user.firstName = lti.lis_person_name_given;
        user.lastName = lti.lis_person_name_family;
        user.mail = lti.lis_person_contact_email_primary;
        await user.save({transaction: t});
    }

    return user;
}

async function addSeminar(lti, t) {
    const key = crypto.randomUUID()

    const map = await ContextToSeminar.findOne({
        where: {
            LtiContextId: lti.context_id,
            consumerURL: lti.tool_consumer_instance_guid
        }
    });

    if(!map){
        //1. erstelle seminar
        const seminar = await Seminar.create({
            description: lti.context_title,
            phase: 1,
            assignmentkey: key
        } , {transaction: t});

        //2. erstelle mapping
        const mapping = await ContextToSeminar.create({
            LtiContextId: lti.context_id,
            consumerURL: lti.tool_consumer_instance_guid,
            seminarOID: seminar.seminarOID
        }, {transaction: t});

        return seminar;
    }

    const seminar = await Seminar.findOne({
        where: {
            seminarOID: map.seminarOID
        }
    });

    // TODO delete
    // seminar.description = lti.context_title;
    // //seminar.phase = 1;
    // await seminar.save({transaction: t});

    return seminar;
}

// TODO
function getUserIdfromLti(lti) {

}

async function addRoleAssignment(lti, user, seminar, t) {
    const [assignment, created] = await RoleAssignment.findOrCreate({
        where: {
            userOID: user.userOID,
            seminarOID: seminar.seminarOID
        },
        defaults: {
            userOID: user.userOID,
            seminarOID: seminar.seminarOID,
            roleOID: mapLtiRoles(lti.roles)
        },
        transaction: t
    });

    return assignment;
}

function mapLtiRoles(roles) {
    //if(roles[0] === 'Admin') return 1; //moodle role does not exist
    if (roles[0] === 'Instructor') return 2;
    if (roles[0] === 'Learner') return 3;
    return null;
}

const ltiVerifyCallback = async (username, lti, done) => {
    const t = await db.sequelize.transaction();

    try {
        const user = await addOrUpdateUser(lti, t);

        let seminar = null;
        if (lti.custom_seminar_key) {
            //join seminar
            seminar = await Seminar.findOne({
                where: {
                    key: lti.custom_seminar_key
                }
            });
            if (!seminar) {
                console.log("invalid seminar key")
                return done(null, false);
            }
        } else {
            //create seminar
            seminar = await addSeminar(lti, t);
        }

        await addRoleAssignment(lti, user, seminar, t); // TODO only if phase 1 ?

        var userJson = {
            id: user.userOID,
            lti: lti,
            authtype: "lti"
        };

        await t.commit();

        return done(null, userJson);
    } catch (e) {
        console.log(e);
        await t.rollback();
        return done(e);
    }
}

const ltiStrategy = new LTIStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    passReqToCallback: true,
}, ltiVerifyCallback);

async function oidcVerifyCallback(issuer, profile, context, idToken, accessToken, refreshToken, params, done) {
    const t = await db.sequelize.transaction();

    try {
        let cred = await OidcUser.findOne({
            where: {
                subject: profile.id
            }
        });

        if (!cred) {
            // Create a new User
            const user = await User.create({
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                mail: profile.emails && profile.emails[0]?.value || "",
                isAdmin: false,
            }, {transaction: t});

            // Create OidcUser
            cred = await OidcUser.create({
                subject: profile.id,
                provider: issuer,
                userOID: user.userOID,
                idToken: idToken,
            }, {transaction: t});
        }
        // only the User table should be updated
        const [user, created] = await User.findOrCreate({
            where: {
                userOID: cred.userOID
            },
            defaults: {
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                mail: profile.emails && profile.emails[0]?.value || "",
                isAdmin: false,
            }, transaction: t
        });

        if (!created) {
            // update user
            user.firstName = profile.name?.givenName || "";
            user.lastName = profile.name?.familyName || "";
            user.mail = profile.emails && profile.emails[0]?.value || "";
            await user.save({transaction: t});
        }

        if (!user) {
            return done(null, false);
        }

        await t.commit();

        return done(null, {
            id: user.userOID,
            lti: null,
            authtype: "oidc",
            accessToken: accessToken,
            refreshToken: refreshToken,
            idToken: idToken
        });
    } catch (err) {
        await t.rollback();
        return done(err);
    }
}


passport.use(ltiStrategy);

passport.use(new OpenIDConnectStrategy({
    issuer: process.env.ISSUER,
    authorizationURL: process.env.AUTHORIZATION_URL,
    tokenURL: process.env.TOKEN_URL,
    userInfoURL: process.env.USERINFO_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
}, oidcVerifyCallback));


passport.serializeUser((user, done) => {
    done(null, {
        userOID: user.id,
        lti: user.lti,
        authtype: user.authtype,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        idToken: user.idToken
    });
});

passport.deserializeUser((serializedUser, done) => {
    User.findByPk(serializedUser.userOID)
        .then((user) => {
            if (user) {
                const userJson = {}
                userJson.userOID = serializedUser.userOID;
                userJson.lti = serializedUser.lti;
                userJson.authtype = serializedUser.authtype;
                userJson.accessToken = serializedUser.accessToken;
                userJson.refreshToken = serializedUser.refreshToken;
                userJson.idToken = serializedUser.idToken;

                userJson.mail = user.mail;
                userJson.isAdmin = user.isAdmin;
                userJson.firstName = user.firstName;
                userJson.lastName = user.lastName;
                done(null, userJson);
            } else {
                done(null, false);
            }
        }).catch(err => done(err))
});
