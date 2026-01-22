import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./WalletPage.css";
import { walletApi } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import CoinHistory from "../../components/CoinHistory";
import { useCurrentUser } from "../../context/currentUser";

const WalletPage = () => {
  const { userId } = useCurrentUser();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCoinHistory, setShowCoinHistory] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletRes, transactionsRes] = await Promise.all([
        walletApi.getWallet(userId),
        walletApi.getTransactions(userId)
      ]);
      setWallet(walletRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      setWallet(null);
      setTransactions([]);
      setError(err?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const coinTransactions = (transactions || []).filter(
    (t) => (t?.type || '').toLowerCase() === 'coins'
  );

  const activityTransactions = (transactions || []).filter(
    (t) => (t?.type || '').toLowerCase() !== 'coins'
  );

  if (loading) {
    return (
      <div className="wallet-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-page">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={loadWalletData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <div className="row g-4">
        {/* LEFT COLUMN */}
        <div className="col-12 col-lg-4">
          {/* Wallet Card */}
          <div className="balance-card shadow-sm">
            <div className="balance-header">
              <span className="logo-text">
                <i className="bi bi-wallet2 me-2"></i> My Wallet
              </span>
            </div>
            <div className="balance-label">Available Balance</div>
            <div className="balance-amount">{formatCurrency(wallet?.balance || 0)}</div>
            <div className="wallet-coins">
              <i className="bi bi-coin me-2"></i>
              {wallet?.coins || 0} KapeBara Coins
            </div>
            <a href="#" className="view-history" onClick={(e) => { e.preventDefault(); setShowCoinHistory(true); }}>
              view coin history
            </a>
            
            {/* Coin History Popup */}
            <CoinHistory
              show={showCoinHistory}
              onHide={() => setShowCoinHistory(false)}
              transactions={coinTransactions}
            />
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
          <div className="activities-section shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="section-title d-flex gap-2 align-items-center">
                <span className="icon">
                  <i className="bi bi-clock-history"></i>
                </span>
                <span>Recent Wallet Activities</span>
              </div>
              <Link to="/recent-orders" className="view-all-link">View all</Link>
            </div>

            {activityTransactions.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                No transactions yet
              </div>
            ) : (
              activityTransactions.map((transaction) => (
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
  );
};

export default WalletPage;
