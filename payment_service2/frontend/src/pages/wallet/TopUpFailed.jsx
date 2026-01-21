import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './TopUpResult.css';

const TopUpFailed = () => {
  const { topUpId } = useParams();

  return (
    <div className="result-page">
      <div className="result-card failed">
        <div className="result-icon">
          <i className="bi bi-x-circle-fill"></i>
        </div>
        <h2>Top-up Failed</h2>
        <p>Your top-up could not be completed. Please try again.</p>
        <p className="reference">Reference: {topUpId}</p>
        
        <div className="result-actions">
          <Link to="/topup" className="btn btn-primary btn-lg w-100 mb-2">
            Try Again
          </Link>
          <Link to="/wallet" className="btn btn-outline-secondary w-100">
            Go to Wallet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopUpFailed;
