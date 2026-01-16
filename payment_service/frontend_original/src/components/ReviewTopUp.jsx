import React, { useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { topUpApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import './ReviewTopUp.css';

const ReviewTopUp = ({ show, onHide, amount, paymentMethod, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethodNames = {
    gcash: 'GCash',
    maya: 'Maya',
    card: 'Credit/Debit Card',
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topUpApi.create(amount, paymentMethod);
      if (response.success && onConfirm) {
        onConfirm(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to create top-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="review-modal-content">
      <Modal.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <i 
            className="bi bi-chevron-left" 
            style={{ fontSize: '24px', cursor: 'pointer', marginRight: '12px' }} 
            onClick={onHide} 
          />
          <h2 className="review-title mb-0">Review Top-up</h2>
        </div>

        <div className="review-details">
          <div className="review-row">
            <span>Amount</span>
            <span className="fw-bold">{formatCurrency(amount)}</span>
          </div>
          <div className="review-row">
            <span>Payment Method</span>
            <span className="fw-bold">{paymentMethodNames[paymentMethod] || paymentMethod}</span>
          </div>
          <div className="review-row">
            <span>Fee</span>
            <span>₱0.00</span>
          </div>
          <div className="review-row total">
            <span>Total</span>
            <span className="fw-bold">{formatCurrency(amount)}</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mt-3">{error}</div>
        )}

        <button 
          className="confirm-topup-btn mt-4"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            'Confirm Top-up'
          )}
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default ReviewTopUp;
