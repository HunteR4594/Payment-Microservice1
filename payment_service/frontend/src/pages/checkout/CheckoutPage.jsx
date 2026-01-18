import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersApi, vouchersApi, walletApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import './CheckoutPage.css';
import { useCurrentUser } from '../../context/currentUser';

// NOTE (Mock Order Service):
// Checkout currently reads orders via the PaymentService DB-backed Orders API (/api/orders).
// When a real Order Service is introduced, enable OrderService integration in the backend
// (OrderService:Enabled=true + BaseUrl) and then either:
// - switch the frontend to call the /api/order-integration/* proxy, or
// - re-implement ordersApi to point at the real service.


const CheckoutPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { userId } = useCurrentUser();

  const [useCoins, setUseCoins] = useState(false);
  const [coinsToUse, setCoinsToUse] = useState(0);
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
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [order, setOrder] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [availableOrders, setAvailableOrders] = useState([]);
  const [loadingOrdersList, setLoadingOrdersList] = useState(false);

  // Load user's orders list (used to pick a checkout order without typing an ID).
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoadingOrdersList(true);
        const res = await ordersApi.getAll(userId);
        // Backend returns: { success, data: Order[], total }
        const orders = Array.isArray(res?.data) ? res.data : [];
        setAvailableOrders(orders);

        if (!orderId) {
          const pending = orders.find(o => (o?.status || '').toLowerCase() === 'pending');
          if (pending?.id) {
            navigate(`/checkout/${pending.id}`, { replace: true });
          }
        }
      } catch (e) {
        console.error('Failed to load user orders list:', e);
        setAvailableOrders([]);
      } finally {
        setLoadingOrdersList(false);
      }
    };

    loadOrders();
  }, [userId, orderId, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!orderId) {
        setOrder(null);
        setWallet(null);
        setLoadError(null);
        return;
      }

      try {
        setLoadingOrder(true);
        setLoadError(null);
        const [orderRes, walletRes] = await Promise.all([
          ordersApi.getById(orderId),
          walletApi.getWallet(userId),
        ]);

        if (orderRes?.success === false) {
          setOrder(null);
          setWallet(null);
          setLoadError(orderRes?.message || 'Order not found');
          return;
        }

        setOrder(orderRes?.data || orderRes?.Data || orderRes);
        setWallet(walletRes?.data || walletRes);
      } catch (e) {
        console.error('Failed to load checkout order:', e);
        setOrder(null);
        setWallet(null);
        setLoadError(e?.message || 'Failed to load order for checkout');
      } finally {
        setLoadingOrder(false);
      }
    };
    load();
  }, [orderId, userId]);

  const paymentMethods = [
    { id: 'gcash', name: 'GCash', icon: 'bi-phone', img: '/gcash-logo.png' },
    { id: 'maya', name: 'Maya', icon: 'bi-credit-card', img: '/maya-logo.png' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'bi-credit-card-2-front', imgMulti: ['/mastercard-logo.png', '/visa-logo.png'] },
    { id: 'wallet', name: 'Kapebara Wallet', icon: 'bi-wallet2' },
    { id: 'grab_pay', name: 'GrabPay', icon: 'bi-phone', img: '/grabpay-logo.svg' },
  ];

  const [cardData, setCardData] = useState({
  cardholderName: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: ''
});

