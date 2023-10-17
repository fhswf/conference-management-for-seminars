const PORT = process.env.EXPRESS_PORT || 3000;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const passport = require('passport');
const LTIStrategy = require('passport-lti');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// middleware
app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: '123',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: true}
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());


var strategy = new LTIStrategy({
    consumerKey: '7d13a1331703639ae03cc980eea82c6c7432bd6bb3bc35d50e53976be3da80be',
    consumerSecret: '014819937df8bbc723a20627f598f86a55a874e07303d6456bdee4eeef037a58'
}, function (lti, done) {
    var user = {id: 'user123', lti: lti};
    return done(null, user);
});

passport.use(strategy);


passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function (id, cb) {
    // TODO load user from database
    var user = {id: 'user123'};
    console.log('HALLO');
    process.nextTick(function () {
        return cb(null, user);
    });
});

function checkAuth(req, res, next) {
    passport.authenticate('lti', {session: false}, function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/error');
        }
        req.user = user;
        //console.log(user)

        return next();
    })(req, res, next);
}

app.post('/lti/launch', checkAuth, function (req, res) {
        console.log(req.body)
        res.redirect('/success');
    }
);

app.get('/success', function (req, res) {
    //console.log('LTI launch was successful!');
    res.redirect('http://192.168.0.206:5173/');

});

app.get('/error', function (req, res) {
    console.log('Error during LTI launch.');
    res.send('Error during LTI launch.');
});

app.get('/api/user', function (req, res) {
    console.log('GET /api/user')
    if (req.isAuthenticated()) {
        res.json({user: req.user});
    } else {
        res.status(401).json({user: null});
    }
});


// Server starten
var server = app.listen(PORT, function () {
    console.log('App listening at http://localhost:3000/');
});
