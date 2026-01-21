import React, { useState } from 'react';
import { topUpApi } from '../services/api';
import './ReviewTopUp.css';

const ReviewTopUp = ({ show, onHide, amount, paymentMethod, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!show) return null;

  const paymentMethodNames = {
    gcash: 'GCash',
    maya: 'Maya',
    card: 'Credit/Debit Card'
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await topUpApi.create(amount, paymentMethod);

      if (response.success && response.data) {
        if (response.checkoutUrl) {
          // Direct redirect to PayMongo (same tab)
          window.location.href = response.checkoutUrl;
        } else {
          // Fallback if no URL (shouldn't happen with PayMongo)
          if (onConfirm) {
            onConfirm(response.data);
          }
        }
      }
    } catch (err) {
      console.error('Top-up creation failed:', err);
      setError(err?.message || 'Top-up service unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-overlay" onClick={onHide}>
      <div className="review-popup" onClick={(e) => e.stopPropagation()}>
        <div className="review-header">
          <button className="review-back-btn" onClick={onHide} disabled={loading}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h2>Review and Confirm</h2>
        </div>

        {error && (
          <div className="alert alert-danger mx-3 mt-3" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <div className="review-content">
          <p className="review-label">Top-up amount</p>
          <h1 className="review-amount">₱ {amount?.toLocaleString() || '0'}.00</h1>
          <p className="review-mop">Pay with {paymentMethodNames[paymentMethod] || paymentMethod || 'Payment Method'}</p>
        </div>

        <button
          className="review-confirm-btn"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            'Confirm Top-up'
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewTopUp;
