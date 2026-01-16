import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVouchers, redeemVoucher, applyVoucher } from '../../services/api';
import VoucherItem from '../../components/VoucherItem';
import VoucherHistoryPopup from '../../components/VoucherHistoryPopup';
import './MyVouchers.css';

const MyVouchers = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await getVouchers();
        setVouchers(data);
      } catch (error) {
        console.error('Failed to load vouchers:', error);
        // Fallback mock vouchers
        setVouchers([
          { id: 1, name: 'SAVE20', minSpend: 15.00, hoursLeft: 48, isUsed: false, discountAmount: 20.00 },
          { id: 2, name: 'FREESHIP', minSpend: 50.00, hoursLeft: 72, isUsed: false, discountAmount: 30.00 },
        ]);
      }
    };

    fetchVouchers();
  }, []);

  const handleRedeem = async () => {
    if (!voucherCode.trim()) {
      setRedeemError('Please enter a voucher code');
      return;
    }

    setIsRedeeming(true);
    setRedeemError('');

    try {
      const voucher = await redeemVoucher(voucherCode);
      if (voucher) {
        setVouchers(prev => [...prev, voucher]);
        setVoucherCode('');
        alert(`Voucher "${voucher.name || voucher.Name || 'Unknown'}" redeemed successfully!`);
      }
    } catch (error) {
      console.error('Failed to redeem voucher:', error);
      setRedeemError(error.message || 'Failed to redeem voucher');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleUseVoucher = async (voucher) => {
    if (!voucher || !voucher.id) {
      alert('Invalid voucher selected');
      return;
    }
    
    try {
      await applyVoucher(voucher.id, 0);
      setAppliedVoucher(voucher);
      alert(`Voucher "${voucher.name || voucher.Name || 'Unknown'}" applied!`);
    } catch (error) {
      console.error('Failed to apply voucher:', error);
      alert(error.message || 'Failed to apply voucher');
    }
  };

  return (
    <div className="vouchers-page">
      <div className="vouchers-container">
        {/* Header */}
        <div className="voucher-header">
          <div className="header-container">
            <div className="header-left">
              <button className="back-arrow-button" onClick={() => navigate(-1)}>
                <i className="bi bi-chevron-left back-arrow"></i>
              </button>
              <h3 className="header-title">My Vouchers</h3>
            </div>
            <small 
              className="view-history" 
              onClick={() => setShowHistory(true)}
              style={{ cursor: 'pointer' }}
            >
              View voucher history
            </small>
          </div>
        </div>

        <div className="content-wrapper">
          {/* Main Card */}
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
              {vouchers.filter(v => !(v.isUsed || v.IsUsed)).length === 0 ? (
                <p className="text-muted text-center">No vouchers available</p>
              ) : (
                vouchers
                  .filter(v => !(v.isUsed || v.IsUsed))
                  .map(voucher => (
                    <VoucherItem 
                      key={voucher.id || voucher.Id} 
                      voucher={voucher} 
                      onUse={() => handleUseVoucher(voucher)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Voucher History Popup */}
        <VoucherHistoryPopup
          show={showHistory}
          onClose={() => setShowHistory(false)}
          vouchers={vouchers}
          currentVoucher={appliedVoucher}
          onSelectVoucher={(voucher) => {
            handleUseVoucher(voucher);
            setShowHistory(false);
          }}
        />
      </div>
    </div>
  );
};

export default MyVouchers;
