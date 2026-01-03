
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import '../../Refund.css';
import { createRefund, uploadRefundPhoto } from './refundApi';



function RefundRequestModal({ show, onHide, onSubmitSuccess }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let photoInfo = null;
      if (file) {
        photoInfo = await uploadRefundPhoto(file);
        setUploadedPhoto(photoInfo);
      }
      await createRefund({ amount: 1, reason: reason + (details ? `: ${details}` : '') + (photoInfo ? ` [Photo: ${photoInfo.file}]` : '') });
      if (onSubmitSuccess) onSubmitSuccess();
      setReason('');
      setDetails('');
      setFile(null);
      setUploadedPhoto(null);
    } catch (err) {
      setError('Failed to submit refund request.');
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
              disabled={!reason || loading}
            >
              {loading ? <><Spinner animation="border" size="sm" /> Submitting...</> : 'Submit Report'}
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}

export default RefundRequestModal;