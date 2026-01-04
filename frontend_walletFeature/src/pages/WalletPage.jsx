import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../styles/WalletPage.css";
import { walletApi } from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatters";

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTransactions()
      ]);
      setWallet(walletRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="wallet-page-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-page-wrapper">
        <div className="page-header">
          <button className="back-arrow">
            <i className="bi bi-chevron-left"></i>
          </button>
          <img src="/kapebara-logo-2.png" alt="Kapebara" className="header-logo" />
        </div>
        <div className="container-xl">
          <div className="alert alert-danger mt-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Failed to connect to server. Make sure the backend_walletFeature is running.
            <button className="btn btn-outline-danger btn-sm ms-3" onClick={loadWalletData}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="balance-amount">{formatCurrency(wallet?.balance || 0)}</div>
              <div className="wallet-coins">
                <i className="bi bi-coin me-2"></i>
                {wallet?.coins || 0} KapeBara Coins
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
                <Link to="/recent-orders" className="view-all-link">View all</Link>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  No transactions yet
                </div>
              ) : (
                transactions.map((transaction) => (
                  <Link 
                    key={transaction.id}
                    to={transaction.type === 'order' ? `/order/${transaction.referenceId}` : `/topup-detail/${transaction.referenceId}`}
                    className="activity-item d-flex text-decoration-none"
                  >
                    <div className="activity-icon">
                      <i className={`bi ${transaction.type === 'order' ? 'bi-receipt' : 'bi-wallet2'}`}></i>
                    </div>
                    <div className="activity-info flex-grow-1">
                      <div className="activity-header d-flex justify-content-between">
                        <span className="activity-type">
                          {transaction.type === 'order' ? 'Order' : 'Top-up'} {formatDate(transaction.createdAt)}
                        </span>
                        <span className={`activity-amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                          {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </div>
                      <div className="activity-details">{transaction.description}</div>
                    </div>
                    <div className="activity-right">
                      <span className="arrow">
                        <i className="bi bi-chevron-right"></i>
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
