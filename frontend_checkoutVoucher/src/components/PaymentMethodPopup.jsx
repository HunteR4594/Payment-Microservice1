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
        {/* Close Button */}
        <button className="payment-close-btn" onClick={onClose}>
          <i className="bi bi-x-circle"></i>
        </button>

        {/* Title */}
        <h2 className="payment-modal-title">Select payment method</h2>

        {/* Payment Options */}
        <div className="payment-options">
          
          {/* Kapebara Wallet */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="payment-logo">
                <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo-img" />
              </div>
              <div className="payment-details">
                <div className="payment-name">My Kapebara Wallet</div>
                {selectedMethod === 'kapebara' && (
                  <div className="payment-balance">
                    your total balance is ₱{walletBalance?.toLocaleString() || '[Balance]'}
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
                <img src="/visa-logo.png" alt="Visa" className="card-logo" />
                <img src="/mastercard-logo.png" alt="Mastercard" className="card-logo" />
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

          {/* E-wallet - GCash */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="ewallet-logos">
                <img src="/gcash-logo.png" alt="GCash" className="ewallet-logo" />
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

          {/* E-wallet - Maya */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="ewallet-logos">
                <img src="/maya-logo.png" alt="Maya" className="ewallet-logo" />
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

          {/* E-wallet - GrabPay */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="ewallet-logos">
                <img src="/grabpay-logo.svg" alt="GrabPay" className="ewallet-logo" />
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

          {/* Other online payment method */}
          <label className="payment-option">
            <div className="payment-info">
              <div className="payment-details">
                <div className="payment-name">Other online payment method</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              value="other"
              checked={selectedMethod === 'other'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
          </label>
        </div>

        {/* Confirm Button */}
        <button className="payment-confirm-btn" onClick={handleConfirm}>
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodPopup;
