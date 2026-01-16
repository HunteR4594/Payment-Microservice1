import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <NavLink to="/wallet" className="navbar-brand">
            <img src="/kapebara-logo-2.png" alt="Kapebara" className="navbar-logo" />
            <span className="brand-text">Kapebara</span>
          </NavLink>
        </div>
        {/* Hamburger for mobile */}
        <button className="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <i className={`bi ${mobileOpen ? 'bi-x' : 'bi-list'}`}></i>
        </button>
        <div className="navbar-center">
          <ul className="custom-nav-list">
            <li className="nav-item">
              <NavLink to="/wallet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Wallet</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/topup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Top Up</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/checkout" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Checkout</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/vouchers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Vouchers</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/refund" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Refund</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/refunds" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Admin</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="navbar-right">
          <button className="icon-btn">
            <i className="bi bi-bell"></i>
          </button>
          <button className="icon-btn user-btn">
            <i className="bi bi-person"></i>
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          <li><NavLink to="/wallet" onClick={() => setMobileOpen(false)}>Wallet</NavLink></li>
          <li><NavLink to="/topup" onClick={() => setMobileOpen(false)}>Top Up</NavLink></li>
          <li><NavLink to="/checkout" onClick={() => setMobileOpen(false)}>Checkout</NavLink></li>
          <li><NavLink to="/vouchers" onClick={() => setMobileOpen(false)}>Vouchers</NavLink></li>
          <li><NavLink to="/refund" onClick={() => setMobileOpen(false)}>Refund</NavLink></li>
          <li><NavLink to="/admin/refunds" onClick={() => setMobileOpen(false)}>Admin</NavLink></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
