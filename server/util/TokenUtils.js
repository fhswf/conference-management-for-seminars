const jwt = require("jsonwebtoken");

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
    isAccessTokenExpired,
    refreshAccessToken,
    introspectToken
}
