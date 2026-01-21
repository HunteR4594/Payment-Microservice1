import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import './TopUpCheckout.css';

const TopUpCheckout = () => {
  const { topUpId } = useParams();
  const navigate = useNavigate();
  const [topUp, setTopUp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTopUp();
  }, [topUpId]);

  // Poll for status updates if pending (webhook might complete it)
  useEffect(() => {
    if (topUp?.status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const response = await topUpApi.getById(topUpId);
          if (response.data?.status === 'completed') {
            setTopUp(response.data);
          }
        } catch (err) {
          // Ignore polling errors
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [topUp?.status, topUpId]);

  // Proactive verification check when returning from PayMongo
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isPaymentReturn = searchParams.get('payment_return') === 'true';

    if (isPaymentReturn && topUpId && topUp?.status === 'pending') {
      const verifyPayment = async () => {
        try {
          await topUpApi.verify(topUpId);
          // The polling effect will pick up the status change
          loadTopUp();
        } catch (err) {
          console.error("Proactive verification failed:", err);
        }
      };

      // Run immediately
      verifyPayment();
    }
  }, [topUpId, topUp?.status]);

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

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // ONLY redirect to PayMongo if we have a payment URL
      // NEVER complete payment directly from frontend - that's a security issue!
      if (topUp?.paymentUrl && topUp.paymentUrl.startsWith('http')) {
        // Real PayMongo URL - redirect to external checkout
        window.location.href = topUp.paymentUrl;
      } else {
        // No valid payment URL - show error
        // Payment should ONLY be completed via webhook after PayMongo confirms
        setError('No payment link available. Please create a new top-up.');
        setProcessing(false);
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      await topUpApi.fail(topUpId);
      navigate(`/topup/failed/${topUpId}`);
    } catch (err) {
      navigate('/wallet');
    }
  };

  const handleGoToWallet = () => {
    navigate('/wallet');
  };

  if (loading) {
    return (
      <div className="checkout-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show success state if payment is completed
  if (topUp?.status === 'completed') {
    return (
      <div className="checkout-page">
        <div className="checkout-card text-center">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="text-success mb-3">Payment Successful!</h2>
          <p className="text-muted mb-4">
            Your wallet has been credited with {formatCurrency(topUp?.amount || 0)}
          </p>

          <div className="checkout-details mb-4">
            <div className="detail-row">
              <span>Amount</span>
              <span className="text-success fw-bold">{formatCurrency(topUp?.amount || 0)}</span>
            </div>
            <div className="detail-row">
              <span>Payment Method</span>
              <span>{topUp?.paymentMethod || '-'}</span>
            </div>
            <div className="detail-row">
              <span>Reference</span>
              <span>{topUp?.referenceNumber || '-'}</span>
            </div>
            <div className="detail-row">
              <span>Status</span>
              <span className="badge bg-success">Completed</span>
            </div>
          </div>

          <button
            className="btn btn-success btn-lg w-100"
            onClick={handleGoToWallet}
          >
            Go to Wallet
          </button>
        </div>
      </div>
    );
  }

  // Check if we just returned from PayMongo
  const searchParams = new URLSearchParams(window.location.search);
  const isPaymentReturn = searchParams.get('payment_return') === 'true';

  // Show verifying state if we returned but status is still pending (race condition)
  if (topUp?.status === 'pending' && isPaymentReturn) {
    return (
      <div className="checkout-page">
        <div className="checkout-card text-center">
          <div className="mb-4">
            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
              <span className="visually-hidden">Verifying...</span>
            </div>
          </div>
          <h2 className="mb-3">Verifying Payment...</h2>
          <p className="text-muted mb-4">
            Please wait while we confirm your payment with PayMongo. <br />
            This usually takes a few seconds.
          </p>
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Do not close this window.
          </div>
        </div>
      </div>
    );
  }

  // Show pending/payment needed state
  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h2>Complete Payment</h2>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <div className="checkout-details">
          <div className="detail-row">
            <span>Amount</span>
            <span>{formatCurrency(topUp?.amount || 0)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method</span>
            <span>{topUp?.paymentMethod || '-'}</span>
          </div>
          <div className="detail-row">
            <span>Reference</span>
            <span>{topUp?.referenceNumber || '-'}</span>
          </div>
        </div>

        <div className="checkout-actions">
          <button
            className="btn btn-success btn-lg w-100 mb-2"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </button>
          <button
            className="btn btn-outline-secondary w-100"
            onClick={handleCancel}
            disabled={processing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopUpCheckout;
