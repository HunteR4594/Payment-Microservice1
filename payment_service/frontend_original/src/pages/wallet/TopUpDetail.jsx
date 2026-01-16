import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link to="/recent-topup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#2d3436', textDecoration: 'none', marginBottom: '1rem' }}>
          <i className="bi bi-chevron-left"></i> Back
        </Link>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '1.5rem' }}>
            Top-up Details
          </h2>
          
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem' }}>
            <p className="mb-2"><strong>Top-up ID:</strong> {topUp?.id}</p>
            <p className="mb-2"><strong>Amount:</strong> {formatCurrency(topUp?.amount || 0)}</p>
            <p className="mb-2"><strong>Method:</strong> {topUp?.paymentMethod}</p>
            <p className="mb-2"><strong>Status:</strong> <span className={`badge bg-${topUp?.status === 'completed' ? 'success' : 'warning'}`}>{topUp?.status}</span></p>
            <p className="mb-0"><strong>Date:</strong> {formatDateTime(topUp?.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpDetail;
