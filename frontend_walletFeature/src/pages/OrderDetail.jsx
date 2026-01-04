import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { ChevronLeft, Receipt } from 'react-bootstrap-icons';
import '../styles/RecentOrdersPage.css';
import { ordersApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getById(orderId);
      setOrder(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="web-view d-flex justify-content-center align-items-center">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="web-view">
        <nav className="header-nav">
          <Container fluid className="px-5 d-flex align-items-center h-100">
            <ChevronLeft 
              size={24} 
              className="cursor-pointer back-icon me-4" 
              onClick={() => navigate(-1)}
              style={{ cursor: 'pointer' }}
            />
            <div className="brand-container">
              <span className="brand-name">Kapebara</span>
            </div>
          </Container>
        </nav>
        <div className="content-centered">
          <div className="alert alert-danger">
            {error || 'Order not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="web-view">
      <nav className="header-nav">
        <Container fluid className="px-5 d-flex align-items-center h-100">
          <ChevronLeft 
            size={24} 
            className="cursor-pointer back-icon me-4" 
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer' }}
          />
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
                        <h1 className="order-amount">- {formatCurrency(order.amount)}</h1>
                      </div>
                      
                      <div className="order-meta border-top pt-4">
                        <span className="me-3">{formatDateTime(order.createdAt)}</span>
                        <span>{order.branch}</span>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="order-items mt-4 border-top pt-4">
                          <p className="fw-bold mb-2">Items:</p>
                          {order.items.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between mb-1">
                              <span>{item.quantity}x {item.name}</span>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          {order.discountAmount > 0 && (
                            <div className="d-flex justify-content-between text-success mt-2">
                              <span>Discount ({order.voucherCode})</span>
                              <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                          )}
                        </div>
                      )}
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

export default OrderDetail;
