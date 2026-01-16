import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { walletApi } from '../services/api';
import './CoinHistory.css';

const CoinHistory = ({ show, onHide }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      loadCoinHistory();
    }
  }, [show]);

  const loadCoinHistory = async () => {
    try {
      setLoading(true);
      const response = await walletApi.getTransactions('user_001', 50);
      const coinTransactions = (response.data || []).filter(
        (t) => t.type === 'order' || t.description?.toLowerCase().includes('coin')
      );
      setHistoryData(coinTransactions);
    } catch (err) {
      console.error('Failed to load coin history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <Modal.Body className="p-4" style={{ minHeight: '550px' }}>
        <div className="d-flex align-items-center mb-5 mt-2">
          <i 
            className="bi bi-chevron-left" 
            style={{ fontSize: '28px', cursor: 'pointer', marginRight: '16px' }} 
            onClick={onHide} 
          />
          <h1 className="history-title mb-0">
            Kapebara Coin history
          </h1>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && historyData.length === 0 && (
          <div className="text-center text-muted py-5">
            <i className="bi bi-coin fs-1 mb-3 d-block"></i>
            <p>No coin history yet</p>
          </div>
        )}

        {!loading && historyData.map((item) => (
          <div key={item.id} className="history-clickable-item history-body-text">
            <div className="d-flex gap-3 align-items-center">
              <i className={`bi ${item.type === 'order' ? 'bi-receipt' : 'bi-wallet2'}`} style={{ fontSize: '24px' }}></i>
              <div>
                <p className="mb-0 fw-bold" style={{ fontSize: '14px' }}>
                  {item.type === 'order' ? 'Order' : 'Transaction'}{' '}
                  <span className="text-muted fw-normal">[{formatDate(item.createdAt)}]</span>
                </p>
                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                  {item.description || 'Kapebara Coins used'}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0 fw-semibold" style={{ fontSize: '13px' }}>
                {Math.abs(item.coinsUsed || 0)} Kapebara Coins
              </p>
              <i className="bi bi-coin"></i>
            </div>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default CoinHistory;
