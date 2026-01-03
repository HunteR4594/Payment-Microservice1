import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./style.css";

const WalletPage = () => {
  return (
    <div className="wallet-page-wrapper">
      {/* FULL-WIDTH PAGE HEADER */}
      <div className="page-header">
        <button className="back-arrow">
          <i className="bi bi-chevron-left"></i>
        </button>
        <img src="/kapebara-logo-2.png" alt="Kapebara" className="header-logo" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="container-xl">
        <div className="row g-4">
          {/* LEFT COLUMN */}
          <div className="col-12 col-lg-4">
            {/* Wallet Card */}
            <div className="balance-card shadow-sm">
              <div className="balance-header">
                <span className="logo-text">
                  <img src="/kapebara-logo-2.png" alt="Kapebara" className="label-logo" /> Wallet</span>
              </div>
              <div className="balance-label">Available Balance</div>
              <div className="balance-amount">₱ [BALANCE].00</div>
              <div className="wallet-coins">
                <i className="bi bi-coin me-2"></i>
                [x] KapeBara Coins
              </div>
              <a href="#" className="view-history">view coin history</a>
            </div>

            {/* Top Up Button */}
            <Link
              to="/topup"
              className="top-up-btn d-flex align-items-center justify-content-center"
            >
              <span className="wallet-icon">
                <i className="bi bi-wallet2"></i>
              </span>
              <span className="top-up-text">Top-up</span>
            </Link>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-12 col-lg-8">
            {/* Recent Activities */}
            <div className="activities-section shadow-sm mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="section-title d-flex gap-2 align-items-center">
                  <span className="icon">
                    <i className="bi bi-clock-history"></i>
                  </span>
                  <span>Recent Wallet Activities</span>
                </div>
                <a href="#" className="view-all-link">View all</a>
              </div>

              {/* Example activity items */}
              <div className="activity-item d-flex">
                <div className="activity-icon">
                  <i className="bi bi-receipt"></i>
                </div>
                <div className="activity-info flex-grow-1">
                  <div className="activity-header d-flex justify-content-between">
                    <span className="activity-type">Order [date]</span>
                    <span className="activity-amount negative">-₱[Amount].00</span>
                  </div>
                  <div className="activity-details">[Order Location]</div>
                </div>
                <div className="activity-right">
                  <span className="arrow">
                    <i className="bi bi-chevron-right"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;