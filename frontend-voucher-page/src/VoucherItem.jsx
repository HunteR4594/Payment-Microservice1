// src/VoucherItem.jsx
import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './MyVouchers.css';

// Coffee cup icon component using Bootstrap Icons
const VoucherIcon = () => (
  <div className="voucher-icon">
    <i className="bi bi-cup-hot-fill"></i>
  </div>
);

const VoucherItem = ({ voucher }) => {
  const expiryText = `expiring in ${voucher.hoursLeft} hours`;

  return (
    <div className="voucher-card"> 
      <div className="voucher-card-body">
        
        {/* Dark brown section with icon */}
        <div className="voucher-icon-section">
          <VoucherIcon />
        </div>
        
        {/* Text and Button Section */}
        <div className="voucher-text-section">
          <div className="voucher-details">
            <strong>[{voucher.name}]</strong>
            <small>Min. Spend of ${voucher.minSpend.toFixed(2)}</small>
            <small className="expiry-text">{expiryText}</small>
          </div>
          <button 
            className="use-button"
            disabled={voucher.isUsed}
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherItem;