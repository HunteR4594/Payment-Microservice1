import React from 'react';
import './CoinHistory.css';

const CoinHistory = ({ show, onHide, transactions = [] }) => {
  if (!show) return null;

  const coinHistory = (transactions || [])
    .filter((t) => (t?.type || '').toLowerCase() === 'coins')
    .map((t) => ({
      id: t.id,
      date: t.createdAt,
      description: t.description || 'Coin activity',
      amount: Number(t.amount || 0),
    }));

  return (
    <div className="coin-history-overlay" onClick={onHide}>
      <div className="coin-history-popup" onClick={(e) => e.stopPropagation()}>
        <div className="coin-history-header">
          <h2>Coin History</h2>
          <button className="close-btn" onClick={onHide}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="coin-history-list">
          {coinHistory.length === 0 ? (
            <div className="coin-history-item">
              <div className="coin-info">
                <span className="coin-desc">No coin history yet</span>
              </div>
            </div>
          ) : (
            coinHistory.map((item) => (
              <div key={item.id} className="coin-history-item">
                <div className="coin-icon">
                  <i className={`bi ${item.amount > 0 ? 'bi-plus-circle' : 'bi-dash-circle'}`}></i>
                </div>
                <div className="coin-info">
                  <span className="coin-desc">{item.description}</span>
                  <span className="coin-date">{new Date(item.date).toLocaleString()}</span>
                </div>
                <span className={`coin-amount ${item.amount > 0 ? 'positive' : 'negative'}`}>
                  {item.amount > 0 ? '+' : ''}{item.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinHistory;
