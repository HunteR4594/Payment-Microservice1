import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/RecentTopUpPage.css';
import { topUpApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const RecentTopUpPage = () => {
  const navigate = useNavigate();
  const [topUps, setTopUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTopUps();
  }, []);

  const loadTopUps = async () => {
    try {
      setLoading(true);
      const response = await topUpApi.getAll();
      setTopUps(response.data);
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

      <div className="p-3">
        <h2 className="mb-4" style={{ fontFamily: 'DM Sans', fontWeight: 700 }}>Recent Top-ups</h2>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {topUps.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-wallet2 fs-1 d-block mb-3"></i>
            <p>No top-ups yet</p>
          </div>
        ) : (
          topUps.map((topUp) => (
            <Link 
              key={topUp.id} 
              to={`/topup-detail/${topUp.id}`}
              className="text-decoration-none"
            >
              <div className="balance-card mb-3" style={{ cursor: 'pointer' }}>
                <div className="balance-icon">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div className="balance-info">
                  <div className="balance-label">Top-up</div>
                  <div className="balance-amount">+ {formatCurrency(topUp.amount)}</div>
                  <div className="balance-source">{formatDateTime(topUp.completedAt || topUp.createdAt)}</div>
                  <div className="balance-source">{paymentMethodNames[topUp.paymentMethod] || topUp.paymentMethod}</div>
                </div>
                <div className="d-flex align-items-center">
                  <span className={`badge ${topUp.status === 'completed' ? 'bg-success' : topUp.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                    {topUp.status}
                  </span>
                  <i className="bi bi-chevron-right ms-2"></i>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTopUpPage;
