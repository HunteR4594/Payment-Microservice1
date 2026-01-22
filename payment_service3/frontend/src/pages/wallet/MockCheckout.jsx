import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topUpApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import './MockCheckout.css';

const MockCheckout = () => {
  const { topUpId } = useParams();
  const navigate = useNavigate();
  const [topUp, setTopUp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadTopUp();
  }, [topUpId]);

  const loadTopUp = async () => {
    try {
      const response = await topUpApi.getById(topUpId);
      setTopUp(response.data);
    } catch (err) {
      console.error('Failed to load top-up:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    setProcessing(true);
    try {
      await topUpApi.complete(topUpId);
      navigate(`/topup/success/${topUpId}`);
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  const handleFail = async () => {
    setProcessing(true);
    try {
      await topUpApi.fail(topUpId);
      navigate(`/topup/failed/${topUpId}`);
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  if (loading) {
    return (
      <div className="mock-checkout d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-checkout">
      <div className="mock-card">
        <div className="mock-header">
          <i className="bi bi-credit-card"></i>
          <h2>Mock Payment</h2>
          <p className="text-muted">This is a simulated payment page for testing</p>
        </div>

        <div className="mock-details">
          <div className="detail-row">
            <span>Amount</span>
            <span className="amount">{formatCurrency(topUp?.amount || 0)}</span>
          </div>
          <div className="detail-row">
            <span>Method</span>
            <span>{topUp?.paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span>Reference</span>
            <span>{topUp?.referenceNumber}</span>
          </div>
        </div>

        <div className="mock-actions">
          <button 
            className="btn btn-success btn-lg w-100 mb-2"
            onClick={handleSuccess}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Simulate Success'}
          </button>
          <button 
            className="btn btn-danger w-100"
            onClick={handleFail}
            disabled={processing}
          >
            Simulate Failure
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockCheckout;
