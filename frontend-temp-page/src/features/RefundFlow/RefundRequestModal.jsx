
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import '../../Refund.css';
import { createRefund, uploadRefundPhotoForRefund } from './refundApi';



function RefundRequestModal({ show, onHide, onSubmitSuccess, paymentId: initialPaymentId, amount: initialAmount }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [paymentId, setPaymentId] = useState(initialPaymentId || '');
  const [amount, setAmount] = useState(initialAmount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Valid amount is required');
      }

      const refundData = {
        paymentId: paymentId.trim(),
        amount: parseFloat(amount),
        reason: reason,
        notes: details || undefined
      };

      // Create pending refund request for admin approval
      const refund = await createRefund(refundData);

      // Upload photo if provided
      if (file && refund.id) {
        const photoInfo = await uploadRefundPhotoForRefund(refund.id, file);
        setUploadedPhoto(photoInfo);
      }

      if (onSubmitSuccess) onSubmitSuccess(refund);
      
      // Reset form
      setReason('');
      setDetails('');
      setPaymentId(initialPaymentId || '');
      setAmount(initialAmount || '');
      setFile(null);
      setUploadedPhoto(null);
    } catch (err) {
      setError(err.message || 'Failed to submit refund request.');
    } finally {
      setLoading(false);
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
            <h4 className="modal-title-large">Request a Refund</h4>
          </div>

          {/* Payment ID and Amount Fields */}
          <div className="row mb-4">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Payment ID <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., pay_xxxxxxxxxx"
                  value={paymentId}
                  onChange={e => setPaymentId(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Enter the PayMongo payment ID from your order
                </Form.Text>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Refund Amount (PHP) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="e.g., 100.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <h5 className="mb-3">What happened to your order?</h5>
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
              {file ? (
                <span>{file.name}</span>
              ) : (
                <img src="/placeholder.png" alt="Placeholder" style={{ width: '40px', opacity: 0.5 }} />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="refund-photo-input"
              onChange={e => setFile(e.target.files[0])}
            />
            <div className="text-center mt-0 mb-4">
              <label htmlFor="refund-photo-input">
                <Button as="span" variant="dark" className="upload-photo-btn custom-brown-btn">
                  {file ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </label>
            </div>
          </div>


          <Form.Group className="mb-4">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Please provide details on your reason for the refund."
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}
          <div className="d-grid mb-5">
            <Button
              type="submit"
              variant="dark"
              className="fw-bold py-3 custom-brown-btn"
              disabled={!reason || !paymentId || !amount || loading}
            >
              {loading ? <><Spinner animation="border" size="sm" /> Submitting...</> : 'Submit Request'}
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}

export default RefundRequestModal;