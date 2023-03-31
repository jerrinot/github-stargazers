import React, { useState, useEffect } from 'react';

const UserInfo = ({ accessToken, onTokenInvalid }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (accessToken) {
            setLoading(true);

            fetch('https://api.github.com/user', {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `token ${accessToken}`,
                },
            })
                .then((response) => {
                    setLoading(false);

                    if (response.ok) {
                        return response.json();
                    } else {
                        setError('Invalid or expired access token');
                        if (onTokenInvalid) {
                            onTokenInvalid();
                        }
                        throw new Error('Invalid or expired access token');
                    }
                })
                .then((data) => {
                    setUserData(data);
                })
                .catch((error) => {
                    setError(error.message);
                });
        }
    }, [accessToken, onTokenInvalid]);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : userData ? (
                <div>
                    <h3>User Information</h3>
                    <p>Login: {userData.login}</p>
                    <p>Name: {userData.name || 'N/A'}</p>
                    <p>Email: {userData.email || 'N/A'}</p>
                    <p>Location: {userData.location || 'N/A'}</p>
                </div>
            ) : (
                <p>No user data available.</p>
            )}
        </div>
    );
};

export default UserInfo;
