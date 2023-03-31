const axios = require("axios");

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

exports.handler = async (event, context) => {
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request method" }),
        };
    }

    const code = event.queryStringParameters.code;

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Authorization code is missing" }),
        };
    }

    try {
        const response = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
            },
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        const { access_token: accessToken, token_type: tokenType } = response.data;

        if (!accessToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Failed to obtain access token" }),
            };
        }

        // Redirect the user back to the app with the access token
        return {
            statusCode: 302,
            headers: {
                Location: `https://gh-stars.info?access_token=${accessToken}`,
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
