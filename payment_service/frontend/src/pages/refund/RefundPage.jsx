import React, { useState } from 'react';
import { refundApi } from '../../services/api';
import './RefundPage.css';

const RefundPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    userId: 'user_001',
    orderId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    amount: '',
    category: '',
    reason: '',
  });

  const reasons = [
    'Wrong Order',
    'Quality Issue',
    'Missing Items',
    'Late Delivery',
    'Other',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await refundApi.create(formData);
      setShowModal(false);
      setShowSuccess(true);
      setFormData({
        userId: 'user_001',
        orderId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        amount: '',
        category: '',
        reason: '',
      });
    } catch (err) {
      console.error('Refund request failed:', err);
      setError(err?.message || 'Refund request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="refund-page">
      <div className="refund-container">
        <h2 className="page-title">Request Refund</h2>
        <p className="page-subtitle">Having an issue with your order? Submit a refund request and we'll help you out.</p>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <button className="request-btn" onClick={() => setShowModal(true)}>
          <i className="bi bi-arrow-counterclockwise"></i>
          Request for Refund
        </button>

        {/* Refund Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Refund Request</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Order ID</label>
                  <input
                    type="text"
                    placeholder="Enter your order ID"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Refund Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    placeholder="Enter your phone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reason for Refund</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select a reason</option>
                    {reasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Details</label>
                  <textarea
                    placeholder="Please provide more details about your issue"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="modal-overlay" onClick={() => setShowSuccess(false)}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
              <div className="success-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h3>Request Submitted!</h3>
              <p>Your refund request has been submitted successfully. We'll review it and get back to you within 24-48 hours.</p>
              <button className="ok-btn" onClick={() => setShowSuccess(false)}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundPage;
