const {Sequelize} = require("sequelize");

const passport = require('passport');
const LTIStrategy = require('passport-lti');

const db = require("../models");
const Person = db.person;
const RoleAssignment = db.rolleassignment;
const Seminar = db.seminar;

async function addOrUpdatePerson(lti, t) {
    const [person, created] = await Person.findOrCreate({
        where: {
            personOID: lti.user_id
        },
        defaults: {
            personOID: lti.user_id,
            firstName: lti.lis_person_name_given,
            lastName: lti.lis_person_name_family,
            mail: lti.lis_person_contact_email_primary,
            comment: null,
            passwort: ""
        },
        transaction: t
    })

    if (!created) {
        person.firstName = lti.lis_person_name_given;
        person.lastName = lti.lis_person_name_family;
        person.mail = lti.lis_person_contact_email_primary;
        person.comment = "updated2";
        person.passwort = "";
        await person.save();
    }

    return person;
}

async function addOrUpdateSeminar(lti, t) {
    const [seminar, created] = await Seminar.findOrCreate({
        where: {
            seminarOID: lti.context_id
        },
        defaults: {
            seminarOID: lti.context_id,
            description: lti.context_title,
            phase: 1
        },
        transaction: t
    });

    if (!created) {
        seminar.description = lti.context_title;
        //seminar.phase = 1;
        await seminar.save();
    }
    return seminar;
}

async function addOrUpdateRolleAssignment(lti, t) {
    const [assignment, created] = await RoleAssignment.findOrCreate({
        where: {
            personOID: lti.user_id,
            seminarOID: lti.context_id
        },
        defaults: {
            personOID: lti.user_id,
            seminarOID: lti.context_id,
            roleOID: mapRole(lti.roles)
        },
        transaction: t
    });

    if (!created) {
        // TODO if role changed, handle uploaded User data (paper, concept)
        assignment.role = mapRole(lti.roles);
        await assignment.save();
    }
    return assignment;
}

function mapRole(roles) {
    //if(roles[0] === 'Admin') return 1; //moodle role does not exist
    if (roles[0] === 'Instructor') return 2;
    if (roles[0] === 'Learner') return 3;
    return null;
}

const verifyCallback = async (username, lti, done) => {
    const t = await Sequelize.transaction();

    try {
        const person = await addOrUpdatePerson(lti, t);
        await addOrUpdateSeminar(lti, t);
        await addOrUpdateRolleAssignment(lti, t);

        var user = {id: person.personOID, lti: lti};

        return done(null, user);
    } catch (e) {
        console.log(e);
        await t.rollback();
        return done(e);
    }
}


const strategy = new LTIStrategy({
    consumerKey: process.env.CONSUMER_KEY || "7d13a1331703639ae03cc980eea82c6c7432bd6bb3bc35d50e53976be3da80be",
    consumerSecret: process.env.CONSUMER_SECRET || "014819937df8bbc723a20627f598f86a55a874e07303d6456bdee4eeef037a58",
    passReqToCallback: true,
}, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, {
        personOID: user.id,
        lti: user.lti,
    });
});

passport.deserializeUser((serializedUser, done) => {
    Person.findByPk(serializedUser.personOID)
        .then((user) => {
            if (user) {
                user.lti = serializedUser.lti;
                done(null, user);
            } else {
                done(null, false);
            }
        }).catch(err => done(err))
});