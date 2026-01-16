import React, { useState } from 'react';
import { Offcanvas, Button, Form, Row, Col, Table } from 'react-bootstrap';

const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '₱0.00';
  }
  return `₱${price.toFixed(2)}`;
};

const ReviewRequestModal = ({ show, onHide, request, onApprove, onReject, onContact }) => {
  const [comment, setComment] = useState('');
  
  if (!request) return null;

  const handleApprove = () => onApprove(request.ticketNumber, comment);
  const handleReject = () => onReject(request.ticketNumber, comment);

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      className="glassmorphism-modal refund-request-modal" 
    >
      <Offcanvas.Header className="border-0 px-4 pt-4 align-items-start">
        <div className="flex-grow-1">
          <h2 className="modal-title-large mb-0">Review Request</h2>
          <div className="text-muted text-semibold-20">Ticket No. {request.ticketNumber}</div>
        </div>
        <button 
          type="button" 
          className="btn-close custom-close-btn" 
          onClick={onHide} 
          aria-label="Close"
        />
      </Offcanvas.Header>

      <Offcanvas.Body className="px-4 pb-5">
        <Row className="gx-5">
          <Col md={6} className="mb-4">
            <label className="text-muted small">Issue Type</label>
            <p className="text-semibold-20">{request.issueType}</p>
          </Col>
          <Col md={6} className="mb-4">
            <label className="text-muted small">Description</label>
            <p className="mb-0">{request.description}</p>
          </Col>
        </Row>

        <div className="mb-4">
          <label className="text-muted small mb-2">Photo</label>
          <div className="placeholder-image-box w-100">
            <img 
              src={request.photo || "https://via.placeholder.com/300x200"} 
              alt="Evidence" 
              className="img-fluid"
              style={{ maxHeight: '200px', width: 'auto' }} 
            />
          </div>
        </div>

        <div className="order-details-section mb-5">
          <label className="text-muted small mb-2">Order Details</label>
          <Table borderless className="mb-0 w-100">
            <tbody>
              {request.orderDetails?.items?.map(item => (
                <tr key={item.id}>
                  <td className="ps-0" style={{ width: '10%' }}>{item.quantity}x</td>
                  <td style={{ width: '60%' }}>{item.name}</td>
                  <td className="text-end pe-0" style={{ width: '30%' }}>{formatPrice(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <hr className="my-2" />
          <div className="d-flex justify-content-between text-semibold-20">
            <span>TOTAL</span>
            <span>{formatPrice(request.orderDetails?.total)}</span>
          </div>
        </div>

        <Form.Group className="mb-4">
          <label className="text-muted small mb-3">Decision</label>
          <div className="d-flex gap-3">
            <Button 
              variant="success" 
              className="flex-grow-1 py-3 fw-bold border-0 shadow-sm" 
              style={{ backgroundColor: '#28a745', borderRadius: '12px' }}
              onClick={handleApprove}
            >
              Approve Refund
            </Button>
            <Button 
              variant="danger" 
              className="flex-grow-1 py-3 fw-bold border-0 shadow-sm" 
              style={{ backgroundColor: '#dc3545', borderRadius: '12px' }}
              onClick={handleReject}
            >
              Reject Refund
            </Button>
            <Button 
              className="custom-brown-btn border-0 shadow-sm" 
              style={{ borderRadius: '12px', minWidth: '150px' }}
              onClick={onContact}
            >
              Contact Customer
            </Button>
          </div>
          <Form.Control 
            as="textarea" 
            rows={4} 
            placeholder="Add comment..." 
            className="mt-4 glassmorphism-textarea p-3" 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Form.Group>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ReviewRequestModal;
