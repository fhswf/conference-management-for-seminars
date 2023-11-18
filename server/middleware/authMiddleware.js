const jwt = require('jsonwebtoken');

async function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({msg: "Not authenticated"});
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
                req.logout(() => {});
                return res.status(401).json({msg: "Logged out because token could not be refreshed"});
            }
        }

        // check if token is active
        //const tokenActive = newAccessToken ? await introspectToken(newAccessToken) : await introspectToken(req.user.accessToken);
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


//TODO edit
function isInstructor(req, res, next) {
    if (req.user.lti) {
        if (req.user.lti.roles.includes("Instructor")) {
            return next();
        } else {
            res.status(401).json({msg: "Not authorized"});
        }
    } else {
        const tokenData = jwt.decode(req.user.accessToken);
        if (tokenData.realm_access.roles.includes("instructor")) {
            return next();
        } else {
            res.status(401).json({msg: "Not authorized"});
        }
    }
}

//TODO edit
function isStudent(req, res, next) {
    if (req.user.lti) {
        if (req.user.lti.roles.includes("Learner")) {
            return next();
        } else {
            res.status(401).json({msg: "Not authorized"});
        }
    } else {
        const tokenData = jwt.decode(req.user.accessToken);
        if (tokenData.realm_access.roles.includes("student")) {
            return next();
        } else {
            res.status(401).json({msg: "Not authorized"});
        }
    }
}

function isAccessTokenExpired(accessToken) {
    try {
        const tokenData = jwt.decode(accessToken);
        return Date.now() >= (tokenData.exp * 1000);
    } catch (e) {
        return true;
    }
}


async function refreshAccessToken(refreshToken) {
    const tokenEndpoint = process.env.TOKEN_URL;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken,
            'client_id': clientId,
            'client_secret': clientSecret,
        }),
    });

    const data = await response.json();

    if(data.error) {
        throw new Error(data.error_description);
    }

    return data.access_token; // Das neue Access Token
}

async function introspectToken(accessToken) {
    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", process.env.CLIENT_ID);
    urlencoded.append("client_secret", process.env.CLIENT_SECRET);
    urlencoded.append("token", accessToken);

    const response = await fetch(process.env.INTROSPECT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
    });
    const data = await response.json();

    return data.active;
}


module.exports = {
    isAuthenticated,
    isInstructor,
    isStudent
};
