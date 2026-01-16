import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const TopUpCheckout = () => {
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
      
      if (response.data?.paymentLinkUrl) {
        window.location.href = response.data.paymentLinkUrl;
      }
    } catch (err) {
      console.error('Failed to load top-up:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = () => {
    navigate(`/mock-checkout/${topUpId}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '1.5rem' }}>
          Complete Payment
        </h2>
        
        <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p className="mb-2"><strong>Amount:</strong> {formatCurrency(topUp?.amount || 0)}</p>
          <p className="mb-2"><strong>Method:</strong> {topUp?.paymentMethod}</p>
          <p className="mb-0"><strong>Status:</strong> {topUp?.status}</p>
        </div>

        {topUp?.paymentLinkUrl ? (
          <a 
            href={topUp.paymentLinkUrl} 
            className="btn w-100" 
            style={{ background: '#362222', color: 'white', borderRadius: '30px', padding: '14px' }}
          >
            Proceed to Payment
          </a>
        ) : (
          <button 
            onClick={handleMockPayment}
            className="btn w-100"
            style={{ background: '#362222', color: 'white', borderRadius: '30px', padding: '14px' }}
          >
            Complete Payment (Mock)
          </button>
        )}
      </div>
    </div>
  );
};

export default TopUpCheckout;
