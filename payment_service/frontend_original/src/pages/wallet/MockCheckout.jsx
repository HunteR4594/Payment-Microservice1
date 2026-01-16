import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topUpApi } from '../../services/api';

const MockCheckout = () => {
  const { topUpId } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSuccess = async () => {
    setProcessing(true);
    try {
      await topUpApi.complete(topUpId);
      navigate(`/topup/success/${topUpId}`);
    } catch (err) {
      console.error('Failed to complete top-up:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleFail = async () => {
    setProcessing(true);
    try {
      await topUpApi.fail(topUpId);
      navigate(`/topup/failed/${topUpId}`);
    } catch (err) {
      console.error('Failed to fail top-up:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>
          Mock Payment Gateway
        </h2>
        <p style={{ color: '#636e72', marginBottom: '2rem' }}>
          This is a simulated payment page. Choose an outcome:
        </p>
        <div className="d-grid gap-3">
          <button 
            onClick={handleSuccess}
            disabled={processing}
            style={{ background: '#27ae60', color: 'white', border: 'none', borderRadius: '30px', padding: '14px', fontWeight: 600 }}
          >
            Simulate Success
          </button>
          <button 
            onClick={handleFail}
            disabled={processing}
            style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '30px', padding: '14px', fontWeight: 600 }}
          >
            Simulate Failure
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockCheckout;
