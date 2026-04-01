import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { ChevronLeft, Receipt } from 'react-bootstrap-icons';
import '../styles/RecentOrdersPage.css';
import { ordersApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const RecentOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      setOrders(response.data);
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
          <h2 className="mb-4" style={{ fontFamily: 'DM Sans', fontWeight: 700 }}>Recent Orders</h2>
          
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {orders.length === 0 ? (
            <div className="text-center text-muted py-5">
              <Receipt size={48} className="mb-3" />
              <p>No orders yet</p>
            </div>
          ) : (
            <Row className="g-3">
              {orders.map((order) => (
                <Col xs={12} key={order.id}>
                  <Link to={`/order/${order.id}`} className="text-decoration-none">
                    <Card className="minimal-order-box border-0 shadow-sm">
                      <Card.Body className="p-0 h-100 d-flex align-items-center">
                        <div className="d-flex align-items-start px-5 py-4 w-100">
                          
                          <div className="icon-section me-3">
                            <Receipt size={32} />
                          </div>
                          
                          <div className="details-section flex-grow-1">
                            <div className="mb-2">
                              <p className="order-label mb-1">Order</p>
                              <h3 className="order-amount" style={{ fontSize: '1.5rem' }}>
                                - {formatCurrency(order.amount)}
                              </h3>
                            </div>
                            
                            <div className="order-meta">
                              <span className="me-3">{formatDateTime(order.createdAt)}</span>
                              <span>{order.branch}</span>
                            </div>
                          </div>

                          <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                        </div>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </main>
    </div>
  );
};

export default RecentOrdersPage;
