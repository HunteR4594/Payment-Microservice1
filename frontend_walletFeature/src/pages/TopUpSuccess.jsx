import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/TopUpResult.css';
import { topUpApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const TopUpSuccess = () => {
  const { topUpId } = useParams();
  const navigate = useNavigate();
  const [topUp, setTopUp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopUp();
  }, [topUpId]);

  const loadTopUp = async () => {
    try {
      const response = await topUpApi.getById(topUpId);
      setTopUp(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="result-page d-flex justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page success">
      <div className="result-card">
        <div className="result-icon success">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        
        <h1 className="result-title">Top-up Successful!</h1>
        <p className="result-message">Your wallet has been credited.</p>
        
        {topUp && (
          <div className="result-details">
            <div className="detail-row">
              <span>Amount</span>
              <span className="amount">{formatCurrency(topUp.amount)}</span>
            </div>
            <div className="detail-row">
              <span>Reference</span>
              <span>{topUp.referenceNumber}</span>
            </div>
            <div className="detail-row">
              <span>Date</span>
              <span>{formatDateTime(topUp.completedAt || topUp.createdAt)}</span>
            </div>
          </div>
        )}
        
        <button className="btn-primary-action" onClick={() => navigate('/wallet')}>
          <i className="bi bi-wallet2 me-2"></i>
          Back to Wallet
        </button>
      </div>
    </div>
  );
};

export default TopUpSuccess;
