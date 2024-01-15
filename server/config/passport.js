const passport = require('passport');
const lti = require("ims-lti");
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
const LtiCredentials = db.lticredentials;

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
            firstname: lti.lis_person_name_given,
            lastname: lti.lis_person_name_family,
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
            firstname: lti.lis_person_name_given,
            lastname: lti.lis_person_name_family,
            mail: lti.lis_person_contact_email_primary,
            isAdmin: false,
        }, transaction: t
    });

    if (!created) {
        // update user
        user.firstname = lti.lis_person_name_given || null;
        user.lastname = lti.lis_person_name_family || null;
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

    let seminar = null;
    if(!map){
        //1. erstelle seminar
        seminar = await Seminar.create({
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
    }else{
        seminar = await Seminar.findOne({
            where: {
                seminarOID: map.seminarOID
            }
        });
    }

    // TODO delete
    // seminar.description = lti.context_title;
    // //seminar.phase = 1;
    // await seminar.save({transaction: t});

    return seminar;
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

// TODO edit
function mapLtiRoles(roles) {
    //if(roles[0] === 'Admin') return 1; //moodle role does not exist
    if (roles[0] === 'Instructor') return 2;
    if (roles[0] === 'Learner') return 3;
    return null;
}

const ltiVerifyCallback = async (req, lti, done) => {
    const t = await db.sequelize.transaction();

    try {
        const user = await addOrUpdateUser(lti, t);

        let seminar = null;
        if (lti.custom_seminar_key) {
            //join seminar
            seminar = await Seminar.findOne({
                where: {
                    assignmentkey: lti.custom_seminar_key
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
            lti: {
                launch_presentation_return_url: lti.launch_presentation_return_url
            },
            authtype: "lti"
        };

        await t.commit();

        return done(null, userJson);
    } catch (e) {
        console.log(e);
        await t.rollback();
        return done(null, false);
    }
}

/*
//first version
const ltiStrategy = new LTIStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    passReqToCallback: true,
}, ltiVerifyCallback);
 */

//second version
const ltiStrategy = new LTIStrategy({
    createProvider: function (req, done) {
        LtiCredentials.findOne({
            where: {
                consumerKey: req.body.oauth_consumer_key
            }
        }).then(function (consumer) {
            if (!consumer) {
                return done("not_found");
            }

            if (consumer.isActive) {
                const ltiProvider = new lti.Provider(consumer.consumerKey, consumer.consumerSecret);
                return done(null, ltiProvider);
            } else {
                return done("not_authorized");
            }
        }).catch(function (err) {
            return done(err);
        });
    },
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
                firstname: profile.name?.givenName,
                lastname: profile.name?.familyName,
                mail: profile.emails && profile.emails[0]?.value,
                isAdmin: false,
            }, {transaction: t});

            // Create OidcUser
            cred = await OidcUser.create({
                subject: profile.id,
                //provider: issuer,
                userOID: user.userOID,
                //idToken: idToken,
            }, {transaction: t});
        }
        // only the User table should be updated
        const [user, created] = await User.findOrCreate({
            where: {
                userOID: cred.userOID
            },
            defaults: {
                firstname: profile.name?.givenName,
                lastname: profile.name?.familyName,
                mail: profile.emails && profile.emails[0]?.value,
                isAdmin: false,
            }, transaction: t
        });

        if (!created) {
            // update user
            user.firstname = profile.name?.givenName;
            user.lastname = profile.name?.familyName;
            user.mail = profile.emails && profile.emails[0]?.value;
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


passport.use("lti", ltiStrategy);

passport.use("openidconnect", new OpenIDConnectStrategy({
    issuer: process.env.ISSUER,
    authorizationURL: process.env.ISSUER + "/protocol/openid-connect/auth",
    tokenURL: process.env.ISSUER + "/protocol/openid-connect/token",
    userInfoURL: process.env.ISSUER + "/protocol/openid-connect/userinfo",
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
                userJson.firstname = user.firstname;
                userJson.lastname = user.lastname;
                done(null, userJson);
            } else {
                done(null, false);
            }
        }).catch(err => done(err))
});
