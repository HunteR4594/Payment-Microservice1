import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CheckCircleFill } from 'react-bootstrap-icons';
import '../../Refund.css';

function ReportSentModal({ show, onHide }) {
  const ticketNumber = "R-20251210";
  const reviewTime = "48 hours/days";

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="glassmorphism-modal report-sent-modal" backdrop={false}>
      <Modal.Header className="border-0 pb-0 pt-4 px-5">
        <button type="button" className="btn-close custom-close-btn" onClick={onHide}></button>
      </Modal.Header>

      <Modal.Body className="px-5 pt-0 text-center">
        <div className="d-flex flex-column align-items-center mb-3 mt-4">
          <CheckCircleFill size={50} color="#28a745" />
          <h4 className="modal-title-large mt-3">Report Sent</h4>
          <p className="text-muted mb-0 small">Ticket No. [{ticketNumber}]</p>
        </div>

        <p className="text-secondary mb-4 px-2 text-semibold-20">
          Thank you. Your refund request has been escalated to the appropriate team for review.
          We are reviewing your request and will get back to you within [{reviewTime}].
          You will get an automatic notification or email confirming that your issue has been logged.
        </p>

        <div className="d-grid mb-3">
          <Button
            variant="dark"
            onClick={onHide}
            className="fw-bold py-3 custom-brown-btn"
          >
            Done
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ReportSentModal;