import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './TopUpPage.css';
import { topUpApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import ReviewTopUp from '../../components/ReviewTopUp';

const TopUpPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // Card form fields
  const [cardData, setCardData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

  const paymentMethods = [
    { id: 'gcash', name: 'GCash', icon: 'bi-phone', img: '/gcash-logo.png' },
    { id: 'maya', name: 'Maya', icon: 'bi-credit-card', img: '/maya-logo.png' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'bi-credit-card-2-front', imgMulti: ['/mastercard-logo.png', '/visa-logo.png'] },
  ];

  const handleShowReview = () => {
    if (!amount || !selectedMethod) return;
    setShowReviewPopup(true);
  };

  const handleTopUpConfirmed = (topUpData) => {
    setShowReviewPopup(false);
    navigate(`/topup/checkout/${topUpData.id}`);
  };

  const handleCardDataChange = (field, value) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="topup-page">
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
                {method.img ? (
                  <img src={method.img} alt={method.name} className="payment-logo-img" />
                ) : method.imgMulti ? (
                  <span className="payment-logo-multi">
                    {method.imgMulti.map((src, i) => (
                      <img key={i} src={src} alt={`${method.name}-${i}`} className="payment-logo-img" />
                    ))}
                  </span>
                ) : (
                  <i className={`bi ${method.icon}`}></i>
                )}
                <span>{method.name}</span>
              </button>
            ))}
          </div>

          {/* Card Form - Shows when card is selected */}
          {selectedMethod === 'card' && (
            <div className="card-form-section">
              <div className="card-form-row">
                <input
                  type="text"
                  placeholder="Name of Card holder"
                  className="card-input full-width"
                  value={cardData.cardholderName}
                  onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
                />
              </div>

              <div className="card-form-row">
                <input
                  type="text"
                  placeholder="Card Number"
                  className="card-input full-width"
                  value={cardData.cardNumber}
                  onChange={(e) => handleCardDataChange('cardNumber', e.target.value)}
                  maxLength="16"
                />
              </div>
              
              <div className="card-form-row expiry-cvv">
                <input
                  type="text"
                  placeholder="MM"
                  className="card-input expiry-input"
                  value={cardData.expiryMonth}
                  onChange={(e) => handleCardDataChange('expiryMonth', e.target.value)}
                  maxLength="2"
                />
                <span className="expiry-slash">/</span>
                <input
                  type="text"
                  placeholder="YYYY"
                  className="card-input expiry-input"
                  value={cardData.expiryYear}
                  onChange={(e) => handleCardDataChange('expiryYear', e.target.value)}
                  maxLength="4"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="card-input cvv-input"
                  value={cardData.cvv}
                  onChange={(e) => handleCardDataChange('cvv', e.target.value)}
                  maxLength="3"
                />
              </div>
            </div>
          )}
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
        cardData={selectedMethod === 'card' ? cardData : null}
        onConfirm={handleTopUpConfirmed}
      />
    </div>
  );
};

export default TopUpPage;