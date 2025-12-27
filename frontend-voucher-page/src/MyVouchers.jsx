// src/MyVouchers.jsx
import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import VoucherItem from './VoucherItem';
import './MyVouchers.css';

// Mock data to display the voucher cards
const mockVouchers = [
  { id: 1, name: 'voucher name', minSpend: 15.00, hoursLeft: 48, isUsed: false },
];

const MyVouchers = () => {
  return (
    <div className="app-container"> 
      
      {/* Header */}
      <div className="voucher-header">
        <div className="header-container">
          <div className="header-left">
            <button className="back-arrow-button">
              <i className="bi bi-chevron-left back-arrow"></i>
            </button>
            <h3 className="header-title">My Vouchers</h3>
          </div>
          <small className="view-history">View voucher history</small>
        </div>
      </div>

      <div className="content-wrapper">
        
        {/* Main Card containing Add voucher and Vouchers List */}
        <div className="voucher-main-card">
          
          {/* Add Voucher Section */}
          <div className="add-voucher-section">
            <span className="section-title">Add voucher</span>
            <div className="voucher-input">
              <input
                type="text"
                className="voucher-input-field"
                placeholder="Enter Voucher or Discount Code"
                aria-label="Voucher Code"
              />
              <button className="redeem-button">
                Redeem
              </button>
            </div>
          </div>
          
          {/* Separator Line */}
          <hr className="voucher-separator" />
          
          {/* Vouchers List */}
          <div className="vouchers-list">
            {mockVouchers.map(voucher => (
              <VoucherItem key={voucher.id} voucher={voucher} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVouchers;