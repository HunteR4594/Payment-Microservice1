import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await ordersApi.getById(orderId);
      setOrder(response.data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link to="/recent-orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#2d3436', textDecoration: 'none', marginBottom: '1rem' }}>
          <i className="bi bi-chevron-left"></i> Back
        </Link>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '1.5rem' }}>
            Order Details
          </h2>
          
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem' }}>
            <p className="mb-2"><strong>Order ID:</strong> {order?.id}</p>
            <p className="mb-2"><strong>Amount:</strong> {formatCurrency(order?.amount || 0)}</p>
            <p className="mb-2"><strong>Status:</strong> <span className={`badge bg-${order?.status === 'completed' ? 'success' : 'warning'}`}>{order?.status}</span></p>
            <p className="mb-0"><strong>Date:</strong> {formatDateTime(order?.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
