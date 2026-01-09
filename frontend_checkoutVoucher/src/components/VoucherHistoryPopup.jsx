import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './VoucherHistoryPopup.css';

const VoucherHistoryPopup = ({ 
  show, 
  onClose, 
  vouchers = [],
  onSelectVoucher,
  currentVoucher
}) => {
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  useEffect(() => {
    if (show && currentVoucher) {
      setSelectedVoucherId(currentVoucher.id || currentVoucher.Id);
    }
  }, [show, currentVoucher]);

  if (!show) return null;

  const handleSelect = (voucher) => {
    setSelectedVoucherId(voucher.id || voucher.Id);
    if (onSelectVoucher) {
      onSelectVoucher(voucher);
    }
  };

  // Mock data if no vouchers provided
  const displayVouchers = vouchers.length > 0 ? vouchers : [
    {
      id: 1,
      name: 'Free Delivery',
      minSpend: 200,
      usedOn: { date: '01/05/2026', location: 'SM North Edsa' }
    },
    {
      id: 2,
      name: '10% Off',
      minSpend: 500,
      usedOn: { date: '12/28/2025', location: 'BGC High Street' }
    }
  ];

  return (
    <div className="voucher-history-overlay" onClick={onClose}>
      <div className="voucher-history-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="voucher-history-header">
          <button className="voucher-back-button" onClick={onClose} aria-label="Back">
            <span className="voucher-back-icon">
              <i className="bi bi-chevron-left"></i>
            </span>
          </button> 
          <h1 className="voucher-history-heading">Voucher history</h1>
        </div>

        {/* Top Section - Featured Voucher */}
        {currentVoucher && (
          <div className="voucher-history-top">
            <div className="voucher-banner">
              <div className="banner-icon">
                <i className="bi bi-cup-fill"></i>
              </div>
              <div className="banner-info">
                <p className="voucher-name">{currentVoucher.name || currentVoucher.Name || '[voucher name]'}</p>
                <p className="voucher-sub">Min. Spend of ₱{currentVoucher.minSpend || currentVoucher.MinSpend || '[amount]'}</p>
              </div>
            </div>
            <hr className="voucher-divider" />
          </div>
        )}

        {/* Voucher List */}
        <div className="voucher-history-list">
          {displayVouchers.map((voucher, index) => (
            <div 
              key={voucher.id || voucher.Id || index} 
              className={`voucher-history-card ${selectedVoucherId === (voucher.id || voucher.Id) ? 'selected' : ''}`}
              onClick={() => handleSelect(voucher)}
            >
              <div className="voucher-card-header">
                <h3>{voucher.name || voucher.Name || 'Voucher'}</h3>
                <div className={`voucher-radio-btn ${selectedVoucherId === (voucher.id || voucher.Id) ? 'checked' : ''}`}></div>
              </div>

              <div className="voucher-card-content">
                {voucher.usedOn && (
                  <div className="voucher-order-row">
                    <span className="voucher-icon-bg">
                      <i className="bi bi-receipt"></i>
                    </span>
                    <div className="voucher-text-group">
                      <p className="voucher-primary-text">Order [{voucher.usedOn.date}]</p>
                      {voucher.usedOn.location && (
                        <p className="voucher-secondary-text">[{voucher.usedOn.location}]</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="voucher-banner small">
                  <div className="banner-icon">
                    <i className="bi bi-cup-fill"></i>
                  </div>
                  <div className="banner-info">
                    <p className="voucher-name">{voucher.name || voucher.Name || '[voucher name]'}</p>
                    <p className="voucher-sub">Min. Spend of ₱{voucher.minSpend || voucher.MinSpend || '[amount]'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoucherHistoryPopup;
