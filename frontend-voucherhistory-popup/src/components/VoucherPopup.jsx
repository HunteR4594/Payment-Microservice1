import React, { useState } from 'react';
import './VoucherPopup.css';

const VoucherModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return <button onClick={() => setIsOpen(true)}>Show Vouchers</button>;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <button className="back-button" onClick={() => setIsOpen(false)} aria-label="Back">
            <span className="back-icon">{'<'}</span>
          </button> 
          <h1 className="vp-heading">Voucher history</h1>
        </div>

        {/* Top Section */}
        <div className="history-top">

          
          <div className="voucher-banner">
            <div className="banner-icon"><i className="bi bi-cup-fill" aria-hidden style={{fontSize:18,color:'#fff'}}></i></div>
            <div className="banner-info">
              <p className="voucher-name">[voucher name]</p>
              <p className="voucher-sub">Min. Spend of [amount]</p>
            </div>
          </div>
          <hr className="divider" />
        </div>

        {/* Voucher List */}
        <div className="voucher-list">
          {[1, 2].map((item) => (
            <div key={item} className="voucher-card">
              <div className="card-header">
                <h3>voucher entry</h3>
                <div className="radio-btn"></div>
              </div>
              
              {item === 2 && <p className="label-tag">voucher entry</p>}

              <div className="card-content">
                <div className="order-row">
                  <span className="icon-bg">📄</span>
                  <div className="text-group">
                    <p className="primary-text">Order [date]</p>
                    {item === 1 && <p className="secondary-text">[Order Location]</p>}
                  </div>
                </div>
                
                <div className="voucher-banner small">
                  <div className="banner-icon">☕</div>
                  <div className="banner-info">
                    <p className="voucher-name">[voucher name]</p>
                    <p className="voucher-sub">Min. Spend of [amount]</p>
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

export default VoucherModal;