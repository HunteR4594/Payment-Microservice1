import React, { useState } from 'react';
import { topUpApi, walletApi } from '../services/api';
import './ReviewTopUp.css';

const ReviewTopUp = ({ show, onHide, amount, paymentMethod, onConfirm, onSuccess }) => {
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
      
      // Create top-up request via API
      const response = await topUpApi.create(amount, paymentMethod);
      
      if (response.success && response.data) {
        // If there's a checkout URL (PayMongo), redirect
        if (response.checkoutUrl) {
          if (response.checkoutUrl.startsWith('/')) {
            // Mock payment - call onConfirm with topUp data
            if (onConfirm) {
              onConfirm(response.data);
            }
          } else {
            // Real PayMongo - open in new tab
            window.open(response.checkoutUrl, '_blank');
            if (onConfirm) {
              onConfirm(response.data);
            }
          }
        } else {
          // No checkout URL, just confirm
          if (onConfirm) {
            onConfirm(response.data);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to create top-up. Please try again.');
      console.error('Top-up creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-overlay" onClick={onHide}>
      <div className="review-popup" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="review-header">
          <button className="review-back-btn" onClick={onHide} disabled={loading}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h2>Review and Confirm</h2>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-danger mx-3 mt-3" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* CONTENT */}
        <div className="review-content">
          <p className="review-label">Top-up amount</p>
          <h1 className="review-amount">₱ {amount?.toLocaleString() || '0'}.00</h1>
          <p className="review-mop">Pay with {paymentMethodNames[paymentMethod] || paymentMethod || 'Payment Method'}</p>
        </div>

        {/* BUTTON */}
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
