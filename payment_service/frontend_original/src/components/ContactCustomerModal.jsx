import React from 'react';
import { Modal } from 'react-bootstrap';

const ContactCustomerModal = ({ show, onHide, request }) => {
  if (!request) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="sm"
      className="glassmorphism-modal report-sent-modal"
    >
      <Modal.Header className="border-0">
        <Modal.Title className="text-semibold-20 w-100">
          <div className="d-flex justify-content-between align-items-center">
            <span>Contact Customer</span>
            <button 
              type="button"
              className="btn-close custom-close-btn" 
              onClick={onHide}
              aria-label="Close"
            />
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pb-4">
        <div className="text-center mb-4">
          <h3 className="modal-title-large mb-3">Ticket No. {request.ticketNumber}</h3>
          <p className="text-muted">Contact information for customer</p>
        </div>

        <div className="glassmorphism-card p-4 mb-4">
          <div className="mb-3 text-start">
            <h5 className="text-semibold-20 mb-1">Customer Name</h5>
            <p className="fs-5 mb-0 text-dark">{request.customer?.name}</p>
          </div>

          <div className="mb-3 text-start">
            <h5 className="text-semibold-20 mb-1">Email</h5>
            <a 
              href={`mailto:${request.customer?.email}`}
              className="fs-5 mb-0 text-dark text-decoration-none"
              style={{ color: '#3B302A' }}
            >
              {request.customer?.email}
            </a>
          </div>

          <div className="mb-0 text-start">
            <h5 className="text-semibold-20 mb-1">Phone Number</h5>
            <a 
              href={`tel:${request.customer?.phoneNumber?.replace(/\s/g, '')}`}
              className="fs-5 mb-0 text-dark text-decoration-none"
              style={{ color: '#3B302A' }}
            >
              {request.customer?.phoneNumber}
            </a>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ContactCustomerModal;
