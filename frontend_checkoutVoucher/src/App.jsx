import { useState, useEffect, useMemo } from 'react';
import { getPaymentMethods, createPaymentCheckout, redirectToCheckout } from './services/paymentApi';
import { getVouchers, redeemVoucher, applyVoucher } from './services/voucherApi';
import MyVouchers from './MyVouchers';
import { PaymentMethodPopup, VoucherHistoryPopup, OrderPlacedPopup } from './components';
import './App.css';

function App() {
  const [useCoins, setUseCoins] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [methodsError, setMethodsError] = useState(null);
  const paymentMethodLabels = {
  'card': 'Credit/Debit Card',
  'gcash': 'GCash',
  'grab_pay': 'GrabPay',
  'paymaya': 'Maya',
};
  // Voucher states
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showVoucherHistory, setShowVoucherHistory] = useState(false);
  const [showPaymentMethodPopup, setShowPaymentMethodPopup] = useState(false);
  const [showOrderPlacedPopup, setShowOrderPlacedPopup] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');

  // Mock order data (replace with real cart/order data as needed)
  const [order] = useState({
    items: [
      { id: 'latte', name: 'Iced Latte', qty: 2, price: 150 },
      { id: 'cookie', name: 'Chocolate Chip Cookie', qty: 1, price: 95 },
    ],
    delivery: {
      day: 'Today',
      time: '3:00 – 3:30 PM',
      landmark: 'BGC High Street, Taguig',
    },
    fees: {
      delivery: 60,
    },
    discounts: {
      deliveryFee: 30,
      coins: 15,
    },
    coinsAvailable: 120,
  });

  const subtotal = useMemo(
    () => order.items.reduce((sum, item) => sum + item.qty * item.price, 0),
    [order]
  );

  const voucherDiscount = appliedVoucher ? (appliedVoucher.discountAmount || appliedVoucher.DiscountAmount || 0) : 0;
  const deliveryFee = order.fees.delivery || 0;
  const deliveryFeeDiscount = order.discounts.deliveryFee || 0;
  const coinsDiscount = useCoins ? order.discounts.coins || 0 : 0;
  
  // VAT is already included in item prices; we compute for display only (12% portion of VAT-inclusive price)
  const vatPortion = useMemo(() => {
    const net = subtotal / 1.12; // approximate net of VAT
    return Math.round(net * 0.12);
  }, [subtotal]);

  // Total should NOT add VAT again since prices are VAT-inclusive
  const total = useMemo(
    () => subtotal + deliveryFee - voucherDiscount - deliveryFeeDiscount - coinsDiscount,
    [subtotal, deliveryFee, voucherDiscount, deliveryFeeDiscount, coinsDiscount]
  );

  // Fetch available payment methods on component mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoadingMethods(true);
        setMethodsError(null);
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0]);
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error);
        setMethodsError('Failed to load payment methods. Please refresh.');
        // Fallback payment methods for demo
        setPaymentMethods(['Card', 'Gcash', 'Maya', 'GrabPay']);
      } finally {
        setIsLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Fetch vouchers on component mount
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const voucherData = await getVouchers();
        setVouchers(voucherData);
      } catch (error) {
        console.error('Failed to load vouchers:', error);
        // Fallback mock vouchers for demo
        setVouchers([
          { id: 1, name: 'SAVE20', minSpend: 15.00, hoursLeft: 48, isUsed: false, discountAmount: 20.00 },
          { id: 2, name: 'FREESHIP', minSpend: 50.00, hoursLeft: 72, isUsed: false, discountAmount: 30.00 },
        ]);
      }
    };

    fetchVouchers();
  }, []);

  // Handle voucher application
  const handleUseVoucher = async (voucher) => {
    try {
      const result = await applyVoucher(voucher.id || voucher.Id, subtotal);
      setAppliedVoucher(voucher);
      setShowVoucherModal(false);
      alert(result.message || `Voucher "${voucher.name || voucher.Name}" applied!`);
    } catch (error) {
      alert(error.message || 'Failed to apply voucher');
    }
  };

  // Handle voucher redemption
  const handleRedeemVoucher = async (code) => {
    const voucher = await redeemVoucher(code);
    // Add the redeemed voucher to the list
    setVouchers(prev => [...prev, voucher]);
    alert(`Voucher "${voucher.name || voucher.Name}" redeemed successfully!`);
  };

  // Handle payment processing
  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      
      // Create payment request using the computed total
      const paymentRequest = {
        orderId: '550e8400-e29b-41d4-a716-446655440000', // Replace with actual order ID
        userId: '550e8400-e29b-41d4-a716-446655440001',  // Replace with actual user ID
        // Send amount in pesos; backend will convert to cents (avoid double *100)
        amount: Number(total.toFixed(2)),
        currency: 'PHP',
        description: 'Coffee Shop Order',
        paymentMethod: selectedPaymentMethod,
      };

      // Get checkout URL from backend
      const checkoutUrl = await createPaymentCheckout(paymentRequest);
      
      // Set order result for the popup
      setOrderResult({
        orderNumber: orderNumber,
        checkoutUrl: checkoutUrl
      });
      
      // Show Order Placed popup
      setShowOrderPlacedPopup(true);
      
      // Redirect to PayMongo checkout in new tab
      redirectToCheckout(checkoutUrl);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="checkout-page">
      {/* Header */}
      <header className="header">
        {/*<div className="container-fluid px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-4">
              <div className="logo d-flex align-items-center gap-2">
                <span className="logo-text">Kapebara</span>
              </div>
              <nav className="d-flex gap-4">
                <a href="#home" className="nav-link">Home</a>
                <a href="#menu" className="nav-link">Menu</a>
                <a href="#order" className="nav-link">Your Order</a>
              </nav>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button className="icon-btn"> bell icon</button>
              <button className="icon-btn user-btn">user icon</button>
              <button className="btn btn-dark rounded-pill px-4">Log Out</button>
            </div>
          </div>
        </div>*/}
      </header>

      <div className="container py-4">
        {/* Back button and title */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="back-btn">←</button>
          <h1 className="checkout-title mb-0">Checkout</h1>
        </div>

        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-6">
            {/* Delivery Details Card */}
            <div className="card p-4 mb-4">
              <h3 className="section-title mb-4">Delivery Details</h3>
              
                  <div className="d-flex gap-3 mb-3">
                    <span className="icon">🛵</span>
                    <div>
                      <div className="text-muted">Receive by:</div>
                      <div>{order.delivery.day}, {order.delivery.time}</div>
                    </div>
                  </div>

                  <div className="d-flex gap-3 mb-4">
                    <span className="icon">📍</span>
                    <div>
                      <div className="text-muted">Deliver to</div>
                      <div>{order.delivery.landmark}</div>
                    </div>
                  </div>

              <h4 className="section-subtitle mb-3">Additional Details</h4>
              
              <div className="mb-3">
                <label className="form-label">Address Details (Optional)</label>
                <input 
                  type="text" 
                  className="form-control form-input"
                  placeholder="Building name, unit, floor"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Delivery Instructions (Optional)</label>
                <input 
                  type="text" 
                  className="form-control form-input"
                  placeholder="Notes to Rider"
                />
              </div>

              <button className="btn btn-dark w-100 py-3 rounded-pill">
                Save Details
              </button>
            </div>

            {/* Payment Details Card */}
            <div className="card p-4 mb-4">
              <h3 className="section-title mb-4">Payment Details</h3>
              
              {methodsError && (
                <div className="alert alert-warning mb-3">{methodsError}</div>
              )}

              {isLoadingMethods ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading payment methods...</span>
                </div>
              ) : (
                <div>
                  <label className="form-label">Select Payment Method</label>
                  <div 
                    className="form-select form-input mb-3 d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowPaymentMethodPopup(true)}
                  >
                    <span>
                      {selectedPaymentMethod 
                        ? (paymentMethodLabels[selectedPaymentMethod.toLowerCase()] || selectedPaymentMethod)
                        : '-- Choose a payment method --'
                      }
                    </span>
                    <i className="bi bi-chevron-down"></i>
                  </div>

                  <div className="alert alert-info mb-0">
                    <small>
                      You will be redirected to PayMongo's secure checkout page to complete your payment.
                    </small>
                  </div>
                </div>
              )}
            </div>

            {/* Vouchers and Discount Card */}
            <div className="card p-4">
              <h3 className="section-title mb-4">Vouchers and Discount</h3>
              
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control form-input"
                  placeholder="Enter Voucher or Discount Code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
              </div>

              {appliedVoucher && (
                <div className="alert alert-success mb-3">
                  <strong>Applied:</strong> {appliedVoucher.name || appliedVoucher.Name} 
                  <span className="ms-2">(-₱{voucherDiscount.toFixed(2)})</span>
                  <button 
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={() => setAppliedVoucher(null)}
                  >
                    Remove
                  </button>
                </div>
              )}

              <a 
                href="#vouchers" 
                className="text-decoration-none text-dark"
                onClick={(e) => {
                  e.preventDefault();
                  setShowVoucherModal(true);
                }}
              >
                View available vouchers and discount →
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-6">
            {/* Order Summary Card */}
            <div className="card p-4 mb-4">
              <h3 className="section-title mb-4">Order Summary</h3>
              
              {order.items.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>{item.qty}x</span>
                  <span>{item.name}</span>
                  <span>₱{(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Order Totals Card */}
            <div className="card p-4">
              <h3 className="section-title mb-4">Order Totals</h3>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>Voucher</span>
                  <span>-₱{voucherDiscount.toFixed(2)}</span>
                </div>
                {appliedVoucher && (
                  <small className="text-muted">Applied: {appliedVoucher.name || appliedVoucher.Name}</small>
                )}
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Delivery fee</span>
                <span>₱{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Delivery fee discount</span>
                <span>-₱{deliveryFeeDiscount.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>VAT (included)</span>
                <span>₱{vatPortion.toFixed(2)}</span>
              </div>

              <div className="coins-section p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="fw-bold">Kapebara Coins</div>
                    <small className="text-muted">Use {order.coinsAvailable} coins to save ₱{(order.discounts.coins || 0).toFixed(2)}</small>
                  </div>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input coins-toggle" 
                      type="checkbox" 
                      id="coinsSwitch"
                      checked={useCoins}
                      onChange={(e) => setUseCoins(e.target.checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between mb-4">
                <span>Coins discount</span>
                <span>-₱{coinsDiscount.toFixed(2)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4 fs-4 fw-bold">
                <span>TOTAL</span>
                <span>₱{total.toFixed(2)}</span>
              </div>

              <button 
                className="btn btn-dark btn-lg w-100 py-3 rounded-pill"
                onClick={handlePlaceOrder}
                disabled={isProcessingPayment || isLoadingMethods || !selectedPaymentMethod}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  `Place Order - ₱${total.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <MyVouchers 
          vouchers={vouchers.filter(v => !(v.isUsed || v.IsUsed))}
          onUseVoucher={handleUseVoucher}
          onRedeemVoucher={handleRedeemVoucher}
          onClose={() => setShowVoucherModal(false)}
          onViewHistory={() => {
            setShowVoucherModal(false);
            setShowVoucherHistory(true);
          }}
        />
      )}

      {/* Voucher History Popup */}
      <VoucherHistoryPopup
        show={showVoucherHistory}
        onClose={() => setShowVoucherHistory(false)}
        vouchers={vouchers}
        currentVoucher={appliedVoucher}
        onSelectVoucher={(voucher) => {
          handleUseVoucher(voucher);
          setShowVoucherHistory(false);
        }}
      />

      {/* Payment Method Popup */}
      <PaymentMethodPopup
        show={showPaymentMethodPopup}
        onClose={() => setShowPaymentMethodPopup(false)}
        walletBalance={order.coinsAvailable * 10}
        initialMethod={selectedPaymentMethod === 'card' ? 'card' : 
          selectedPaymentMethod === 'gcash' ? 'gcash' : 
          selectedPaymentMethod === 'paymaya' ? 'paymaya' : 
          selectedPaymentMethod === 'grab_pay' ? 'grab_pay' : 'kapebara'}
        onConfirm={(paymentData) => {
          // Map popup payment method to API method
          let apiMethod = paymentData.method;
          if (paymentData.method === 'kapebara') apiMethod = 'card'; // Default for wallet
          // GCash, Maya, and GrabPay are now passed directly
          setSelectedPaymentMethod(apiMethod);
          setShowPaymentMethodPopup(false);
        }}
      />

      {/* Order Placed Success Popup */}
      <OrderPlacedPopup
        show={showOrderPlacedPopup}
        onClose={() => setShowOrderPlacedPopup(false)}
        orderNumber={orderResult?.orderNumber || 'ORD-12345'}
        total={total}
        coinsEarned={Math.floor(total / 10)}
        estimatedDate={order.delivery.day}
        estimatedTime={order.delivery.time}
        onViewOrderStatus={() => setShowOrderPlacedPopup(false)}
        onBackToMenu={() => setShowOrderPlacedPopup(false)}
      />

      <style jsx>{`
        .checkout-page {
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .header {
          background-color: #fff;
          border-bottom: 1px solid #e0e0e0;
        }

        .logo-icon {
          font-size: 1.5rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d2d2d;
        }

        .nav-link {
          color: #2d2d2d;
          text-decoration: none;
          font-weight: 500;
        }

        .nav-link:hover {
          color: #000;
        }

        .icon-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .user-btn {
          background-color: #2d2d2d;
          color: white;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .checkout-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d2d2d;
        }

        .card {
          background: white;
          border: none;
          border-radius: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d2d2d;
        }

        .section-subtitle {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2d2d2d;
        }

        .icon {
          font-size: 1.5rem;
        }

        .form-input {
          border-radius: 0.5rem;
          border: 1px solid #e0e0e0;
          padding: 0.75rem 1rem;
          background: white;
          box-shadow: none !important;
        }

        .form-input:focus {
          border-color: #2d2d2d;
          box-shadow: 0 0 0 0.2rem rgba(45, 45, 45, 0.1) !important;
          outline: none;
        }

        .clickable {
          cursor: pointer;
          transition: all 0.2s;
        }

        .clickable:hover {
          background-color: #f8f8f8;
          border-radius: 0.5rem;
          padding: 0.5rem;
          margin: -0.5rem;
        }

        .coins-section {
          background-color: #f8f8f8;
          border-radius: 0.75rem;
        }

        .coins-toggle {
          transform: scale(1.5);
          cursor: pointer;
        }

        .btn-dark {
          background-color: #2d2d2d;
          border: none;
          font-weight: 600;
        }

        .btn-dark:hover {
          background-color: #1a1a1a;
        }

        .gap-4 {
          gap: 1.5rem;
        }

        .gap-3 {
          gap: 1rem;
        }

        .gap-2 {
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default App;
