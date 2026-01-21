import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './TopUpResult.css';

const TopUpSuccess = () => {
  const { topUpId } = useParams();

  return (
    <div className="result-page">
      <div className="result-card success">
        <div className="result-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h2>Top-up Successful!</h2>
        <p>Your wallet has been topped up successfully.</p>
        <p className="reference">Reference: {topUpId}</p>
        
        <div className="result-actions">
          <Link to="/wallet" className="btn btn-primary btn-lg w-100 mb-2">
            Go to Wallet
          </Link>
          <Link to="/topup" className="btn btn-outline-secondary w-100">
            Top Up Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopUpSuccess;
