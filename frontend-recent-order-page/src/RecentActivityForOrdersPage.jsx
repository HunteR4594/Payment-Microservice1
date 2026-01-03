import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { ChevronLeft, Receipt } from 'react-bootstrap-icons';
import './RecentActivityForOrdersPage.css';

const RecentActivityForOrdersPage = () => {
  return (
    <div className="web-view">
      <nav className="header-nav">
        <Container fluid className="px-5 d-flex align-items-center h-100">
          <ChevronLeft size={24} className="cursor-pointer back-icon me-4" />
          <div className="brand-container">
            <span className="brand-name">
              Kapebara
              <i className="fa-solid fa-leaf leaf-icon"></i>
            </span>
          </div>
        </Container>
      </nav>

      <main className="content-centered">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12}>
              <Card className="minimal-order-box border-0 shadow-sm mx-auto">
                <Card.Body className="p-0 h-100 d-flex align-items-center">
                  <div className="d-flex align-items-start px-5 w-100">
                    
                    <div className="icon-section me-3">
                      <Receipt size={32} />
                    </div>
                    
                    <div className="details-section flex-grow-1">
                      <div className="mb-4">
                        <p className="order-label mb-1">Order</p>
                        <h1 className="order-amount">- ₱ 150.00</h1>
                      </div>
                      
                      <div className="order-meta border-top pt-4">
                        <span className="me-3">Dec 27, 2025 • 06:05 PM</span>
                        <span>Quezon City Branch</span>
                      </div>
                    </div>

                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default RecentActivityForOrdersPage;