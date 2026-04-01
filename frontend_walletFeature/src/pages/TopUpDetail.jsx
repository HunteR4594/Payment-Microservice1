import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/RecentTopUpPage.css';
import { topUpApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const TopUpDetail = () => {
  const { topUpId } = useParams();
  const navigate = useNavigate();
  const [topUp, setTopUp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTopUp();
  }, [topUpId]);

  const loadTopUp = async () => {
    try {
      setLoading(true);
      const response = await topUpApi.getById(topUpId);
      setTopUp(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodNames = {
    gcash: 'GCash',
    maya: 'Maya',
    card: 'Credit/Debit Card'
  };

  if (loading) {
    return (
      <div className="topup-activity-page d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !topUp) {
    return (
      <div className="topup-activity-page">
        <div className="activity-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <div className="logo-container">
            <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo" />
          </div>
        </div>
        <div className="p-4">
          <div className="alert alert-danger">
            {error || 'Top-up not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="topup-activity-page">
      {/* Header */}
      <div className="activity-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <div className="logo-container">
          <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo" />
        </div>
      </div>

      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-icon">
          <i className="bi bi-wallet2"></i>
        </div>
        <div className="balance-info">
          <div className="balance-label">Top-up</div>
          <div className="balance-amount">+ {formatCurrency(topUp.amount)}</div>
          <div className="balance-source">{formatDateTime(topUp.completedAt || topUp.createdAt)}</div>
          <div className="balance-source">{paymentMethodNames[topUp.paymentMethod] || topUp.paymentMethod}</div>
          {topUp.referenceNumber && (
            <div className="balance-source mt-2">
              <small className="text-muted">Ref: {topUp.referenceNumber}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUpDetail;
