import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './RecentPages.css';

const RecentOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
  try {
    setLoading(true);
    const response = await ordersApi.getAll('user_001'); // Pass the specific user
    
    // We ensure we use the data from the API Response
    if (response.success) {
      setOrders(response.data); 
    }
  } catch (err) {
    console.error('Failed to load orders:', err);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="recent-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-page">
      <h2 className="page-title">Recent Orders</h2>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bag"></i>
          <p>No orders yet</p>
          <Link to="/checkout" className="btn btn-primary">Place an Order</Link>
        </div>
      ) : (
        <div className="items-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/order/${order.id}`} className="list-item">
              <div className="item-icon">
                <i className="bi bi-bag"></i>
              </div>
              <div className="item-info">
                <span className="item-title">Order #{order.id}</span>
                <span className="item-subtitle">{formatDate(order.createdAt)}</span>
              </div>
              <div className="item-right">
                <span className="item-amount">{formatCurrency(order.amount)}</span>
                <span className={`item-status ${order.status}`}>{order.status}</span>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersPage;
