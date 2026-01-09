import React, { useState, useEffect } from 'react';
import RefundRequestsTable from './RefundRequestsTable';
import ReviewRequestModal from './ReviewRequestModal';
import ContactCustomerModal from './ContactCustomerModal';
import { getAllRefunds, reviewRefund, contactCustomer } from './services/refundApi';
import { initialRefunds } from './data/mockRefunds';

const RefundAdminPage = () => {
    const [refundRequests, setRefundRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // Fetch refunds from backend on mount
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
            // Find the request to get its ID
            const request = refundRequests.find(r => r.ticketNumber === ticketNumber);
            if (request) {
                await reviewRefund(request.id, 'approve', comment, null);
                // Refresh the list
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
            // Find the request to get its ID
            const request = refundRequests.find(r => r.ticketNumber === ticketNumber);
            if (request) {
                await reviewRefund(request.id, 'reject', comment, comment);
                // Refresh the list
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
                <button className="btn-back-header p-0 me-3" aria-label="Go back">
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