import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

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

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">☕</span>
            {sidebarOpen && <span className="logo-text">Kapebara</span>}
          </div>
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <div key={index} className="nav-group">
              <NavLink
                to={item.path}
                className={({ isActive: active }) => 
                  `nav-item ${active || isActive(item.path) ? 'active' : ''}`
                }
                end={item.path === '/'}
              >
                <i className={`bi ${item.icon}`}></i>
                {sidebarOpen && <span>{item.title}</span>}
              </NavLink>
              
              {item.subItems && sidebarOpen && (
                <div className="sub-nav">
                  {item.subItems.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.path}
                      className={({ isActive }) => 
                        `sub-nav-item ${isActive ? 'active' : ''}`
                      }
                    >
                      <i className={`bi ${subItem.icon}`}></i>
                      <span>{subItem.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="user-details">
                <span className="user-name">User</span>
                <span className="user-role">Customer</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div className="breadcrumb-container">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <NavLink to="/">Home</NavLink>
                </li>
                {location.pathname !== '/' && (
                  <li className="breadcrumb-item active">
                    {location.pathname.split('/').filter(Boolean).map((part, i, arr) => 
                      i === arr.length - 1 ? part.charAt(0).toUpperCase() + part.slice(1) : null
                    )}
                  </li>
                )}
              </ol>
            </nav>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-bell"></i>
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-gear"></i>
            </button>
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
