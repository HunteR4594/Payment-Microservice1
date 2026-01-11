import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './OrderFailedPopup.css';

const OrderFailedPopup = ({ 
  show, 
  onClose, 
  onBackToMenu
}) => {
  if (!show) return null;

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
        {/* Failed Icon */}
        <div className="order-failed-icon">
          <i className="bi bi-x-circle-fill"></i>
        </div>

        {/* Title */}
        <h1 className="order-modal-title">Order Failed</h1>

        {/* Back to Main Menu Link */}
        <button className="order-back-link" onClick={handleBackToMenu}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default OrderFailedPopup;