const handleCardDataChange = (field, value) => {
  setCardData(prev => ({
    ...prev,
    [field]: value
  }));
};


  const subtotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    // Subtotal should reflect the actual order items (exclude Delivery Fee line item if present).
    return order.items
      .filter((i) => !(i?.name || '').toLowerCase().includes('delivery fee'))
      .reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  }, [order]);

  const deliveryFee = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items
      .filter((i) => (i?.name || '').toLowerCase().includes('delivery fee'))
      .reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  }, [order]);

  const voucherDiscount = appliedVoucher?.discountAmount || 0;
  const deliveryFeeDiscount = 0;
  const maxCoins = wallet?.coins || 0;
  const coinsDiscount = useCoins ? Math.min(Number(coinsToUse || 0), maxCoins) : 0;

  const grossTotal = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  useEffect(() => {
    setCoinsToUse((current) => Math.min(Number(current || 0), maxCoins));
  }, [maxCoins]);

  const total = useMemo(
    () => Math.max(0, grossTotal - voucherDiscount - deliveryFeeDiscount - coinsDiscount),
    [grossTotal, voucherDiscount, deliveryFeeDiscount, coinsDiscount]
  );

  const displayItems = useMemo(() => {
    return (order?.items || []).filter((i) => !(i?.name || '').toLowerCase().includes('delivery fee'));
  }, [order]);

  useEffect(() => {
    const savedVoucher = localStorage.getItem('selectedVoucher');
    if (savedVoucher) {
      setVoucherCode(savedVoucher);
      handleApplyVoucher(savedVoucher); // Auto-trigger validation
      localStorage.removeItem('selectedVoucher');
    }
  }, [grossTotal]); // Runs when gross total is ready

  const handleApplyVoucher = async (codeToApply) => {
    const code = (codeToApply || voucherCode).trim().toUpperCase();
    if (!code) return;

    try {
      setError(null);
      // Backend expects 'code' and 'orderAmount'
      const response = await vouchersApi.apply({ 
        Code: code, 
        OrderAmount: Number(grossTotal)
      });

      if (response.success) {
        setAppliedVoucher(response);
        setVoucherCode(code);
      } else {
        // Now this message will actually show up!
        setError(response.message || 'Invalid voucher');
        setAppliedVoucher(null);
      }
    } catch (err) {
      console.error('Voucher apply failed:', err);
      setAppliedVoucher(null);
      setError(err?.message || 'Failed to apply voucher');
    }
  };

  

  const handleCheckout = async () => {
    if (!orderId || !order) {
      setError('No order loaded for checkout');
      return;
    }
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
      const response = await ordersApi.pay(
        orderId,
        selectedPaymentMethod,
        appliedVoucher?.voucher?.code || voucherCode || null,
        useCoins ? Math.min(Number(coinsToUse || 0), maxCoins) : 0
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
      console.error('Checkout failed:', err);
      setError(err?.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <div className="success-card">
          <i className="bi bi-check-circle-fill"></i>
          <h2>Payment successful</h2>
          <p>Your payment was successful. The order is now marked as completed.</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h2 className="page-title">Checkout</h2>
          {loadingOrdersList ? (
            <div className="alert alert-info">
              <i className="bi bi-hourglass-split me-2"></i>
              Loading your pending orders…
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No pending orders found for checkout.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadingOrder) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h2 className="page-title">Checkout</h2>
          <div className="alert alert-info">
            <i className="bi bi-hourglass-split me-2"></i>
            Loading order…
          </div>
        </div>
      </div>
    );
  }

  if (loadError && !order) {
    const pendingOrders = (availableOrders || []).filter(
      (o) => (o?.status || '').toLowerCase() === 'pending'
    );

    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h2 className="page-title">Checkout</h2>
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {loadError}
          </div>

          {(() => {
            const msg = String(loadError || '').toLowerCase();
            const showHint =
              msg.includes('not configured') ||
              msg.includes('timed out') ||
              msg.includes('failed to reach') ||
              msg.includes('refused') ||
              msg.includes('connect');
            if (!showHint) return null;

            return (
            <div className="alert alert-warning">
              <div className="fw-semibold mb-2">Order Service configuration hint</div>
              <div className="mb-2">
                Start your Order Service and/or set <code>OrderService:BaseUrl</code> (and paths if they differ) in{' '}
                <code>payment_service/backend/appsettings.Development.json</code>.
              </div>
              <pre className="mb-0">
                <code>{`"OrderService": {
  "BaseUrl": "http://localhost:7000",
  "GetOrderPath": "/api/orders/{orderId}",
  "ListOrdersByUserPath": "/api/orders?userId={userId}"
}`}</code>
              </pre>
            </div>
            );
          })()}

          {pendingOrders.length ? (
            <div className="alert alert-secondary">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">Try another pending order</span>
                <select
                  className="form-select"
                  value={orderId}
                  onChange={(e) => navigate(`/checkout/${e.target.value}`)}
                  style={{ maxWidth: 320 }}
                >
                  {pendingOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="alert alert-secondary">
              No pending orders available to switch to.
            </div>
          )}
        </div>
      </div>
    );
  }

  const pendingOrders = (availableOrders || []).filter(
    (o) => (o?.status || '').toLowerCase() === 'pending'
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h2 className="page-title">Checkout</h2>

        {pendingOrders.length ? (
          <div className="alert alert-secondary">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold">Order</span>
              <select
                className="form-select"
                value={orderId}
                onChange={(e) => navigate(`/checkout/${e.target.value}`)}
                style={{ maxWidth: 320 }}
              >
                {pendingOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="checkout-section">
          <h3>Order Summary</h3>
          <div className="text-muted" style={{ marginBottom: 8 }}>
            <div>Status: <strong>{order?.status || 'unknown'}</strong></div>
            {order?.createdAt ? (
              <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
            ) : null}
          </div>
          <div className="order-items">
            {displayItems.length === 0 ? (
              <div className="text-muted">No items found on this order.</div>
            ) : (
              displayItems.map((item, idx) => (
                <div key={idx} className="order-item">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
                </div>
              ))
            )}
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
              <small>{maxCoins} coins available</small>
              {useCoins && (
                <div className="mt-2">
                  <input
                    type="number"
                    min="0"
                    max={maxCoins}
                    value={coinsToUse}
                    onChange={(e) => setCoinsToUse(Number(e.target.value || 0))}
                  />
                </div>
              )}
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

        {/* Card Form – appears only for Credit/Debit */}
        {selectedPaymentMethod === 'card' && (
          <div className="card-form-section">
    
            {/* Cardholder name */}
            <div className="card-form-row">
              <input
                type="text"
                placeholder="Name of Cardholder"
                className="card-input full-width"
                value={cardData.cardholderName}
                onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
              />
            </div>

            {/* Card number */}
            <div className="card-form-row">
              <input
                type="text"
                placeholder="Card Number"
                className="card-input full-width"
                value={cardData.cardNumber}
                onChange={(e) => handleCardDataChange('cardNumber', e.target.value)}
                maxLength="16"
              />
            </div>

            {/* Expiry + CVV */}
            <div className="card-form-row expiry-cvv">
              <input
                type="text"
                placeholder="MM"
                className="card-input expiry-input"
                value={cardData.expiryMonth}
                onChange={(e) => handleCardDataChange('expiryMonth', e.target.value)}
                maxLength="2"
              />
              <span className="expiry-slash">/</span>
              <input
                type="text"
                placeholder="YYYY"
                className="card-input expiry-input"
                value={cardData.expiryYear}
                onChange={(e) => handleCardDataChange('expiryYear', e.target.value)}
                maxLength="4"
              />
              <input
                type="text"
                placeholder="CVV"
                className="card-input cvv-input"
                value={cardData.cvv}
                onChange={(e) => handleCardDataChange('cvv', e.target.value)}
                maxLength="3"
              />
            </div>
      
        </div>
      )}

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
