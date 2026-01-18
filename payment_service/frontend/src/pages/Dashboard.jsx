import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import './Dashboard.css';
import { useCurrentUser } from '../context/currentUser';

const Dashboard = () => {
  const { userId, isAdmin } = useCurrentUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const features = [
    {
      title: 'Wallet',
      description: 'Manage your digital wallet, view balance, and transaction history',
      icon: 'bi-wallet2',
      link: '/wallet',
      color: '#4CAF50',
    },
    {
      title: 'Top Up',
      description: 'Add funds to your wallet using various payment methods',
      icon: 'bi-plus-circle',
      link: '/topup',
      color: '#2196F3',
    },
    {
      title: 'Checkout',
      description: 'Complete your orders with secure payment options',
      icon: 'bi-cart-check',
      link: '/checkout',
      color: '#FF9800',
    },
    {
      title: 'My Vouchers',
      description: 'View and redeem your available vouchers',
      icon: 'bi-ticket-perforated',
      link: '/vouchers',
      color: '#9C27B0',
    },
    {
      title: 'Request Refund',
      description: 'Submit a refund request for your orders',
      icon: 'bi-arrow-counterclockwise',
      link: '/refund',
      color: '#F44336',
    },
    {
      title: 'Admin Panel',
      description: 'Manage refund requests and customer inquiries',
      icon: 'bi-shield-lock',
      link: '/admin/refunds',
      color: '#607D8B',
    },
  ];

  const visibleFeatures = isAdmin ? features : features.filter(f => f.link !== '/admin/refunds');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
            const data = await dashboardApi.getStats(userId);
        setStats(data);
      } catch (e) {
        console.error('Failed to load dashboard stats:', e);
        setStats(null);
        setError(e?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const quickStats = useMemo(() => {
    const walletBalance = stats?.walletBalance ?? 0;
    const pendingOrders = stats?.pendingOrders ?? 0;
    const availableVouchers = stats?.availableVouchers ?? 0;
    const refundRequests = stats?.refundRequests ?? 0;

    return [
      { label: 'Wallet Balance', value: formatCurrency(walletBalance), icon: 'bi-wallet', color: '#4CAF50' },
      { label: 'Pending Orders', value: String(pendingOrders), icon: 'bi-bag', color: '#FF9800' },
      { label: 'Available Vouchers', value: String(availableVouchers), icon: 'bi-ticket', color: '#9C27B0' },
      { label: 'Refund Requests', value: String(refundRequests), icon: 'bi-clock-history', color: '#F44336' },
    ];
  }, [stats]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Kapebara Payment Service</h1>
        <p>Manage all your payment features in one place</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!error && stats && stats.orderServiceConfigured === false && (
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Order Service is not configured — pending orders count may not reflect the true upstream value.
        </div>
      )}

      {!error && stats && stats.orderServiceConfigured === true && stats.orderServiceHealthy === false && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Order Service is configured but unreachable — pending orders count is falling back to local DB.
          {stats.orderServiceError ? (
            <div className="mt-1 small">{stats.orderServiceError}</div>
          ) : null}
        </div>
      )}

      {/* Quick Stats */}
      <div className="stats-grid">
        {quickStats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <i className={`bi ${stat.icon}`}></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <h2 className="section-title">Quick Access</h2>
      <div className="features-grid">
        {visibleFeatures.map((feature, index) => (
          <Link key={index} to={feature.link} className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
              <i className={`bi ${feature.icon}`}></i>
            </div>
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <div className="feature-arrow">
              <i className="bi bi-chevron-right"></i>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <h2 className="section-title">Recent Activity</h2>
      <div className="activity-card">
        {loading ? (
          <div className="activity-item">
            <div className="activity-details">
              <span className="activity-title">Loading…</span>
            </div>
          </div>
        ) : (stats?.recentTransactions?.length ? (
          stats.recentTransactions.map((t) => {
            const rawType = String(t.type || '').toLowerCase();
            const desc = String(t.description || '').toLowerCase();
            const refId = String(t.referenceId || '');
            const effectiveType =
              rawType === 'topup' && (desc.includes('refund') || refId.startsWith('refund_'))
                ? 'refund'
                : rawType;

            return (
              <div key={t.id} className="activity-item">
                <div className={`activity-icon ${t.amount < 0 ? 'warning' : 'success'}`}>
                  <i className={`bi ${
                    effectiveType === 'order'
                      ? 'bi-receipt'
                      : effectiveType === 'refund'
                        ? 'bi-arrow-counterclockwise'
                        : effectiveType === 'coins'
                          ? 'bi-coin'
                          : 'bi-wallet2'
                  }`}></i>
                </div>
                <div className="activity-details">
                  <span className="activity-title">
                    {effectiveType === 'order'
                      ? 'Order'
                      : effectiveType === 'refund'
                        ? 'Refund'
                        : effectiveType === 'coins'
                          ? 'Coins'
                          : 'Top-up'}{' '}
                    {new Date(t.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="activity-desc">{t.description} ({formatCurrency(Math.abs(t.amount))})</span>
                </div>
                <span className="activity-time">{new Date(t.createdAt).toLocaleString()}</span>
              </div>
            );
          })
        ) : (
          <div className="activity-item">
            <div className="activity-details">
              <span className="activity-title">No recent activity</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
