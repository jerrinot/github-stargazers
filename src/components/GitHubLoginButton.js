import React from 'react';

const GitHubLoginButton = ({ clientId }) => {
    const loginWithGithub = () => {
        const scope = 'public_repo';
        const redirectUri = encodeURIComponent('https://gh-stars.info/auth/github/callback');

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
        window.location.href = authUrl;
    };

    return (
        <button onClick={loginWithGithub}>Login with GitHub</button>
    );
};

export default GitHubLoginButton;