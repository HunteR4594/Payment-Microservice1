import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './OrderPlacedPopup.css';

const OrderPlacedPopup = ({ 
  show, 
  onClose, 
  orderNumber, 
  total, 
  coinsEarned, 
  estimatedDate, 
  estimatedTime,
  onViewOrderStatus,
  onBackToMenu
}) => {
  if (!show) return null;

  const handleViewOrderStatus = () => {
    if (onViewOrderStatus) {
      onViewOrderStatus();
    } else {
      onClose();
    }
  };

  const handleBackToMenu = () => {
    if (onBackToMenu) {
      onBackToMenu();
    } else {
      onClose();
    }
  };

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Success Icon */}
        <div className="order-success-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>

        {/* Title */}
        <h1 className="order-modal-title">Order Placed Successfully</h1>

        {/* Order Number */}
        <p className="order-number">Order No. {orderNumber || '[orderNumber]'}</p>

        {/* Total */}
        <p className="order-total">Total: ₱{total?.toLocaleString() || '[PRICE]'}.00</p>

        {/* Coins Earned */}
        <p className="order-coins-earned">
          <i className="bi bi-coin"></i>
          <span>Coins earned: {coinsEarned || '[x]'} coins</span>
        </p>

        {/* Estimated Delivery */}
        <p className="order-delivery-estimate">
          Estimated Delivery: {estimatedDate || '[Date]'}, {estimatedTime || '[time]'}
        </p>

        {/* View Order Status Button */}
        <button className="order-view-btn" onClick={handleViewOrderStatus}>
          View order status
        </button>

        {/* Back to Main Menu Link */}
        <button className="order-back-link" onClick={handleBackToMenu}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default OrderPlacedPopup;
