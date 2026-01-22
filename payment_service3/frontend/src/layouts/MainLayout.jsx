import React, { useState } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import './MainLayout.css';
import { useCurrentUser } from '../context/currentUser';

const MainLayout = () => {
  const location = useLocation();
  const { userId, role, isAdmin, setUser } = useCurrentUser();

  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdmin && !isAdminRoute) {
    return <Navigate to="/admin/refunds" replace />;
  }

  const navItems = [
    {
      title: 'Dashboard',
      icon: 'bi-speedometer2',
      path: '/',
    },
    {
      title: 'Wallet',
      icon: 'bi-wallet2',
      path: '/wallet',
      subItems: [
        { title: 'My Wallet', path: '/wallet', icon: 'bi-credit-card' },
        { title: 'Top Up', path: '/topup', icon: 'bi-plus-circle' },
        { title: 'Recent Orders', path: '/recent-orders', icon: 'bi-bag' },
        { title: 'Recent Top-ups', path: '/recent-topup', icon: 'bi-clock-history' },
      ]
    },
    {
      title: 'Checkout',
      icon: 'bi-cart-check',
      path: '/checkout',
      subItems: [
        { title: 'Checkout', path: '/checkout', icon: 'bi-cart' },
        { title: 'My Vouchers', path: '/vouchers', icon: 'bi-ticket-perforated' },
      ]
    },
    {
      title: 'Vouchers',
      icon: 'bi-ticket-perforated',
      path: '/vouchers',
    },
    {
      title: 'Refund',
      icon: 'bi-arrow-counterclockwise',
      path: '/refund',
    },
    {
      title: 'Admin',
      icon: 'bi-shield-lock',
      path: '/admin/refunds',
      subItems: [
        { title: 'Manage Refunds', path: '/admin/refunds', icon: 'bi-list-check' },
      ]
    },
  ];

  const visibleNavItems = isAdmin
    ? navItems.filter((i) => i.title === 'Admin')
    : navItems.filter((i) => i.title !== 'Admin');

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbText = () => {
    if (location.pathname === '/' || location.pathname === '') return 'Home';
    const parts = location.pathname.split('/').filter(Boolean);
    return ['Home', ...parts.map(p => p.charAt(0).toUpperCase() + p.slice(1))].join(' / ');
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="main-layout">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="nav-left">
          <div className="brand">
            <NavLink to={isAdmin ? '/admin/refunds' : '/'} className="brand-link">
              <img src="/kapebara-logo-2.png" alt="Kapebara" className="brand-logo" />
              {/*<span className="brand-text">Kapebara</span>*/}
            </NavLink>
          </div>
          <div className="breadcrumb-inline">{getBreadcrumbText()}</div>
        </div>

        <nav className="nav-center">
          <ul className="nav-list">
            {visibleNavItems.map((item, idx) => (
              <li key={idx} className={`nav-list-item ${isActive(item.path) ? 'active' : ''}`}>
                <NavLink to={item.path} className="nav-link">
                  <i className={`bi ${item.icon}`}></i>
                  <span className="nav-text">{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-right">
          <div className="user-info-navbar">
            <div className="avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-name">{userId} ({role})</div>
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              type="button"
              onClick={() => {
                if (isAdmin) {
                  setUser({ userId: 'user_001', role: 'user' });
                } else {
                  setUser({ userId: 'user_001', role: 'admin' });
                }
              }}
              title={isAdmin ? 'Switch to user mode' : 'Switch to admin mode'}
            >
              {isAdmin ? 'User mode' : 'Admin mode'}
            </button>
          </div>
          <button className="icon-btn notif-btn" aria-label="Notifications">
            <i className="bi bi-bell"></i>
          </button>
          <button className="icon-btn settings-btn" aria-label="Settings">
            <i className="bi bi-gear"></i>
          </button>
          <button
            className="hamburger-btn"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu" onClick={() => {}}>
            <div className="mobile-menu-controls">
              <div className="mobile-user" onClick={() => setMenuOpen(false)}>
                <i className="bi bi-person-circle"></i>
                <span>User</span>
              </div>
              <button className="mobile-icon-btn" aria-label="Notifications" onClick={() => setMenuOpen(false)}>
                <i className="bi bi-bell"></i>
                <span>Notifications</span>
              </button>
              <button className="mobile-icon-btn" aria-label="Settings" onClick={() => setMenuOpen(false)}>
                <i className="bi bi-gear"></i>
                <span>Settings</span>
              </button>
            </div>
            <ul>
              {visibleNavItems.map((item, idx) => (
                <li key={idx} className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}>
                  <NavLink to={item.path} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                    <i className={`bi ${item.icon}`}></i>
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="main-content top-nav-layout">
        <header className="content-header">
          <div className="header-actions">
            {/* page specific controls could go here */}
          </div>
        </header>

        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
