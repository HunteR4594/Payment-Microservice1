import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '1.5rem' }}>
          Recent Top-ups
        </h2>
        
        {topUps.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
            <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
            <p style={{ color: '#636e72', marginTop: '1rem' }}>No top-ups yet</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            {topUps.map((topUp) => (
              <Link 
                key={topUp.id}
                to={`/topup-detail/${topUp.id}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit' }}
              >
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>Top-up {formatDate(topUp.createdAt)}</p>
                  <p style={{ fontSize: '14px', color: '#636e72', marginBottom: 0 }}>{topUp.paymentMethod}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px', color: '#27ae60' }}>+{formatCurrency(topUp.amount)}</p>
                  <span className={`badge bg-${topUp.status === 'completed' ? 'success' : 'warning'}`}>{topUp.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTopUpPage;
