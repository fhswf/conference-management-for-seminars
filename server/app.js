require('dotenv').config();
const PORT_HTTP = process.env.EXPRESS_PORT_HTTP || 3000;
const PORT_HTTPS = process.env.EXPRESS_PORT_HTTPS || 3443;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');


const app = express();

// ------------------------------ middleware ------------------------------
app.use(cors({
    origin: 'http://192.168.0.206:5173',
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
    }
}))

sessionStore.onReady().then(() => {
    console.log('MySQLStore ready');
}).catch(error => {
    console.error(error);
});


//app.use(helmet());

// ------------------------------ passport setup ------------------------------

const passport = require('passport');
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());


// ------------------------------ routes ------------------------------
const {isAuthenticated} = require("./middleware/authMiddleware");

// Zu Testzwecken
app.get('/', (req, res) => {
    if (req.session.views) {
        req.session.views++
        res.setHeader('Content-Type', 'application/json')
        res.send({'views': req.session.views})
    } else {
        req.session.views = 1
        res.send({'views': req.session.views})
    }
});

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

app.post('/lti/launch', passport.authenticate('lti', {
    failureRedirect: '/error',
    successRedirect: '/success',
    session: true
}));

app.get('/success', function (req, res) {
    //console.log('LTI launch was successful!');
    console.log(req.user);
    console.log(req.session);
    res.redirect('http://192.168.0.206:5173/');
});

app.get('/error', function (req, res) {
    console.log('Error during LTI launch.');
    res.send('Error during LTI launch.');
});

app.get('/api/authstatus', isAuthenticated, (req, res) => {
    //res.json({isAuthenticated: req.isAuthenticated()});
});

// ------------------------------ server setup ------------------------------

const https = require('https');

const key = fs.readFileSync(__dirname + '/../../certs/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/../../certs/selfsigned.crt');
const optionsHttps = {
    key: key,
    cert: cert
};

const serverHttps = https.createServer(optionsHttps, app);

serverHttps.listen(PORT_HTTPS, () => {
    console.log('App listening at https://localhost:' + PORT_HTTPS);
});

const serverHttp = app.listen(PORT_HTTP, function () {
    console.log('App listening at http://localhost:' + PORT_HTTP);
});