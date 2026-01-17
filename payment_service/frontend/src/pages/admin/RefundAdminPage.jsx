import React, { useState, useEffect } from 'react';
import { adminRefundApi } from '../../services/api';
import './RefundAdminPage.css';

const RefundAdminPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminRefundApi.getAll();
      setRefunds(data || []);
    } catch (err) {
      console.error('Failed to load refunds:', err);
      setRefunds([]);
      setError(err?.message || 'Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (refund) => {
    setSelectedRefund(refund);
    setAdminComment('');
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await adminRefundApi.review(selectedRefund.id, 'approve', adminComment, null);
      await loadRefunds();
      setShowReviewModal(false);
    } catch (err) {
      console.error('Failed to approve:', err);
      setError(err?.message || 'Failed to approve refund');
    }
    setProcessing(false);
  };

  const handleApproveAndCreditWallet = async () => {
    setProcessing(true);
    try {
      const result = await adminRefundApi.approveAndCreditWallet(selectedRefund.id, adminComment);
      alert(result.message || `Refund approved! ₱${selectedRefund.amount} credited to user's wallet.`);
      await loadRefunds();
      setShowReviewModal(false);
    } catch (err) {
      console.error('Failed to approve and credit:', err);
      alert('Failed to process refund: ' + err.message);
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await adminRefundApi.review(selectedRefund.id, 'reject', adminComment, adminComment);
      await loadRefunds();
      setShowReviewModal(false);
    } catch (err) {
      console.error('Failed to reject:', err);
      setError(err?.message || 'Failed to reject refund');
    }
    setProcessing(false);
  };

  const handleProcessToWallet = async (refundId) => {
    setProcessing(true);
    try {
      const result = await adminRefundApi.processToWallet(refundId);
      alert(result.message || 'Refund credited to wallet!');
      await loadRefunds();
    } catch (err) {
      console.error('Failed to process to wallet:', err);
      alert('Failed to credit wallet: ' + err.message);
    }
    setProcessing(false);
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';
    const classes = {
      pending: 'badge-warning',
      underreview: 'badge-info',
      approved: 'badge-success',
      rejected: 'badge-danger',
      completed: 'badge-primary',
    };
    return `status-badge ${classes[normalizedStatus] || 'badge-secondary'}`;
  };

  const canReview = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';
    return ['pending', 'underreview'].includes(normalizedStatus);
  };

  const canProcessToWallet = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';
    return normalizedStatus === 'approved';
  };

  if (loading) {
    return (
      <div className="admin-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadRefunds}>
            Retry
          </button>
        </div>
      )}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Refund Management</h2>
        <div className="stats">
          <span className="stat">
            <strong>{refunds.filter(r => r.status === 'pending').length}</strong> Pending
          </span>
          <span className="stat">
            <strong>{refunds.filter(r => r.status === 'approved').length}</strong> Approved
          </span>
          <span className="stat">
            <strong>{refunds.filter(r => r.status === 'rejected').length}</strong> Rejected
          </span>
        </div>
      </div>

      <div className="table-container">
        <table className="refunds-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={refund.id}>
                <td>{refund.ticketNumber}</td>
                <td>{refund.orderId}</td>
                <td>{refund.customerName}</td>
                <td>{refund.reason}</td>
                <td>₱{refund.amount}</td>
                <td>
                  <span className={getStatusBadge(refund.status)}>
                    {refund.status}
                  </span>
                </td>
                <td>{new Date(refund.createdAt).toLocaleDateString()}</td>
                <td>
                  {refund.status?.toLowerCase() === 'completed' ? (
                    <span className="completed-text">✓ Completed</span>
                  ) : (
                    <button className="review-btn" onClick={() => handleReview(refund)}>
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRefund && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Refund Request</h3>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Ticket #</label>
                  <span>{selectedRefund.ticketNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Order ID</label>
                  <span>{selectedRefund.orderId}</span>
                </div>
                <div className="detail-item">
                  <label>Customer</label>
                  <span>{selectedRefund.customerName}</span>
                </div>
                <div className="detail-item">
                  <label>Amount</label>
                  <span>₱{selectedRefund.amount}</span>
                </div>
              </div>

              <div className="detail-full">
                <label>Reason</label>
                <p>{selectedRefund.reason}</p>
              </div>

              <div className="form-group">
                <label>Admin Comment</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Add a comment (optional)"
                  rows={3}
                />
              </div>

              <div className="action-buttons">
                <button 
                  className="btn-approve" 
                  onClick={handleApprove}
                  disabled={processing}
                >
                  <i className="bi bi-check-circle"></i>
                  Approve
                </button>
                <button 
                  className="btn-approve-credit" 
                  onClick={handleApproveAndCreditWallet}
                  disabled={processing}
                  title="Approve and immediately credit the refund amount to user's wallet"
                >
                  <i className="bi bi-wallet2"></i>
                  Approve & Credit Wallet
                </button>
                <button 
                  className="btn-reject" 
                  onClick={handleReject}
                  disabled={processing}
                >
                  <i className="bi bi-x-circle"></i>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundAdminPage;
