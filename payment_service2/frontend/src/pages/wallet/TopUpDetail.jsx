import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './DetailPage.css';

const TopUpDetail = () => {
  const { topUpId } = useParams();
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
      console.error('Failed to load top-up:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!topUp) {
    return (
      <div className="detail-page">
        <div className="alert alert-warning">Top-up not found</div>
        <Link to="/recent-topup" className="btn btn-primary">Back to Top-ups</Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-card">
        <div className="detail-header">
          <h2>Top-up Details</h2>
          <span className={`status-badge ${topUp.status}`}>{topUp.status}</span>
        </div>

        <div className="detail-section">
          <div className="detail-row">
            <span>Reference</span>
            <span>{topUp.referenceNumber || topUp.id}</span>
          </div>
          <div className="detail-row">
            <span>Date</span>
            <span>{formatDateTime(topUp.createdAt)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method</span>
            <span>{topUp.paymentMethod}</span>
          </div>
        </div>

        <div className="detail-section total">
          <div className="detail-row">
            <span>Amount</span>
            <span className="total-amount positive">+{formatCurrency(topUp.amount)}</span>
          </div>
        </div>

        <Link to="/recent-topup" className="btn btn-outline-secondary w-100">
          Back to Top-ups
        </Link>
      </div>
    </div>
  );
};

export default TopUpDetail;
