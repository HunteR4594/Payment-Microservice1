import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './RecentPages.css';

const RecentTopUpPage = () => {
  const [topUps, setTopUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopUps();
  }, []);

  const loadTopUps = async () => {
    try {
      const response = await topUpApi.getAll();
      setTopUps(response.data || []);
    } catch (err) {
      console.error('Failed to load top-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recent-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-page">
      <h2 className="page-title">Recent Top-ups</h2>
      
      {topUps.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-wallet2"></i>
          <p>No top-ups yet</p>
          <Link to="/topup" className="btn btn-primary">Top Up Now</Link>
        </div>
      ) : (
        <div className="items-list">
          {topUps.map((topUp) => (
            <Link key={topUp.id} to={`/topup-detail/${topUp.id}`} className="list-item">
              <div className="item-icon">
                <i className="bi bi-wallet2"></i>
              </div>
              <div className="item-info">
                <span className="item-title">{topUp.paymentMethod}</span>
                <span className="item-subtitle">{formatDate(topUp.createdAt)}</span>
              </div>
              <div className="item-right">
                <span className="item-amount positive">+{formatCurrency(topUp.amount)}</span>
                <span className={`item-status ${topUp.status}`}>{topUp.status}</span>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTopUpPage;
