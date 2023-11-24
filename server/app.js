require('dotenv').config();
const PORT_HTTP = process.env.EXPRESS_PORT_HTTP || 3000;
const PORT_HTTPS = process.env.EXPRESS_PORT_HTTPS || 3443;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
var bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');


const app = express();

// ------------------------------ middleware ------------------------------
const {isAuthenticated, isInstructor, isStudent} = require("./middleware/authMiddleware");

app.use(cors({
    origin: `http://${process.env.FRONTEND_URL}`,
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(fileUpload());

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
        //erstmal auskommentiert wegen Keycloak Login
        //secure: false,
        //sameSite: true,

        //secure: true,
        //sameSite: 'none',
    }
}))

sessionStore.onReady().then(() => {
    console.log('MariDB Store ready');
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

const conceptRouter = require('./routes/conceptRouter');
const paperRouter = require('./routes/paperRouter');
const userRouter = require('./routes/userRouter');
const seminarRouter = require('./routes/seminarRouter');
const attachmentRouter = require('./routes/attachmentRouter');

app.use('/api/concepts', conceptRouter);
app.use('/api/paper', paperRouter);
app.use('/api/user', userRouter);
app.use('/api/seminar', seminarRouter);
app.use('/api/attachment', attachmentRouter);

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


app.get('/login', passport.authenticate('openidconnect'));


app.get('/login/callback', passport.authenticate('openidconnect', {failureRedirect: '/login'}), function (req, res) {
        res.redirect('/success');
    }
);

app.get('/success', function (req, res) {
    console.log(req.user);
    console.log(req.session);
    res.redirect('http://192.168.0.206:5173/');
});

app.get('/error', function (req, res) {
    console.log('Error during LTI launch.');
    res.status(401).send('Error during LTI launch.');
});
app.get('/error-login', function (req, res) {
    console.log('Error during Login');
    res.status(401).send('Error during OIDC Login');
});

app.get('/api/authstatus', isAuthenticated, (req, res) => {
    res.json({isAuthenticated: req.isAuthenticated(), user: req.user});
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//logout
app.get('/api/logout', (req, res) => {
    console.log("");

    let redirectUrl;
    if(req.user.authType === "lti") {
        redirectUrl = req.user.lti?.launch_presentation_return_url;
    }else if(req.user.authType === "oidc") {
        redirectUrl = process.env.ENDSESSION_ENDPOINT;
    }
    req.logout(() => {
        //console.log(req.user);
        //console.log(req.session);
        res.status(200).json({url: redirectUrl});
    });
});

// TODO
/*
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});*/


// ------------------------------ server setup ------------------------------

try {
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
} catch (e) {
    console.log('HTTPS server not started: ' + e);
}

const serverHttp = app.listen(PORT_HTTP, function () {
    console.log('App listening at http://localhost:' + PORT_HTTP);
});
