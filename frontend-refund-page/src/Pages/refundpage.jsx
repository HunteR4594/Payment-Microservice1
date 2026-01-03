import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import RefundRequestModal from '../features/RefundFlow/RefundRequestModal';
import ReportSentModal from '../features/RefundFlow/ReportSentModal';

function RefundPage() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmitSuccess = () => {
    setShowRequestModal(false);
    setShowSuccessModal(true);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      <Button 
        variant="primary" 
        size="lg" 
        onClick={() => setShowRequestModal(true)}
        className="custom-brown-btn"
      >
        Request for Refund
      </Button>

      <RefundRequestModal 
        show={showRequestModal} 
        onHide={() => setShowRequestModal(false)}
        onSubmitSuccess={handleSubmitSuccess}
      />

      <ReportSentModal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)} 
      />
    </Container>
  );
}

export default RefundPage;