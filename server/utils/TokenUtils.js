const jwt = require("jsonwebtoken");

/**
 * Checks if an Access Token has expired.
 *
 * @param {string} accessToken - The Access Token to check.
 * @returns {boolean} - True if the token has expired, otherwise false.
 */
function isAccessTokenExpired(accessToken) {
    try {
        const tokenData = jwt.decode(accessToken);
        return Date.now() >= (tokenData.exp * 1000);
    } catch (e) {
        return true;
    }
}

/**
 * Refreshes an Access Token using a Refresh Token.
 *
 * @param {string} refreshToken
 * @returns {Promise<any>} - A Promise containing the response data with the refreshed token.
 * @throws {Error} - An error is thrown if the request fails or if an error is returned by the server.
 */
async function refreshAccessToken(refreshToken) {
    const tokenEndpoint = process.env.ISSUER + '/protocol/openid-connect/token';
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

    return data;
}

/**
 * Checks if an Access Token is valid by introspecting it with the authorization server.
 *
 * @param {string} accessToken
 * @returns {Promise<boolean>} - true if the token is valid, otherwise false.
 */
async function introspectToken(accessToken) {
    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", process.env.CLIENT_ID);
    urlencoded.append("client_secret", process.env.CLIENT_SECRET);
    urlencoded.append("token", accessToken);

    const response = await fetch(process.env.ISSUER + "/protocol/openid-connect/token/introspect", {
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
