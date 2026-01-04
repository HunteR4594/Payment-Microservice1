import React, { useState } from 'react';
import RefundRequestsTable from './RefundRequestsTable';
import ReviewRequestModal from './ReviewRequestModal';
import ContactCustomerModal from './ContactCustomerModal';
import { initialRefunds } from './data/mockRefunds';

const RefundAdminPage = () => {
    const [refundRequests, setRefundRequests] = useState(initialRefunds);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    const handleReviewClick = (request) => {
        setSelectedRequest(request);
        setShowReviewModal(true);
    };

    const handleContactClick = (request) => {
        setSelectedRequest(request);
        setShowContactModal(true);
    };

    const handleApproveRefund = (ticketNumber, comment) => {
        setRefundRequests(prev => prev.map(request =>
            request.ticketNumber === ticketNumber
                ? { ...request, status: 'approved', adminComment: comment }
                : request
        ));
        setShowReviewModal(false);
    };

    const handleRejectRefund = (ticketNumber, comment) => {
        setRefundRequests(prev => prev.map(request =>
            request.ticketNumber === ticketNumber
                ? { ...request, status: 'rejected', adminComment: comment }
                : request
        ));
        setShowReviewModal(false);
    };

    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
        setSelectedRequest(null);
    };

    const handleCloseContactModal = () => {
        setShowContactModal(false);
    };

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