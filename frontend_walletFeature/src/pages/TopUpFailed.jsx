import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/TopUpResult.css';

const TopUpFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="result-page failed">
      <div className="result-card">
        <div className="result-icon failed">
          <i className="bi bi-x-circle-fill"></i>
        </div>
        
        <h1 className="result-title">Top-up Failed</h1>
        <p className="result-message">
          Your payment could not be processed. Please try again.
        </p>
        
        <div className="result-actions">
          <button className="btn-primary-action" onClick={() => navigate('/topup')}>
            <i className="bi bi-arrow-repeat me-2"></i>
            Try Again
          </button>
          
          <button className="btn-secondary-action" onClick={() => navigate('/wallet')}>
            Back to Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopUpFailed;
