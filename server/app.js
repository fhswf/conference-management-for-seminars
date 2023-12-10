require('dotenv').config();
const PORT_HTTP = process.env.EXPRESS_PORT_HTTP || 3000;
const PORT_HTTPS = process.env.EXPRESS_PORT_HTTPS || 3443;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
var path = require('path')
var bodyParser = require('body-parser');
var morgan = require('morgan')

const fileUpload = require('express-fileupload');


const app = express();
app.set('trust proxy', true);
// ------------------------------ middleware ------------------------------
const {isAuthenticated} = require("./middleware/authMiddleware");

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

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('dev'))


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
        //TODO
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
const chatRouter = require('./routes/chatmessageRouter');
const reviewRouter = require('./routes/reviewRouter');


app.use('/conference/api/concepts', isAuthenticated, conceptRouter);
app.use('/conference/api/paper', isAuthenticated, paperRouter);
app.use('/conference/api/user', isAuthenticated, userRouter);
app.use('/conference/api/seminar', isAuthenticated, seminarRouter);
app.use('/conference/api/attachment', isAuthenticated, attachmentRouter);
app.use('/conference/api/chat', isAuthenticated, chatRouter);
app.use('/conference/api/review', isAuthenticated, reviewRouter);

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



app.get('/conference/api/login', passport.authenticate('openidconnect'));


app.get('/conference/api/login/callback', passport.authenticate('openidconnect', {failureRedirect: 'http://' + process.env.FRONTEND_URL}), function (req, res) {
        res.redirect('/conference/api/success');
    }
);


app.get('/conference/api/success', function (req, res) {
    //console.log(req.user);
    //console.log(req.session);
    res.redirect('http://' + process.env.FRONTEND_URL);
});

app.get('/conference/api/error', function (req, res) {
    console.log('Error during LTI launch.');
    res.status(401).send('Error during LTI launch.');
});
app.get('/conference/api/error-login', function (req, res) {
    console.log('Error during Login');
    res.status(401).send('Error during OIDC Login');
});

app.get('/conference/api/authstatus', (req, res) => {
    console.log("APP CHCECK AUTH");
    if (req.isAuthenticated()) {
        return res.status(200).json({
            user: {
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                mail: req.user.mail,
                isAdmin: req.user.isAdmin,
                userOID: req.user.userOID,
            }
        });
    }
    return res.status(401).json({msg: "Not authenticated"});
});

app.get('/conference/api', (req, res) => {
    console.log(req.protocol)
    res.send('Hello World!');
});

app.get('/conference/api/test', (req, res) => {
    res.send(process.env.EXPRESS_PORT_HTTP);
});

//logout
app.get('/conference/api/logout', isAuthenticated, (req, res) => {
    console.log("");

    let redirectUrl;
    if (req.user.authtype === "lti") {
        redirectUrl = req.user.lti?.launch_presentation_return_url;
    } else if (req.user.authtype === "oidc") {
        redirectUrl = process.env.ENDSESSION_ENDPOINT;
    }
    req.logout(() => {
        //console.log(req.user);
        //console.log(req.session);
        res.status(200).json({url: redirectUrl});
    });
});


// ------------------------------ server setup ------------------------------
/*
try {
    const https = require('https');
    const key = fs.readFileSync('./certificates/key.pem', 'utf8');
    const cert = fs.readFileSync('./certificates/cert.pem', 'utf8');
    const optionsHttps = {
        key: key,
        cert: cert
    };
    const serverHttps = https.createServer(optionsHttps, app);
    serverHttps.listen(PORT_HTTPS, () => {
        console.log('App listening at http://localhost:' + PORT_HTTPS);
    });
} catch (e) {
    console.log('HTTPS server not started: ' + e);
}
*/




const serverHttp = app.listen(PORT_HTTP, function () {
    console.log('App listening at http://localhost:' + PORT_HTTP);
});
