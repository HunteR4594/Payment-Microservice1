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
      
      // Check if we have a PayMongo checkout URL
      if (topUp?.paymentLinkUrl) {
        // Check if it's a mock URL or real PayMongo URL
        if (topUp.paymentLinkUrl.startsWith('/mock-checkout')) {
          // Mock mode - navigate to our mock checkout page
          navigate(topUp.paymentLinkUrl);
        } else if (topUp.paymentLinkUrl.startsWith('http')) {
          // Real PayMongo URL - redirect to external checkout
          window.location.href = topUp.paymentLinkUrl;
        } else {
          // Fallback - complete directly
          await topUpApi.complete(topUpId);
          navigate(`/topup/success/${topUpId}`);
        }
      } else {
        // No payment URL - complete directly (for testing)
        await topUpApi.complete(topUpId);
        navigate(`/topup/success/${topUpId}`);
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

  if (loading) {
    return (
      <div className="checkout-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
