import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../../Refund.css';

function RefundRequestModal({ show, onHide, onSubmitSuccess }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const refundReasons = [
    {
      label: 'Damaged Order',
      detail: 'The ordered item/s packaging is damaged that affect the item.'
    },
    {
      label: 'Incorrect ordered item/s',
      detail: 'Wrong product, flavor, etc.'
    },
    {
      label: 'Did not receive some/All of the items',
      detail: 'Wrong product, flavor, etc.'
    }
  ];

  return (
    <Modal show={show} onHide={onHide} centered className="glassmorphism-modal refund-request-modal" backdrop={false} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header className="border-0 pb-0 pt-4 px-5">
          <button type="button" className="btn-close custom-close-btn" onClick={onHide}></button>
        </Modal.Header>

        <Modal.Body className="px-5 pt-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <h4 className="modal-title-large">What happened to your order?</h4>
          </div>

          <div className="d-grid gap-2 mb-4">
            {refundReasons.map((item, index) => (
              <div
                key={index}
                className="p-3 radio-option-card no-border-option"
                onClick={() => setReason(item.label)}
                style={{ cursor: 'pointer' }}
              >
                <Form.Check
                  type="radio"
                  id={`radio-${index}`}
                  label={item.label}
                  name="refundReason"
                  checked={reason === item.label}
                  onChange={() => setReason(item.label)}
                  className="text-semibold-20 refund-radio-input"
                />
                <small className="text-muted">{item.detail}</small>
              </div>
            ))}
          </div>

          <div className="text-center my-4 p-5 bg-light upload-section-container">
            <div className="placeholder-image-box">
              <img src="/placeholder.png" alt="Placeholder" style={{ width: '40px', opacity: 0.5 }} />
            </div>
          </div>

          <div className="text-center mt-0 mb-4">
            <Button variant="dark" className="upload-photo-btn custom-brown-btn">Upload Photo</Button>
          </div>

          <Form.Group className="mb-4">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Please provide details on your reason for the refund."
            />
          </Form.Group>

          <div className="d-grid mb-5">
            <Button
              type="submit"
              variant="dark"
              className="fw-bold py-3 custom-brown-btn"
              disabled={!reason}
            >
              Submit Report
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}

export default RefundRequestModal;