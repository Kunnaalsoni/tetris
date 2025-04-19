import React from 'react';

const Score = ({ score }) => {
    return (
        <div id="score" style={{ margin: '10px 0', fontSize: '1.2em' }}>
            Score: {score}
        </div>
    );
};

export default Score;
