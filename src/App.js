import React, { useState, useMemo } from 'react';
import axios from 'axios';
import StargazersTable from './components/StargazersTable';
import StargazersForm from './components/StargazersForm';
import ProgressBar from 'react-progressbar';
import Papa from 'papaparse';
import GitHubLoginButton from './components/GitHubLoginButton';
import UserInfo from './components/UserInfo';


const API_BASE_URL = 'https://api.github.com';

const appStyles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
    },
    title: {
        marginBottom: '20px',
    },
    button: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        color: '#fff',
        padding: '8px 16px',
        fontSize: '14px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: '1px solid transparent',
        textDecoration: 'none',
    },
    exportButton: {
        marginTop: '20px',
    },
};


const stargazersToCSV = (stargazers) => {
    const csvData = stargazers.map((stargazer) => ({
        username: stargazer.login,
        avatar_url: stargazer.avatar_url,
        profile_url: stargazer.html_url,
    }));

    return Papa.unparse(csvData);
};

const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const fetchStargazers = async (repo, page, token) => {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
    };

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        headers['Authorization'] = `token ${accessToken}`;
    } else if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/repos/${repo}/stargazers`, {
        headers,
        params: {
            per_page: 100,
            page: page,
        },
    });

    return response.data;
};

const App = () => {
    const [progress, setProgress] = useState(0);
    const [repo, setRepo] = useState('');
    const [token, setToken] = useState('');
    const [stargazers, setStargazers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const clientId = '1d3ccbb11fdcd66a8658';

    const columns = useMemo(
        () => [
            {
                Header: 'Username',
                accessor: 'login',
            },
            {
                Header: 'Profile',
                accessor: 'html_url',
                Cell: ({ value }) => <a href={value}>{value}</a>,
            },
        ],
        [],
    );

    const fetchRepoDetails = async (repo, token) => {
        const headers = {
            Accept: 'application/vnd.github.v3+json',
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        const response = await axios.get(`${API_BASE_URL}/repos/${repo}`, {
            headers,
        });

        return response.data;
    };


    const loadStargazers = async (repo, token) => {
        setLoading(true);
        setProgress(0);
        setErrorMessage('');

        try {
            const repoDetails = await fetchRepoDetails(repo, token);
            const totalStargazers = repoDetails.stargazers_count;

            let page = 1;
            let hasMore = true;
            const allStargazers = [];

            while (hasMore) {
                try {
                    const stargazers = await fetchStargazers(repo, page, token);
                    allStargazers.push(...stargazers);
                    const fetchedStargazers = allStargazers.length;
                    setProgress((fetchedStargazers / totalStargazers) * 100);
                    if (stargazers.length < 100) {
                        hasMore = false;
                    } else {
                        page += 1;
                    }
                } catch (error) {
                    console.error('Failed to fetch stargazers:', error);
                    if (error.response && error.response.status === 403) {
                        setErrorMessage(
                            'You have exceeded the GitHub API rate limit for anonymous requests. Please enter a GitHub Personal Access Token to continue.'
                        );
                    } else {
                        setErrorMessage('Failed to fetch stargazers. Please try again.');
                    }
                    hasMore = false;
                }
            }

            setStargazers(allStargazers);
        } catch (error) {
            console.error('Failed to fetch repository details:', error);
            setErrorMessage('Failed to fetch repository details. Please check if the repository exists and try again.');
        }

        setLoading(false);
        setProgress(100);
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        loadStargazers(repo, token);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    if (accessToken) {
        // Store the access token in local storage
        localStorage.setItem('access_token', accessToken);

        // Remove the access token from the URL
        window.history.replaceState(null, '', window.location.pathname);
    }

    const handleTokenInvalid = () => {
        localStorage.removeItem('access_token');
    };



    return (
        <div className="App" style={appStyles.container}>
            <h1 style={appStyles.title}>GitHub Stargazers</h1>
            <GitHubLoginButton clientId={clientId} />
            <UserInfo accessToken={accessToken} onTokenInvalid={handleTokenInvalid} />
            <StargazersForm
                repo={repo}
                token={token}
                onRepoChange={(e) => setRepo(e.target.value)}
                onTokenChange={(e) => setToken(e.target.value)}
                onSubmit={handleSubmit}
            />
            {errorMessage && <p className="error">{errorMessage}</p>}
            {loading && (
                <>
                    <p>Loading stargazers...</p>
                    <ProgressBar completed={progress} />
                </>
            )}
            {!loading && stargazers.length > 0 && (
                <>
                    <StargazersTable columns={columns} data={stargazers} />
                    <button
                        onClick={() => {
                            const csvData = stargazersToCSV(stargazers);
                            downloadCSV(csvData, 'stargazers.csv');
                        }}
                        style={{ ...appStyles.button, ...appStyles.exportButton }}
                    >
                        Export to CSV
                    </button>
                </>
            )}
        </div>
    );

};

export default App;
