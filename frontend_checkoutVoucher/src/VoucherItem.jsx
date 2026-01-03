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

const VoucherItem = ({ voucher, onUse }) => {
  const expiryText = `expiring in ${voucher.hoursLeft || voucher.HoursLeft} hours`;

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
            <strong>[{voucher.name || voucher.Name}]</strong>
            <small>Min. Spend of ₱{(voucher.minSpend || voucher.MinSpend || 0).toFixed(2)}</small>
            <small className="expiry-text">{expiryText}</small>
          </div>
          <button 
            className="use-button"
            disabled={voucher.isUsed || voucher.IsUsed}
            onClick={onUse}
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherItem;
