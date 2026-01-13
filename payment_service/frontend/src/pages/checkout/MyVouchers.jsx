import React, { useState, useEffect } from 'react';
import { vouchersApi } from '../../services/api';
import './MyVouchers.css';

const MyVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const response = await vouchersApi.getAll();
      setVouchers(response.data || response || []);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
      // Mock vouchers for demo
      // setVouchers([
      //   { id: 1, code: 'SAVE20', discount: 20, type: 'percentage', minOrder: 200, expiresAt: '2026-02-28' },
      //   { id: 2, code: 'FREEDEL', discount: 60, type: 'fixed', minOrder: 300, expiresAt: '2026-01-31' },
      //   { id: 3, code: 'COFFEE50', discount: 50, type: 'fixed', minOrder: 150, expiresAt: '2026-03-15' },
      // ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="vouchers-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vouchers-page">
      <h2 className="page-title">My Vouchers</h2>

      {vouchers.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-ticket-perforated"></i>
          <p>No vouchers available</p>
        </div>
      ) : (
        <div className="vouchers-grid">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="voucher-card">
              <div className="voucher-left">
                <div className="voucher-discount">
                  {/* FIX: Use discountValue and check case-insensitive type */}
                  {voucher.discountType?.toLowerCase() === 'percentage' 
                    ? `${voucher.discountValue}%` 
                    : `₱${voucher.discountValue}`}
                </div>
                <div className="voucher-label">OFF</div>
              </div>
              <div className="voucher-right">
                <div className="voucher-code">{voucher.code}</div>
                <div className="voucher-details">
                  {/* FIX: Use minimumPurchase and validUntil */}
                  <span>Min. order: ₱{voucher.minimumPurchase}</span>
                  <span>Expires: {new Date(voucher.validUntil).toLocaleDateString()}</span>
                </div>
                {/* ADD: Functionality to Use Now */}
                <button 
                  className="use-btn" 
                  onClick={() => {
                    localStorage.setItem('selectedVoucher', voucher.code);
                    window.location.href = '/checkout'; // Or use useNavigate()
                  }}
                >
                  Use Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVouchers;
