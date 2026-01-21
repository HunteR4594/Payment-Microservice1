import React, { useEffect, useMemo, useState } from 'react';
import { ordersApi, refundApi } from '../../services/api';
import './RefundPage.css';
import { useCurrentUser } from '../../context/currentUser';
import { formatCurrency } from '../../utils/formatters';

const RefundPage = () => {
  const { userId } = useCurrentUser();
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    category: '',
    reason: '',
  });

  const selectedOrder = useMemo(() => {
    return eligibleOrders.find((o) => o.id === selectedOrderId) || null;
  }, [eligibleOrders, selectedOrderId]);

  useEffect(() => {
    if (!showModal) return;

    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        const [ordersRes, refundsRes] = await Promise.all([
          ordersApi.getAll(userId),
          refundApi.getAll(userId),
        ]);

        const orders = Array.isArray(ordersRes?.data)
          ? ordersRes.data
          : Array.isArray(ordersRes)
            ? ordersRes
            : [];

        const refunds = Array.isArray(refundsRes)
          ? refundsRes
          : Array.isArray(refundsRes?.data)
            ? refundsRes.data
            : [];

        const refundedOrderIds = new Set(
          refunds
            .filter((r) => {
              const st = String(r?.status || '').toLowerCase();
              // Allow re-request only if the previous refund was rejected.
              return st && st !== 'rejected';
            })
            .map((r) => r?.orderId)
            .filter(Boolean)
        );

        const paid = orders.filter((o) => {
          const st = String(o?.status || '').toLowerCase();
          return st === 'completed' || st === 'paid';
        });

        const eligible = paid.filter((o) => !refundedOrderIds.has(o.id));

        setEligibleOrders(eligible);
        if (eligible.length) {
          setSelectedOrderId(eligible[0].id);
        } else {
          setSelectedOrderId('');
        }
      } catch (e) {
        console.error('Failed to load eligible refund orders:', e);
        setEligibleOrders([]);
        setSelectedOrderId('');
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [showModal, userId]);

  const reasons = [
    'Wrong Order',
    'Quality Issue',
    'Missing Items',
    'Late Delivery',
    'Other',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrder) {
      setError('No paid order selected for refund');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('userId', userId);
      fd.append('orderId', selectedOrder.id);
      fd.append('customerName', formData.customerName);
      fd.append('customerEmail', formData.customerEmail);
      fd.append('customerPhone', formData.customerPhone);
      fd.append('amount', String(selectedOrder.finalAmount || selectedOrder.amount || 0));
      fd.append('category', formData.category);
      fd.append('reason', formData.reason);
      if (photoFile) {
        fd.append('photo', photoFile);
      }

      await refundApi.createWithPhoto(fd);
      setShowModal(false);
      setShowSuccess(true);
      setPhotoFile(null);
      setEligibleOrders([]);
      setSelectedOrderId('');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
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
                  <label>Order</label>

                  {ordersLoading ? (
                    <div className="text-muted">Loading paid orders…</div>
                  ) : eligibleOrders.length === 0 ? (
                    <div className="alert alert-secondary mb-0">
                      No orders are valid for refund.
                    </div>
                  ) : (
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      required
                    >
                      {eligibleOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.id}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedOrder ? (
                  <div className="order-preview">
                    <div className="order-preview-title">Order details</div>
                    <div className="order-preview-meta">
                      <span><strong>Status:</strong> {selectedOrder.status}</span>
                      <span><strong>Amount Paid:</strong> {formatCurrency(Number(selectedOrder.finalAmount || selectedOrder.amount || 0))}</span>
                      {selectedOrder.voucherDiscount > 0 && (
                        <span className="text-success ms-2">(Voucher: -{formatCurrency(selectedOrder.voucherDiscount)})</span>
                      )}
                    </div>
                    <div className="order-preview-items">
                      {(selectedOrder.items || []).map((it, idx) => (
                        <div key={idx} className="order-preview-item">
                          <span>{it.quantity}x {it.name}</span>
                          <span>{formatCurrency((it.price || 0) * (it.quantity || 0))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="form-group">
                  <label>Upload product image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
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

                <button type="submit" className="submit-btn" disabled={loading || !selectedOrder}>
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
