import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './DetailPage.css';

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
    if (response.success) {
      setOrder(response.data);
    }
  } catch (err) {
    console.error('Failed to load order details:', err);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="detail-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="detail-page">
        <div className="alert alert-warning">Order not found</div>
        <Link to="/recent-orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-card">
        <div className="detail-header">
          <h2>Order Details</h2>
          <span className={`status-badge ${order.status}`}>{order.status}</span>
        </div>

        <div className="detail-section">
          <div className="detail-row">
            <span>Order ID</span>
            <span>{order.id}</span>
          </div>
          <div className="detail-row">
            <span>Date</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="detail-row">
            <span>Branch</span>
            <span>{order.branch || '-'}</span>
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="detail-section">
            <h3>Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="item-row">
                <span>{item.quantity}x {item.name}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="detail-section total">
          <div className="detail-row">
            <span>Total</span>
            <span className="total-amount">{formatCurrency(order.amount)}</span>
          </div>
        </div>

        <Link to="/recent-orders" className="btn btn-outline-secondary w-100">
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail;
