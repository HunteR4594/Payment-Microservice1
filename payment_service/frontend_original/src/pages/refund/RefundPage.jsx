import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import RefundRequestModal from '../../components/RefundRequestModal';
import ReportSentModal from '../../components/ReportSentModal';
import './RefundPage.css';

function RefundPage() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmitSuccess = () => {
    setShowRequestModal(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="refund-page">
      <Container className="d-flex align-items-center justify-content-center refund-container">
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
    </div>
  );
}

export default RefundPage;
