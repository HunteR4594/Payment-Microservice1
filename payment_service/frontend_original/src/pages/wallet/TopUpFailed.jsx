import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TopUpFailed = () => {
  const { topUpId } = useParams();

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: 'white', borderRadius: '20px', padding: '3rem', maxWidth: '400px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <i className="bi bi-x-lg" style={{ fontSize: '40px', color: 'white' }}></i>
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '0.5rem' }}>
          Top-up Failed
        </h2>
        <p style={{ color: '#636e72', marginBottom: '1.5rem' }}>
          Something went wrong with your payment. Please try again.
        </p>
        <Link to="/topup" style={{ display: 'block', background: '#362222', color: 'white', borderRadius: '30px', padding: '14px', textDecoration: 'none', fontWeight: 600 }}>
          Try Again
        </Link>
      </div>
    </div>
  );
};

export default TopUpFailed;
