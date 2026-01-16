import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const RecentOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersApi.getAll();
      setOrders(response.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: '1.5rem' }}>
          Recent Orders
        </h2>
        
        {orders.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
            <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
            <p style={{ color: '#636e72', marginTop: '1rem' }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            {orders.map((order) => (
              <Link 
                key={order.id}
                to={`/order/${order.id}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit' }}
              >
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>Order {formatDate(order.createdAt)}</p>
                  <p style={{ fontSize: '14px', color: '#636e72', marginBottom: 0 }}>{order.branch}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>{formatCurrency(order.amount)}</p>
                  <span className={`badge bg-${order.status === 'completed' ? 'success' : 'warning'}`}>{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrdersPage;
