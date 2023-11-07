//require('dotenv').config({path: __dirname + '/../.env'});
require('dotenv').config();
const PORT_HTTP = process.env.EXPRESS_PORT_HTTP;
const PORT_HTTPS = process.env.EXPRESS_PORT_HTTPS || 3443;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');


const app = express();

// ------------------------------ middleware ------------------------------
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// ------------------------------ session setup ------------------------------
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dbConfig = require('./config/dbConfig');

const sessionStore = new MySQLStore({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DATABASE,
    port: dbConfig.PORT,
});

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: false,
        sameSite: true,
        //secure: true,
        //sameSite: 'none',
    }
}))

sessionStore.onReady().then(() => {
    console.log('MySQLStore ready');
}).catch(error => {
    console.error(error);
});


app.use(helmet());

// ------------------------------ passport setup ------------------------------

const passport = require('passport');
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());


// ------------------------------ routes ------------------------------
const {isAuthenticated, isInstructor, isStudent} = require("./middleware/authMiddleware");

/*
app.use(function (req, res, next) {
    console.log("------------------");
    console.log(req.session);
    console.log(req.isAuthenticated());
    console.log(req.user);
    console.log("------------------");
    next();
} );
 */

app.post('/conference/api/lti/launch', passport.authenticate('lti', {
    failureRedirect: '/conference/api/error',
    successRedirect: '/conference/api/success',
    session: true
}));

app.get('/conference/api/success', function (req, res) {
    //console.log('LTI launch was successful!');
    console.log(req.user);
    console.log(req.session);
    res.redirect('https://' + process.env.FRONTEND_URL);
});

app.get('/conference/api/error', function (req, res) {
    console.log('Error during LTI launch.');
    res.send('Error during LTI launch.');
});

app.get('/conference/api/authstatus', isAuthenticated, (req, res) => {
    res.json({isAuthenticated: req.isAuthenticated(), user: req.user});
});

app.get('/conference/api/', (req, res) => {
    res.send('Hello World!');
});
app.get('/conference/api/test', (req, res) => {
    res.send('Hello World! Test');
});

// ------------------------------ server setup ------------------------------

//try {
//    const https = require('https');
//    const key = fs.readFileSync(__dirname + '/../../certs/selfsigned.key');
//    const cert = fs.readFileSync(__dirname + '/../../certs/selfsigned.crt');
//    const optionsHttps = {
//        key: key,
//        cert: cert
//    };
//    const serverHttps = https.createServer(optionsHttps, app);
//    serverHttps.listen(PORT_HTTPS, () => {
//        console.log('App listening at https://localhost:' + PORT_HTTPS);
//    });
//} catch (e) {
//    console.log('HTTPS server not started: ' + e);
//}

const serverHttp = app.listen(PORT_HTTP, function () {
    console.log('App listening at http://localhost:' + PORT_HTTP);
});
