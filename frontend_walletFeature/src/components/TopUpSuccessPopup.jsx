import React, { useState, useEffect } from 'react';
import { topUpApi, walletApi } from '../services/api';
import './TopUpSuccessPopup.css';

const TopUpSuccessPopup = ({ show, onClose, topUpId, amount, paymentMethod, latestBalance }) => {
  const [topUpData, setTopUpData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && topUpId) {
      loadTopUpDetails();
    }
  }, [show, topUpId]);

  const loadTopUpDetails = async () => {
    try {
      setLoading(true);
      const [topUpRes, walletRes] = await Promise.all([
        topUpApi.getById(topUpId),
        walletApi.getWallet()
      ]);
      setTopUpData(topUpRes.data);
      setWalletData(walletRes.data);
    } catch (err) {
      console.error('Failed to load top-up details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const paymentMethodNames = {
    gcash: 'GCash',
    maya: 'Maya',
    card: 'Credit/Debit Card'
  };

  // Use props if provided, otherwise use fetched data
  const displayAmount = amount || topUpData?.amount || 0;
  const displayPaymentMethod = paymentMethod || topUpData?.paymentMethod || '';
  const displayBalance = latestBalance || walletData?.balance || 0;

  return (
    <div className="success-popup-wrapper" onClick={onClose}>
      <div className="success-popup-card" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <h1 className="success-popup-title">
              <i className="bi bi-check-circle"></i> You're all topped up!
            </h1>

            <div className="success-popup-details">
              <div className="success-detail-row">
                <span>Top-up amount</span>
                <span>₱{displayAmount?.toLocaleString()}.00</span>
              </div>

              <div className="success-detail-row">
                <span>Paid with</span>
                <span>{paymentMethodNames[displayPaymentMethod] || displayPaymentMethod}</span>
              </div>

              <div className="success-detail-row">
                <span>Latest Balance</span>
                <span>₱{displayBalance?.toLocaleString()}.00</span>
              </div>
            </div>

            <button className="success-popup-button" onClick={onClose}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopUpSuccessPopup;
