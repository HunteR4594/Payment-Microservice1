import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './VoucherItem.css';

const VoucherIcon = () => (
  <div className="voucher-icon">
    <i className="bi bi-cup-hot-fill"></i>
  </div>
);

const VoucherItem = ({ voucher, onUse }) => {
  if (!voucher) return null;
  
  const expiryText = `expiring in ${voucher?.hoursLeft || voucher?.HoursLeft || 24} hours`;
  const minSpend = Number(voucher?.minSpend ?? voucher?.MinSpend ?? 0);

  return (
    <div className="voucher-card"> 
      <div className="voucher-card-body">
        <div className="voucher-icon-section">
          <VoucherIcon />
        </div>
        
        <div className="voucher-text-section">
          <div className="voucher-details">
            <strong>[{voucher.name || voucher.Name}]</strong>
            <small>Min. Spend of ₱{minSpend.toFixed(2)}</small>
            <small className="expiry-text">{expiryText}</small>
          </div>
          <button 
            className="use-button"
            disabled={voucher.isUsed || voucher.IsUsed}
            onClick={() => onUse && onUse(voucher)}
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherItem;
