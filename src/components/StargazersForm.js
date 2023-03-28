import React from 'react';

const formStyles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '20px',
    },
    input: {
        marginBottom: '10px',
        padding: '8px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
    },
    submitButton: {
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
};

const StargazersForm = ({ repo, token, onRepoChange, onTokenChange, onSubmit }) => {
    return (
        <form onSubmit={onSubmit} style={formStyles.form}>
            <input
                type="text"
                value={repo}
                onChange={onRepoChange}
                placeholder="Repository (e.g. facebook/react)"
                style={formStyles.input}
            />
            <input
                type="password"
                value={token}
                onChange={onTokenChange}
                placeholder="GitHub Personal Access Token (optional)"
                style={formStyles.input}
            />
            <button type="submit" style={formStyles.submitButton}>
                Fetch Stargazers
            </button>
        </form>
    );
};

export default StargazersForm;