import React, { useState, useMemo, useEffect } from 'react';
import { ordersApi, vouchersApi, walletApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import './CheckoutPage.css';


const CheckoutPage = () => {
  const [useCoins, setUseCoins] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  // Delivery address fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressPostal, setAddressPostal] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useMock, setUseMock] = useState(false);

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
    { id: 'gcash', name: 'GCash', icon: 'bi-phone', img: '/gcash-logo.png' },
    { id: 'maya', name: 'Maya', icon: 'bi-credit-card', img: '/maya-logo.png' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'bi-credit-card-2-front', imgMulti: ['/mastercard-logo.png', '/visa-logo.png'] },
    { id: 'wallet', name: 'Kapebara Wallet', icon: 'bi-wallet2' },
    { id: 'grab_pay', name: 'GrabPay', icon: 'bi-phone', img: '/grabpay-logo.svg' },
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

  useEffect(() => {
    const savedVoucher = localStorage.getItem('selectedVoucher');
    if (savedVoucher) {
      setVoucherCode(savedVoucher);
      handleApplyVoucher(savedVoucher); // Auto-trigger validation
      localStorage.removeItem('selectedVoucher');
    }
  }, [subtotal]); // Runs when subtotal is ready

  const handleApplyVoucher = async (codeToApply) => {
    const code = (codeToApply || voucherCode).trim().toUpperCase();
    if (!code) return;

    try {
      setError(null);
      // Backend expects 'code' and 'orderAmount'
      const response = await vouchersApi.apply({ 
        Code: code, 
        OrderAmount: Number(subtotal)
      });

      if (response.success) {
        setAppliedVoucher(response);
        setVoucherCode(code);
        setUseMock(false);
      } else {
        // Now this message will actually show up!
        setError(response.message || 'Invalid voucher');
        setAppliedVoucher(null);
      }
    } catch (err) {
      // Fallback to mock voucher when voucher service is unavailable
      setUseMock(true);
      setAppliedVoucher({ code, discountAmount: Math.min(50, Math.round(subtotal * 0.1)) });
      setVoucherCode(code);
    }
  };

  

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    // basic address validation
    if (!recipientName || !recipientPhone || !addressLine || !addressCity) {
      setError('Please provide a delivery address (name, phone, address, city)');
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
      
      const addressObj = {
        name: recipientName,
        phone: recipientPhone,
        line: addressLine,
        city: addressCity,
        postalCode: addressPostal || null,
      };

      const response = await ordersApi.create(
        orderItems,
        selectedPaymentMethod,
        appliedVoucher?.code || null,
        useCoins ? order.coinsAvailable : 0,
        'Main Branch',
        addressObj
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
      // If backend unavailable, mark as mock success so developer can continue
      console.error('Checkout failed, falling back to mock:', err);
      setUseMock(true);
      setSuccess(true);
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

        {useMock && (
          <div className="alert alert-warning">
            <i className="bi bi-info-circle me-2"></i>
            Showing mock data / mock checkout result — backend unavailable.
            <button className="btn btn-sm btn-outline-secondary ms-3" onClick={() => { setUseMock(false); window.location.reload(); }}>
              Retry
            </button>
          </div>
        )}

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
            <button 
              className="apply-btn"
              onClick={() => handleApplyVoucher()} // Ensure it's calling the function
              disabled={!voucherCode.trim()}      // Only disable if input is empty
            >
              Apply
            </button>
          </div>
          {appliedVoucher && (
            <div className="voucher-applied">
              <i className="bi bi-check-circle"></i>
              Voucher applied: -{formatCurrency(voucherDiscount)}
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div className="checkout-section">
          <h3>Delivery Address</h3>
          <div className="address-grid">
            <input type="text" placeholder="Full name" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
            <input type="text" placeholder="Phone number" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} />
            <input type="text" placeholder="Address line" value={addressLine} onChange={e => setAddressLine(e.target.value)} />
            <input type="text" placeholder="City" value={addressCity} onChange={e => setAddressCity(e.target.value)} />
            <input type="text" placeholder="Postal code (optional)" value={addressPostal} onChange={e => setAddressPostal(e.target.value)} />
          </div>
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
                {method.img ? (
                  <img src={method.img} alt={method.name} className="payment-logo-img" />
                ) : method.imgMulti ? (
                  <span className="payment-logo-multi">
                    {method.imgMulti.map((src, i) => (
                      <img key={i} src={src} alt={`${method.name}-${i}`} className="payment-logo-img" />
                    ))}
                  </span>
                ) : (
                  <i className={`bi ${method.icon}`}></i>
                )}
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
