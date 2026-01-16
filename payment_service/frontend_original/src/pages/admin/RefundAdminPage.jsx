import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RefundRequestsTable from '../../components/RefundRequestsTable';
import ReviewRequestModal from '../../components/ReviewRequestModal';
import ContactCustomerModal from '../../components/ContactCustomerModal';
import { getAllRefunds, reviewRefund } from '../../services/api';
import './RefundAdminPage.css';

const initialRefunds = [
  {
    id: '206MCU',
    ticketNumber: '206MCU',
    name: 'Tony Stark',
    issueType: 'Incorrect ordered item(s)',
    dateSubmitted: '2026-01-15',
    status: 'approved',
    description: 'Customer received wrong items in their order.',
    photo: 'https://via.placeholder.com/300x200',
    orderDetails: {
      items: [
        { id: 1, name: 'Vanibara Frappe', price: 25.00, quantity: 2 },
        { id: 2, name: 'Coffeebara Latte', price: 15.00, quantity: 1 }
      ],
      total: 65.00
    },
    customer: {
      name: 'Tony Stark',
      email: 'tony.stark@example.com',
      phoneNumber: '+1 (555) 123-4567'
    }
  },
  {
    id: '123ABC',
    ticketNumber: '123ABC',
    name: 'John Dole',
    issueType: 'Damaged Order',
    dateSubmitted: '2026-01-20',
    status: 'pending',
    description: 'Package arrived with visible damage to contents.',
    photo: 'https://via.placeholder.com/300x200',
    orderDetails: {
      items: [
        { id: 1, name: 'Classic Berrybara Latte', price: 89.99, quantity: 1 },
        { id: 2, name: 'Chickenbara Nori Bowl', price: 19.99, quantity: 3 }
      ],
      total: 149.96
    },
    customer: {
      name: 'John Dole',
      email: 'john.dole@example.com',
      phoneNumber: '+1 (555) 987-6543'
    }
  }
];

const RefundAdminPage = () => {
  const navigate = useNavigate();
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRefunds();
      setRefundRequests(data);
    } catch (err) {
      console.error('Failed to fetch from API, using mock data:', err);
      setError('Using mock data (backend not available)');
      setRefundRequests(initialRefunds);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const handleContactClick = (request) => {
    setSelectedRequest(request);
    setShowContactModal(true);
  };

  const handleApproveRefund = async (ticketNumber, comment) => {
    try {
      const request = refundRequests.find(r => r.ticketNumber === ticketNumber);
      if (request) {
        await reviewRefund(request.id, 'approve', comment, null);
        await fetchRefunds();
      }
    } catch (err) {
      console.error('Failed to approve via API, updating locally:', err);
      setRefundRequests(prev => prev.map(request =>
        request.ticketNumber === ticketNumber
          ? { ...request, status: 'approved', adminComment: comment }
          : request
      ));
    }
    setShowReviewModal(false);
  };

  const handleRejectRefund = async (ticketNumber, comment) => {
    try {
      const request = refundRequests.find(r => r.ticketNumber === ticketNumber);
      if (request) {
        await reviewRefund(request.id, 'reject', comment, comment);
        await fetchRefunds();
      }
    } catch (err) {
      console.error('Failed to reject via API, updating locally:', err);
      setRefundRequests(prev => prev.map(request =>
        request.ticketNumber === ticketNumber
          ? { ...request, status: 'rejected', adminComment: comment }
          : request
      ));
    }
    setShowReviewModal(false);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedRequest(null);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-wrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <header className="dashboard-header d-flex align-items-center mb-4">
        <button className="btn-back-header p-0 me-3" aria-label="Go back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="modal-title-large mb-0">Refund Requests</h1>
      </header>

      {error && (
        <div className="alert alert-warning mb-3">
          {error}
        </div>
      )}

      <main className="dashboard-content">
        <RefundRequestsTable
          refundRequests={refundRequests}
          onReviewClick={handleReviewClick}
        />
      </main>

      {selectedRequest && (
        <>
          <ReviewRequestModal
            show={showReviewModal}
            onHide={handleCloseReviewModal}
            request={selectedRequest}
            onApprove={handleApproveRefund}
            onReject={handleRejectRefund}
            onContact={() => handleContactClick(selectedRequest)}
          />

          <ContactCustomerModal
            show={showContactModal}
            onHide={handleCloseContactModal}
            request={selectedRequest}
          />
        </>
      )}
    </div>
  );
};

export default RefundAdminPage;
