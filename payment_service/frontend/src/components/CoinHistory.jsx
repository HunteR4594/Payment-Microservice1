import React from 'react';
import './CoinHistory.css';

const CoinHistory = ({ show, onHide }) => {
  if (!show) return null;

  const coinHistory = [
    { id: 1, date: '2026-01-10', description: 'Order reward', amount: 10, type: 'earned' },
    { id: 2, date: '2026-01-08', description: 'Birthday bonus', amount: 50, type: 'earned' },
    { id: 3, date: '2026-01-05', description: 'Used for order', amount: -15, type: 'used' },
    { id: 4, date: '2026-01-01', description: 'New Year bonus', amount: 100, type: 'earned' },
  ];

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
          {coinHistory.map((item) => (
            <div key={item.id} className="coin-history-item">
              <div className="coin-icon">
                <i className={`bi ${item.amount > 0 ? 'bi-plus-circle' : 'bi-dash-circle'}`}></i>
              </div>
              <div className="coin-info">
                <span className="coin-desc">{item.description}</span>
                <span className="coin-date">{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <span className={`coin-amount ${item.amount > 0 ? 'positive' : 'negative'}`}>
                {item.amount > 0 ? '+' : ''}{item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoinHistory;
