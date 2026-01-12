import React, { useState, useMemo } from 'react';
import { ordersApi, vouchersApi, walletApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const [useCoins, setUseCoins] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Mock order data
  const order = {
    items: [
      { id: 'latte', name: 'Iced Latte', qty: 2, price: 150 },
      { id: 'cookie', name: 'Chocolate Chip Cookie', qty: 1, price: 95 },
    ],
    fees: { delivery: 60 },
    discounts: { deliveryFee: 30, coins: 15 },
    coinsAvailable: 120,
  };

  const paymentMethods = [
    { id: 'gcash', name: 'GCash', icon: 'bi-phone' },
    { id: 'maya', name: 'Maya', icon: 'bi-credit-card' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'bi-credit-card-2-front' },
    { id: 'wallet', name: 'Kapebara Wallet', icon: 'bi-wallet2' },
  ];

  const subtotal = useMemo(
    () => order.items.reduce((sum, item) => sum + item.qty * item.price, 0),
    [order]
  );

  const voucherDiscount = appliedVoucher?.discountAmount || 0;
  const deliveryFee = order.fees.delivery;
  const deliveryFeeDiscount = order.discounts.deliveryFee;
  const coinsDiscount = useCoins ? order.discounts.coins : 0;

  const total = useMemo(
    () => subtotal + deliveryFee - voucherDiscount - deliveryFeeDiscount - coinsDiscount,
    [subtotal, deliveryFee, voucherDiscount, deliveryFeeDiscount, coinsDiscount]
  );

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const result = await vouchersApi.apply(voucherCode, subtotal);
      setAppliedVoucher(result.data);
      setError(null);
    } catch (err) {
      setError('Invalid voucher code');
    }
  };

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const orderItems = order.items.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price
      }));
      
      const response = await ordersApi.create(
        orderItems,
        selectedPaymentMethod,
        appliedVoucher?.code || null,
        useCoins ? order.coinsAvailable : 0
      );

      if (response.success) {
        const orderData = response.data;
        
        // Check if we have a PayMongo checkout URL (for non-wallet payments)
        if (orderData?.paymentLinkUrl) {
          // Check if it's a mock URL or real PayMongo URL
          if (orderData.paymentLinkUrl.startsWith('/mock-checkout')) {
            // Mock mode - navigate to our mock checkout page
            window.location.href = `http://localhost:3000${orderData.paymentLinkUrl}`;
          } else if (orderData.paymentLinkUrl.startsWith('http')) {
            // Real PayMongo URL - redirect to external checkout
            window.location.href = orderData.paymentLinkUrl;
          } else {
            setSuccess(true);
          }
        } else {
          // Wallet payment completed immediately
          setSuccess(true);
        }
      } else {
        setError(response.message || 'Checkout failed');
      }
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <div className="success-card">
          <i className="bi bi-check-circle-fill"></i>
          <h2>Order Placed!</h2>
          <p>Your order has been successfully placed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h2 className="page-title">Checkout</h2>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="checkout-section">
          <h3>Order Summary</h3>
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <span>{item.qty}x {item.name}</span>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voucher */}
        <div className="checkout-section">
          <h3>Apply Voucher</h3>
          <div className="voucher-input">
            <input
              type="text"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button onClick={handleApplyVoucher}>Apply</button>
          </div>
          {appliedVoucher && (
            <div className="voucher-applied">
              <i className="bi bi-check-circle"></i>
              Voucher applied: -{formatCurrency(voucherDiscount)}
            </div>
          )}
        </div>

        {/* Coins */}
        <div className="checkout-section">
          <div className="coins-toggle">
            <div>
              <span>Use Kapebara Coins</span>
              <small>{order.coinsAvailable} coins available (-{formatCurrency(order.discounts.coins)})</small>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={useCoins}
                onChange={(e) => setUseCoins(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div className="checkout-section">
          <h3>Payment Method</h3>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`payment-option ${selectedPaymentMethod === method.id ? 'active' : ''}`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <i className={`bi ${method.icon}`}></i>
                <span>{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="checkout-section total-section">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="total-row">
            <span>Delivery Fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          {voucherDiscount > 0 && (
            <div className="total-row discount">
              <span>Voucher Discount</span>
              <span>-{formatCurrency(voucherDiscount)}</span>
            </div>
          )}
          {coinsDiscount > 0 && (
            <div className="total-row discount">
              <span>Coins Discount</span>
              <span>-{formatCurrency(coinsDiscount)}</span>
            </div>
          )}
          <div className="total-row final">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={isProcessing || !selectedPaymentMethod}
        >
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
