import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/TopUpPage.css';
import { topUpApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { ReviewTopUp } from '../components';

const TopUpPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

  const paymentMethods = [
    { id: 'gcash', name: 'GCash', icon: 'bi-phone' },
    { id: 'maya', name: 'Maya', icon: 'bi-credit-card' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'bi-credit-card-2-front' },
  ];

  // Show review popup before proceeding
  const handleShowReview = () => {
    if (!amount || !selectedMethod) return;
    setShowReviewPopup(true);
  };

  // Handle confirmed top-up from ReviewTopUp popup
  const handleTopUpConfirmed = (topUpData) => {
    setShowReviewPopup(false);
    // Navigate to checkout page with the top-up ID
    navigate(`/topup/checkout/${topUpData.id}`);
  };

  // Legacy direct top-up (bypassing popup)
  const handleTopUp = async () => {
    if (!amount || !selectedMethod) return;

    try {
      setLoading(true);
      setError(null);
      
      // Create top-up request
      const response = await topUpApi.create(parseFloat(amount), selectedMethod);
      
      if (response.success) {
        // Navigate to checkout page with the top-up ID
        navigate(`/topup/checkout/${response.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create top-up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topup-page">
      {/* Header */}
      <div className="topup-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <div className="logo-container">
          <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo" />
        </div>
      </div>

      <div className="topup-content">
        <h2 className="topup-title">Top-up Wallet</h2>

        {error && (
          <div className="alert alert-danger mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Amount Selection */}
        <div className="amount-section">
          <label className="section-label">Select Amount</label>
          <div className="preset-amounts">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                className={`preset-btn ${amount === String(preset) ? 'active' : ''}`}
                onClick={() => setAmount(String(preset))}
              >
                ₱{preset}
              </button>
            ))}
          </div>
          
          <div className="custom-amount">
            <label>Or enter custom amount</label>
            <div className="input-group">
              <span className="currency">₱</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-section">
          <label className="section-label">Payment Method</label>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`payment-btn ${selectedMethod === method.id ? 'active' : ''}`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <i className={`bi ${method.icon}`}></i>
                <span>{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {amount && (
          <div className="summary-section">
            <div className="summary-row">
              <span>Amount</span>
              <span>{formatCurrency(parseFloat(amount))}</span>
            </div>
            <div className="summary-row">
              <span>Fee</span>
              <span>₱0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(parseFloat(amount))}</span>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <button 
          className="confirm-btn"
          onClick={handleShowReview}
          disabled={!amount || !selectedMethod || loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Processing...
            </>
          ) : (
            'Confirm Top-up'
          )}
        </button>
      </div>

      {/* Review Top-up Popup */}
      <ReviewTopUp
        show={showReviewPopup}
        onHide={() => setShowReviewPopup(false)}
        amount={parseFloat(amount) || 0}
        paymentMethod={selectedMethod}
        onConfirm={handleTopUpConfirmed}
      />
    </div>
  );
};

export default TopUpPage;
