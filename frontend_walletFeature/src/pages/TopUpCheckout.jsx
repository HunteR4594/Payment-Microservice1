import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/TopUpCheckout.css';
import { topUpApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const TopUpCheckout = () => {
  const { topUpId } = useParams();
  const navigate = useNavigate();
  const [topUp, setTopUp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentOpened, setPaymentOpened] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    loadTopUp();
  }, [topUpId]);

  // Poll for payment status when payment window is opened
  useEffect(() => {
    let interval;
    if (paymentOpened && topUp?.status === 'pending') {
      interval = setInterval(async () => {
        try {
          const response = await topUpApi.getById(topUpId);
          if (response.data.status === 'completed') {
            setTopUp(response.data);
            setPaymentOpened(false);
            navigate(`/topup/success/${topUpId}`);
          } else if (response.data.status === 'failed') {
            setTopUp(response.data);
            setPaymentOpened(false);
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [paymentOpened, topUp?.status, topUpId, navigate]);

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

  const handleProceedToPayment = () => {
    if (topUp.paymentLinkUrl.startsWith('/')) {
      // Mock payment - navigate within app
      navigate(topUp.paymentLinkUrl);
    } else {
      // Real PayMongo - open in new tab
      window.open(topUp.paymentLinkUrl, '_blank');
      setPaymentOpened(true);
    }
  };

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await topUpApi.getById(topUpId);
      setTopUp(response.data);
      if (response.data.status === 'completed') {
        navigate(`/topup/success/${topUpId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleConfirmPayment = async () => {
    setCheckingStatus(true);
    try {
      // Mark the top-up as completed
      await topUpApi.complete(topUpId);
      navigate(`/topup/success/${topUpId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingStatus(false);
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
          <div className="checkout-icon">
            <i className="bi bi-wallet2"></i>
          </div>
          
          <h2 className="checkout-title">Complete Your Top-up</h2>
          
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
              <span className="label">Status</span>
              <span className={`value status-${topUp.status}`}>
                {topUp.status.charAt(0).toUpperCase() + topUp.status.slice(1)}
              </span>
            </div>
          </div>

          {topUp.status === 'pending' && topUp.paymentLinkUrl && !paymentOpened && (
            <div className="checkout-actions">
              <button 
                className="btn-success-payment"
                onClick={handleProceedToPayment}
              >
                <i className="bi bi-lock-fill me-2"></i>
                Proceed to Secure Payment ({paymentMethodNames[topUp.paymentMethod]})
              </button>
              
              <button 
                className="btn-back"
                onClick={() => navigate('/topup')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Top-up
              </button>
            </div>
          )}

          {topUp.status === 'pending' && paymentOpened && (
            <div className="payment-waiting">
              <div className="waiting-icon">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Waiting...</span>
                </div>
              </div>
              <h3>Waiting for Payment</h3>
              <p className="text-muted">
                Complete your payment in the new tab that opened.<br />
                Click the button below once you've finished paying.
              </p>
              <div className="checkout-actions">
                <button 
                  className="btn-success-payment"
                  onClick={handleConfirmPayment}
                  disabled={checkingStatus}
                >
                  {checkingStatus ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-check-circle me-2"></i>
                  )}
                  I've Completed Payment
                </button>
                <button 
                  className="btn-back"
                  onClick={() => window.open(topUp.paymentLinkUrl, '_blank')}
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>
                  Reopen Payment Page
                </button>
                <button 
                  className="btn-back"
                  onClick={() => navigate('/wallet')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Wallet
                </button>
              </div>
            </div>
          )}

          {topUp.status === 'pending' && !topUp.paymentLinkUrl && (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-circle me-2"></i>
              Payment link is not available. Please try again.
              <br />
              <button className="btn btn-sm btn-outline-warning mt-2" onClick={() => navigate('/topup')}>
                Back to Top-up
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

export default TopUpCheckout;
