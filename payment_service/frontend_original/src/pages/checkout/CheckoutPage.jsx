import { useState, useEffect, useMemo } from 'react';
import { getPaymentMethods, createPaymentCheckout, redirectToCheckout } from '../../services/api';
import { getVouchers, redeemVoucher, applyVoucher } from '../../services/api';
import MyVouchersModal from '../../components/MyVouchersModal';
import VoucherHistoryPopup from '../../components/VoucherHistoryPopup';
import PaymentMethodPopup from '../../components/PaymentMethodPopup';
import OrderPlacedPopup from '../../components/OrderPlacedPopup';
import OrderFailedPopup from '../../components/OrderFailedPopup';
import './CheckoutPage.css';

function CheckoutPage() {
  const [useCoins, setUseCoins] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [methodsError, setMethodsError] = useState(null);
  const [showOrderFailedPopup, setShowOrderFailedPopup] = useState(false);
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

  // Mock order data
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

  const voucherDiscount = Number(appliedVoucher ? (appliedVoucher.discountAmount || appliedVoucher.DiscountAmount || 0) : 0);
  const deliveryFee = order.fees.delivery || 0;
  const deliveryFeeDiscount = order.discounts.deliveryFee || 0;
  const coinsDiscount = useCoins ? order.discounts.coins || 0 : 0;
  
  const vatPortion = useMemo(() => {
    const net = subtotal / 1.12;
    return Math.round(net * 0.12);
  }, [subtotal]);

  const total = useMemo(
    () => subtotal + deliveryFee - voucherDiscount - deliveryFeeDiscount - coinsDiscount,
    [subtotal, deliveryFee, voucherDiscount, deliveryFeeDiscount, coinsDiscount]
  );

  // Fetch payment methods on mount
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
        setPaymentMethods(['Card', 'Gcash', 'Maya', 'GrabPay']);
      } finally {
        setIsLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Fetch vouchers on mount
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const voucherData = await getVouchers();
        setVouchers(voucherData);
      } catch (error) {
        console.error('Failed to load vouchers:', error);
        setVouchers([
          { id: 1, name: 'SAVE20', minSpend: 15.00, hoursLeft: 48, isUsed: false, discountAmount: 20.00 },
          { id: 2, name: 'FREESHIP', minSpend: 50.00, hoursLeft: 72, isUsed: false, discountAmount: 30.00 },
        ]);
      }
    };

    fetchVouchers();
  }, []);

  const handleUseVoucher = async (voucher) => {
    if (!voucher || !voucher.id) {
      alert('Invalid voucher selected');
      return;
    }
    
    try {
      const result = await applyVoucher(voucher.id, subtotal);
      setAppliedVoucher(voucher);
      setShowVoucherModal(false);
      alert(result?.message || `Voucher "${voucher.name || voucher.Name || 'Unknown'}" applied!`);
    } catch (error) {
      console.error('Failed to apply voucher:', error);
      alert(error.message || 'Failed to apply voucher');
    }
  };

  const handleRedeemVoucher = async (code) => {
    try {
      const voucher = await redeemVoucher(code);
      if (voucher) {
        setVouchers(prev => [...prev, voucher]);
        alert(`Voucher "${voucher.name || voucher.Name || 'Unknown'}" redeemed successfully!`);
      }
    } catch (error) {
      console.error('Failed to redeem voucher:', error);
      alert(error.message || 'Failed to redeem voucher');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      
      const paymentRequest = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        amount: Number(total.toFixed(2)),
        currency: 'PHP',
        description: 'Coffee Shop Order',
        paymentMethod: selectedPaymentMethod,
      };

      const checkoutUrl = await createPaymentCheckout(paymentRequest);
      
      setOrderResult({
        orderNumber: orderNumber,
        checkoutUrl: checkoutUrl
      });
      
      setShowOrderPlacedPopup(true);
      redirectToCheckout(checkoutUrl);
    } catch (error) {
      console.error('Payment error:', error);
      setShowOrderFailedPopup(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container py-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="back-btn" onClick={() => window.history.back()}>←</button>
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

            {/* Vouchers Card */}
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
            {/* Order Summary */}
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

            {/* Order Totals */}
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
        <MyVouchersModal 
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

      {/* Voucher History */}
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
        initialMethod={selectedPaymentMethod}
        onConfirm={(paymentData) => {
          let apiMethod = paymentData.method;
          if (paymentData.method === 'kapebara') apiMethod = 'card';
          setSelectedPaymentMethod(apiMethod);
          setShowPaymentMethodPopup(false);
        }}
      />

      {/* Order Placed Popup */}
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

      {/* Order Failed Popup */}
      <OrderFailedPopup
        show={showOrderFailedPopup}
        onClose={() => setShowOrderFailedPopup(false)}
        onBackToMenu={() => setShowOrderFailedPopup(false)}
      />
    </div>
  );
}

export default CheckoutPage;
