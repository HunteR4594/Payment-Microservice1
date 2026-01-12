import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
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

  const quickStats = [
    { label: 'Wallet Balance', value: '₱1,250.00', icon: 'bi-wallet', color: '#4CAF50' },
    { label: 'Pending Orders', value: '2', icon: 'bi-bag', color: '#FF9800' },
    { label: 'Available Vouchers', value: '5', icon: 'bi-ticket', color: '#9C27B0' },
    { label: 'Refund Requests', value: '1', icon: 'bi-clock-history', color: '#F44336' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Kapebara Payment Service</h1>
        <p>Manage all your payment features in one place</p>
      </div>

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
        {features.map((feature, index) => (
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
        <div className="activity-item">
          <div className="activity-icon success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="activity-details">
            <span className="activity-title">Top-up completed</span>
            <span className="activity-desc">₱500.00 via GCash</span>
          </div>
          <span className="activity-time">2 hours ago</span>
        </div>
        <div className="activity-item">
          <div className="activity-icon warning">
            <i className="bi bi-clock"></i>
          </div>
          <div className="activity-details">
            <span className="activity-title">Order pending</span>
            <span className="activity-desc">Order #ORD-12345</span>
          </div>
          <span className="activity-time">5 hours ago</span>
        </div>
        <div className="activity-item">
          <div className="activity-icon info">
            <i className="bi bi-ticket-perforated"></i>
          </div>
          <div className="activity-details">
            <span className="activity-title">Voucher redeemed</span>
            <span className="activity-desc">SAVE20 - 20% off</span>
          </div>
          <span className="activity-time">1 day ago</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
