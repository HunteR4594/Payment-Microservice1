import React, { useState, useEffect } from 'react';
import { vouchersApi } from '../../services/api';
import './MyVouchers.css';

const MyVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const response = await vouchersApi.getAll();
      setVouchers(response.data || response || []);
      setUseMock(false);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
      // Use mock vouchers when backend is not available
      setUseMock(true);
      setVouchers([
        { id: 'v1', code: 'SAVE20', discountValue: 20, discountType: 'percentage', minimumPurchase: 200, validUntil: '2026-02-28' },
        { id: 'v2', code: 'FREEDEL', discountValue: 60, discountType: 'fixed', minimumPurchase: 300, validUntil: '2026-01-31' },
        { id: 'v3', code: 'COFFEE50', discountValue: 50, discountType: 'fixed', minimumPurchase: 150, validUntil: '2026-03-15' },
      ]);
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
      {useMock && (
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Showing mock vouchers — backend unavailable. 
          <button className="btn btn-sm btn-outline-secondary ms-3" onClick={() => { setUseMock(false); loadVouchers(); }}>
            Retry
          </button>
        </div>
      )}
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
