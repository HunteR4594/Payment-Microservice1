import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { ChevronLeft, ReceiptText, CircleDollarSign, Wallet } from 'lucide-react';
import { walletApi } from '../services/api';
import './CoinHistory.css';

const CoinHistory = ({ show, onHide }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      loadCoinHistory();
    }
  }, [show]);

  const loadCoinHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch transactions and filter for coin-related ones (orders that use coins)
      const response = await walletApi.getTransactions('user_001', 50);
      // Filter transactions that involve coin spending (typically orders)
      const coinTransactions = response.data.filter(
        (t) => t.type === 'order' || t.description?.toLowerCase().includes('coin')
      );
      setHistoryData(coinTransactions);
    } catch (err) {
      setError(err.message);
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
        
        {/* FIXED HEADER ALIGNMENT */}
        <div className="d-flex align-items-center mb-5 mt-2">
          <ChevronLeft 
            size={28} 
            style={{ cursor: 'pointer', marginRight: '16px' }} 
            onClick={onHide} 
          />
          <h1 className="history-title mb-0" style={{ lineHeight: '1' }}>
            Kapebara Coin history
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Failed to load coin history. Please try again.
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && historyData.length === 0 && (
          <div className="text-center text-muted py-5">
            <CircleDollarSign size={48} className="mb-3" strokeWidth={1} />
            <p>No coin history yet</p>
          </div>
        )}

        {/* History List */}
        {!loading && !error && historyData.map((item) => (
          <div key={item.id} className="history-clickable-item history-body-text">
            <div className="d-flex gap-3 align-items-center">
              {item.type === 'order' ? (
                <ReceiptText size={24} color="#333" strokeWidth={1.2} />
              ) : (
                <Wallet size={24} color="#333" strokeWidth={1.2} />
              )}
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
                {item.amount < 0 ? '' : '-'}{Math.abs(item.coinsUsed || 0)} Kapebara Coins
              </p>
              {/* Single Coin Icon */}
              <div className="single-coin-wrapper">
                 <CircleDollarSign size={18} color="#333" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default CoinHistory;
