import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './PaymentMethodPopup.css';

const PaymentMethodPopup = ({ 
  show, 
  onClose, 
  onConfirm, 
  walletBalance,
  initialMethod = 'kapebara'
}) => {
  const [selectedMethod, setSelectedMethod] = useState(initialMethod);

  useEffect(() => {
    if (show) {
      setSelectedMethod(initialMethod);
    }
  }, [show, initialMethod]);

  if (!show) return null;

  const handleConfirm = () => {
    const paymentData = {
      method: selectedMethod
    };
    if (onConfirm) {
      onConfirm(paymentData);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-close-btn" onClick={onClose}>
          <i className="bi bi-x-circle"></i>
        </button>

        <h2 className="payment-modal-title">Select payment method</h2>

        <div className="payment-options">
          {/* Kapebara Wallet */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="payment-logo">
                <i className="bi bi-wallet2" style={{ fontSize: '24px', color: '#3B302A' }}></i>
              </div>
              <div className="payment-details">
                <div className="payment-name">My Kapebara Wallet</div>
                {selectedMethod === 'kapebara' && (
                  <div className="payment-balance">
                    your total balance is ₱{walletBalance?.toLocaleString() || '0'}
                  </div>
                )}
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              value="kapebara"
              checked={selectedMethod === 'kapebara'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
          </label>

          {/* Credit/Debit Card */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="card-logos">
                <i className="bi bi-credit-card" style={{ fontSize: '24px', color: '#3B302A' }}></i>
              </div>
              <div className="payment-details">
                <div className="payment-name">Credit/Debit Card</div>
                {selectedMethod === 'card' && (
                  <div className="payment-note">You'll enter card details on PayMongo's secure page</div>
                )}
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              value="card"
              checked={selectedMethod === 'card'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
          </label>

          {/* GCash */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="ewallet-logos">
                <i className="bi bi-phone" style={{ fontSize: '24px', color: '#007DFE' }}></i>
              </div>
              <div className="payment-details">
                <div className="payment-name">GCash</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              value="gcash"
              checked={selectedMethod === 'gcash'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
          </label>

          {/* Maya */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="ewallet-logos">
                <i className="bi bi-phone" style={{ fontSize: '24px', color: '#00D100' }}></i>
              </div>
              <div className="payment-details">
                <div className="payment-name">Maya</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              value="paymaya"
              checked={selectedMethod === 'paymaya'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
          </label>

          {/* GrabPay */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="ewallet-logos">
                <i className="bi bi-phone" style={{ fontSize: '24px', color: '#00B14F' }}></i>
              </div>
              <div className="payment-details">
                <div className="payment-name">GrabPay</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              value="grab_pay"
              checked={selectedMethod === 'grab_pay'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
          </label>
        </div>

        <button className="payment-confirm-btn" onClick={handleConfirm}>
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodPopup;
