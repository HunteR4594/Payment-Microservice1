import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import VoucherItem from './VoucherItem';
import './MyVouchersModal.css';

const MyVouchersModal = ({ vouchers = [], onUseVoucher, onRedeemVoucher, onClose, onViewHistory }) => {
  const [voucherCode, setVoucherCode] = React.useState('');
  const [redeemError, setRedeemError] = React.useState('');
  const [isRedeeming, setIsRedeeming] = React.useState(false);

  const handleRedeem = async () => {
    if (!voucherCode.trim()) {
      setRedeemError('Please enter a voucher code');
      return;
    }

    setIsRedeeming(true);
    setRedeemError('');

    try {
      if (onRedeemVoucher) {
        await onRedeemVoucher(voucherCode);
        setVoucherCode('');
      }
    } catch (error) {
      console.error('Failed to redeem voucher:', error);
      setRedeemError(error.message || 'Failed to redeem voucher');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="voucher-modal-overlay">
      <div className="voucher-modal">
        {/* Header */}
        <div className="voucher-header">
          <div className="header-container">
            <div className="header-left">
              <button className="back-arrow-button" onClick={onClose}>
                <i className="bi bi-chevron-left back-arrow"></i>
              </button>
              <h3 className="header-title">My Vouchers</h3>
            </div>
            <small 
              className="view-history" 
              onClick={onViewHistory}
              style={{ cursor: 'pointer' }}
            >
              View voucher history
            </small>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="voucher-main-card">
            {/* Add Voucher Section */}
            <div className="add-voucher-section">
              <span className="section-title">Add voucher</span>
              <div className="voucher-input">
                <input
                  type="text"
                  className="voucher-input-field"
                  placeholder="Enter Voucher or Discount Code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <button 
                  className="redeem-button" 
                  onClick={handleRedeem}
                  disabled={isRedeeming}
                >
                  {isRedeeming ? 'Redeeming...' : 'Redeem'}
                </button>
              </div>
              {redeemError && <small className="text-danger mt-2">{redeemError}</small>}
            </div>
            
            <hr className="voucher-separator" />
            
            {/* Vouchers List */}
            <div className="vouchers-list">
              {vouchers.length === 0 ? (
                <p className="text-muted text-center">No vouchers available</p>
              ) : (
                vouchers.map(voucher => (
                  <VoucherItem 
                    key={voucher.id || voucher.Id} 
                    voucher={voucher} 
                    onUse={() => onUseVoucher && onUseVoucher(voucher)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVouchersModal;
