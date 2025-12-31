import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/TopUpCheckout.css';
import { topUpApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';

/**
 * Mock Checkout Page - Simulates PayMongo checkout for testing
 * Only used when PaymentProvider is set to "Mock" in backend_walletFeature
 */
const MockCheckout = () => {
  const { topUpId } = useParams();
  const navigate = useNavigate();
  const [topUp, setTopUp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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

  const handleSimulatePayment = async (success) => {
    setProcessing(true);
    try {
      if (success) {
        await topUpApi.complete(topUpId);
        navigate(`/topup/success/${topUpId}`);
      } else {
        await topUpApi.fail(topUpId);
        navigate(`/topup/failed/${topUpId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page d-flex justify-content-center align-items-center">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !topUp) {
    return (
      <div className="checkout-page">
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate('/wallet')}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <div className="logo-container">
            <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo" />
          </div>
        </div>
        <div className="checkout-content">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error || 'Top-up not found'}
          </div>
        </div>
      </div>
    );
  }

  const paymentMethodNames = {
    gcash: 'GCash',
    maya: 'Maya',
    card: 'Credit/Debit Card'
  };

  return (
    <div className="checkout-page">
      {/* Header */}
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate('/topup')}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <div className="logo-container">
          <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo" />
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-card">
          <div className="checkout-icon" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' }}>
            <i className="bi bi-gear-fill"></i>
          </div>
          
          <h2 className="checkout-title">Mock Payment Checkout</h2>
          
          <div className="mock-notice" style={{ background: '#e8f4fd', borderColor: '#2196f3', color: '#1565c0' }}>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Test Mode:</strong> This is a simulated checkout page.
            <br />
            <small>In production, you would be redirected to {paymentMethodNames[topUp.paymentMethod] || 'PayMongo'}.</small>
          </div>

          <div className="checkout-details">
            <div className="detail-row">
              <span className="label">Amount</span>
              <span className="value">{formatCurrency(topUp.amount)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Method</span>
              <span className="value">{paymentMethodNames[topUp.paymentMethod] || topUp.paymentMethod}</span>
            </div>
            <div className="detail-row">
              <span className="label">Reference</span>
              <span className="value">{topUp.referenceNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Top-up ID</span>
              <span className="value" style={{ fontSize: '0.85rem' }}>{topUp.id}</span>
            </div>
          </div>

          {topUp.status === 'pending' && (
            <div className="checkout-actions">
              <button 
                className="btn-success-payment"
                onClick={() => handleSimulatePayment(true)}
                disabled={processing}
              >
                {processing ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-check-circle me-2"></i>
                )}
                Simulate Successful Payment
              </button>
              
              <button 
                className="btn-fail-payment"
                onClick={() => handleSimulatePayment(false)}
                disabled={processing}
                style={{ 
                  width: '100%',
                  padding: '1rem',
                  background: 'white',
                  color: '#e74c3c',
                  border: '2px solid #e74c3c',
                  borderRadius: '30px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Simulate Failed Payment
              </button>
            </div>
          )}

          {topUp.status === 'completed' && (
            <div className="status-completed">
              <i className="bi bi-check-circle-fill"></i>
              <p>Payment completed successfully!</p>
              <button className="btn-back-wallet" onClick={() => navigate('/wallet')}>
                Back to Wallet
              </button>
            </div>
          )}

          {topUp.status === 'failed' && (
            <div className="status-failed">
              <i className="bi bi-x-circle-fill"></i>
              <p>Payment failed</p>
              <button className="btn-try-again" onClick={() => navigate('/topup')}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockCheckout;
