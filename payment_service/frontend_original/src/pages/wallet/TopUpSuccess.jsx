import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const TopUpSuccess = () => {
  const { topUpId } = useParams();
  const [topUp, setTopUp] = useState(null);

  useEffect(() => {
    loadTopUp();
  }, [topUpId]);

  const loadTopUp = async () => {
    try {
      const response = await topUpApi.getById(topUpId);
      setTopUp(response.data);
    } catch (err) {
      console.error('Failed to load top-up:', err);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: 'white', borderRadius: '20px', padding: '3rem', maxWidth: '400px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <i className="bi bi-check-lg" style={{ fontSize: '40px', color: 'white' }}></i>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '0.5rem' }}>
          Top-up Successful!
        </h2>
        <p style={{ color: '#636e72', marginBottom: '1.5rem' }}>
          {formatCurrency(topUp?.amount || 0)} has been added to your wallet
        </p>
        <Link to="/wallet" style={{ display: 'block', background: '#362222', color: 'white', borderRadius: '30px', padding: '14px', textDecoration: 'none', fontWeight: 600 }}>
          Back to Wallet
        </Link>
      </div>
    </div>
  );
};

export default TopUpSuccess;
