const passport = require('passport');
const LTIStrategy = require('passport-lti');

const db = require("../models");
const Person = db.person;

const verifyCallback = (username, lti, done) => {
    //TODO findOrCreate Person
    // TODO ÄNDERN
    //const id = lti.user_id;
    const id = 3;
    Person.findByPk(id).then((user) => {
        if (user) {
            return done(null, user);
        } else {
            // Person erstellen
            return done(null, false);
        }
    }).catch(err => done(err))
}


const strategy = new LTIStrategy({
    consumerKey: process.env.CONSUMER_KEY || "7d13a1331703639ae03cc980eea82c6c7432bd6bb3bc35d50e53976be3da80be",
    consumerSecret: process.env.CONSUMER_SECRET || "014819937df8bbc723a20627f598f86a55a874e07303d6456bdee4eeef037a58",
    passReqToCallback: true,
}, verifyCallback);

passport.use(strategy);

// User wird in der Session gespeichert
passport.serializeUser((user, done) => {
    done(null, user.personOID);
});

// User wird aus der Datenbank geholt und in req.user gespeichert
passport.deserializeUser((id, done) => {
    Person.findByPk(id)
        .then((user) => {
            done(null, user);
        }).catch(err => done(err))
});