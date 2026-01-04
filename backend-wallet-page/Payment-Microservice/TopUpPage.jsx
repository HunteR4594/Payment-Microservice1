import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./topUp.css";

const SUGGESTIONS = [200, 500, 1000];

const TopUpPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(parseFloat(localStorage.getItem("walletBalance") || "0"));
  const [rawBalance, setRawBalance] = useState(localStorage.getItem("walletBalance") || null);
  const [lastRead, setLastRead] = useState(null);
  const [payMethod, setPayMethod] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  
  const clearForm = (shouldClearCardInfo = false) => {
    console.log("[TopUpPage] Clearing form fields - clearCardInfo:", shouldClearCardInfo);
    setAmount("");
    setPayMethod("");
    
    if (shouldClearCardInfo) {
      console.log("[TopUpPage] Clearing card information");
      setCardNumber("");
      setExpiryDate("");
      setCvc("");
      setCardholderName("");
      setSaveCard(false);
      localStorage.removeItem("savedCardInfo");
    }
    
    setInlineError("");
  };
  
  React.useEffect(() => {
    const saved = localStorage.getItem("savedCardInfo");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        setCardNumber(obj.cardNumber || "");
        setExpiryDate(obj.expiryDate || "");
        setCvc(obj.cvc || "");
        setCardholderName(obj.cardholderName || "");
        setSaveCard(true);
      } catch {}
    }
    setAmount("");
    setPayMethod("");
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setInlineError("");
  }, []);

  const handleSuggestion = (val) => {
    setAmount(String(val));
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handlePayMethod = (e) => {
    setPayMethod(e.target.value);
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(e.target.value);
    if (saveCard) {
      localStorage.setItem("savedCardInfo", JSON.stringify({
        cardNumber: e.target.value,
        expiryDate,
        cvc,
        cardholderName
      }));
    }
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length <= 4) {
      if (value.length >= 2) {
        formatted = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    }
    setExpiryDate(formatted);
    if (saveCard) {
      localStorage.setItem("savedCardInfo", JSON.stringify({
        cardNumber,
        expiryDate: formatted,
        cvc,
        cardholderName
      }));
    }
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(value);
    if (saveCard) {
      localStorage.setItem("savedCardInfo", JSON.stringify({
        cardNumber,
        expiryDate,
        cvc: value,
        cardholderName
      }));
    }
  };

  const handleCardholderChange = (e) => {
    setCardholderName(e.target.value);
    if (saveCard) {
      localStorage.setItem("savedCardInfo", JSON.stringify({
        cardNumber,
        expiryDate,
        cvc,
        cardholderName: e.target.value
      }));
    }
  };
  const handleSaveCardChange = (e) => {
    setSaveCard(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem("savedCardInfo");
    } else {
      // Save current fields
      localStorage.setItem("savedCardInfo", JSON.stringify({
        cardNumber,
        expiryDate,
        cvc,
        cardholderName
      }));
    }
  };

  const refreshBalance = () => {
    const raw = localStorage.getItem("walletBalance");
    const parsed = parseFloat(raw || "0");
    console.log("[TopUpPage] refreshBalance called - balance:", parsed);
    setRawBalance(raw);
    setBalance(parsed);
    setLastRead(Date.now());
  };

  React.useEffect(() => {
    console.log("[TopUpPage] Component mounted");
    refreshBalance();
    const interval = setInterval(refreshBalance, 1000);
    function onWalletUpdated(event) {
      console.log("[TopUpPage] walletBalanceUpdated event received", event.detail);
      refreshBalance();
    }
    window.addEventListener('walletBalanceUpdated', onWalletUpdated);
    return () => {
      console.log("[TopUpPage] Component unmounting - cleaning up");
      clearInterval(interval);
      window.removeEventListener('walletBalanceUpdated', onWalletUpdated);
    };
  }, []);

  const amountNum = amount ? Number(amount) : 0;
  const canConfirm = amountNum >= 50 && payMethod;

  const handleConfirm = (e) => {
    e && e.preventDefault();
    
    if (amountNum <= 0) {
      setInlineError('Invalid amount. Please enter an amount greater than ₱0');
      return;
    }
    
    if (payMethod === "card") {
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      
      if (!cleanCardNumber || cleanCardNumber.length < 12 || cleanCardNumber.length > 19 || !/^\d+$/.test(cleanCardNumber)) {
        setInlineError('Invalid card number. Please enter 12-19 digits.');
        return;
      }
      
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryDate || !expiryRegex.test(expiryDate)) {
        setInlineError('Invalid expiration date. Use MM/YY format (e.g., 08/26).');
        return;
      }
      
      if (!cvc || cvc.length < 3 || cvc.length > 4 || !/^\d+$/.test(cvc)) {
        setInlineError('Invalid CVC. Please enter 3-4 digits.');
        return;
      }
      
      const trimmedName = cardholderName.trim();
      if (!trimmedName || trimmedName.length < 2) {
        setInlineError('Please enter the cardholder name.');
        return;
      }
    }
    
    setInlineError("");
    setShowConfirmModal(true);
  };

  const handleConfirmTopUp = () => {
    const newBalance = balance + Number(amount);
    console.log("[TopUpPage] handleConfirmTopUp - current balance:", balance, "amount:", amount, "new balance:", newBalance);
    
    localStorage.setItem("walletBalance", newBalance.toString());
    console.log("[TopUpPage] Balance saved to localStorage:", newBalance);
    
    try {
      const now = new Date();
      const dateStr = (now.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                      now.getDate().toString().padStart(2, '0') + '-' + 
                      now.getFullYear();
      
      const transaction = {
        id: Date.now(),
        type: "Top-up",
        date: dateStr,
        details: payMethod === 'gcash' ? 'GCash Top-up' : 'Credit Card Top-up',
        amount: `+ ₱ ${Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        timestamp: now.getTime()
      };
      
      const existingActivities = JSON.parse(localStorage.getItem("walletActivities") || "[]");
      
      const updatedActivities = [transaction, ...existingActivities];
      
      localStorage.setItem("walletActivities", JSON.stringify(updatedActivities));
      console.log("[TopUpPage] Transaction saved to localStorage:", transaction);
      console.log("[TopUpPage] All activities:", updatedActivities);
    } catch (err) {
      console.error("[TopUpPage] Error saving transaction:", err);
    }
    
    if (payMethod === "card") {
      if (saveCard) {
        localStorage.setItem("savedCardInfo", JSON.stringify({
          cardNumber,
          expiryDate,
          cvc,
          cardholderName
        }));
        console.log("[TopUpPage] Card info saved to localStorage");
      } else {
        localStorage.removeItem("savedCardInfo");
      }
    }
    
    try {
      console.log("[TopUpPage] Dispatching walletBalanceUpdated event with balance:", newBalance);
      window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { detail: newBalance }));
      
      console.log("[TopUpPage] Dispatching walletActivitiesUpdated event");
      window.dispatchEvent(new CustomEvent('walletActivitiesUpdated'));
    } catch (err) {
      console.error("[TopUpPage] Error dispatching event:", err);
    }
    
    setBalance(newBalance);
    setShowConfirmModal(false);
    
    clearForm(!saveCard);
    
    setShowSuccessModal(true);
    console.log("[TopUpPage] Form cleared (saveCard=" + saveCard + ") - Success modal shown - will auto-navigate in 2 seconds");
    
    setTimeout(() => {
      setShowSuccessModal(false);
      console.log("[TopUpPage] Navigating back to wallet page");
      navigate("/");
      setTimeout(() => {
        try {
          const currentBalance = localStorage.getItem('walletBalance');
          console.log("[TopUpPage] Dispatching final walletBalanceUpdated event:", currentBalance);
          window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { detail: currentBalance }));
          
          console.log("[TopUpPage] Dispatching final walletActivitiesUpdated event");
        console.log("[TopUpPage] Form fields cleared successfully");
        } catch (e) {
          console.error("[TopUpPage] Error dispatching final event:", e);
        }
      }, 200);
    }, 2000);
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    navigate("/");
    setTimeout(() => {
      try { window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { detail: localStorage.getItem('walletBalance') })); } catch (e) {}
    }, 200);
  };
      setBalance(newBalance);

  const closeModal = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="box">
      {!showSuccessModal && (
        <>
          <Link to="/" className="btn btn-link text-decoration-none mb-3 p-0" style={{ fontSize: '16px', fontWeight: '500' }}>
            <ion-icon name="arrow-back-outline" className="me-1"></ion-icon> Back
          </Link>

          <div className="card mb-3 p-3 section">
        <h5>Step 1. Top up amount</h5>
        <div className="brand mb-2">
          <span className="brand-text">Foodpanda Pay</span>
        </div>
        <p className="balance text-muted mb-2" style={{ fontSize: '16px', fontWeight: '500' }}>
          Current Balance: <span style={{ color: '#28a745', fontWeight: 'bold' }}>₱ {balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </p>
        <div className="small text-muted">Your current wallet balance is shown above.</div>

        <div className="d-flex gap-2 mb-2">
          {SUGGESTIONS.map((val) => (
            <button
              key={val}
              className="btn btn-outline-secondary flex-fill"
              type="button"
              onClick={() => handleSuggestion(val)}
            >
              ₱ {val.toLocaleString()}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="form-control mb-1"
          placeholder="₱ Enter amount"
          value={amount}
          onChange={handleAmountChange}
        />
        <small className="text-muted">Enter an amount from ₱ 50.00</small>
      </div>

      <div className="card mb-3 p-3 section">
        <h5>Step 2. Payment method</h5>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name="paymethod"
            id="gcash"
            value="gcash"
            checked={payMethod === "gcash"}
            onChange={handlePayMethod}
          />
          <label className="form-check-label d-flex align-items-center p-2 border rounded" htmlFor="gcash" onClick={() => setPayMethod('gcash')}>
            <ion-icon name="wallet-outline" className="me-2 fs-3"></ion-icon>
            GCash (Alipay+ Partner)
          </label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name="paymethod"
            id="card"
            value="card"
            checked={payMethod === "card"}
            onChange={handlePayMethod}
          />
          <label className="form-check-label p-2 border rounded w-100" htmlFor="card" onClick={() => setPayMethod('card')}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <ion-icon name="card-outline" className="fs-3"></ion-icon>
              <span className="fw-bold">Credit Card</span>
              <ion-icon name="logo-visa" className="fs-3 ms-3"></ion-icon>
              <ion-icon name="logo-mastercard" className="fs-3"></ion-icon>
            </div>

            <input 
              className="form-control mb-2" 
              placeholder="Card number" 
              disabled={payMethod !== "card"}
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength="19"
            />
            <div className="d-flex gap-2 mb-2">
              <input 
                className="form-control" 
                placeholder="MM/YY" 
                disabled={payMethod !== "card"}
                value={expiryDate}
                onChange={handleExpiryChange}
                maxLength="5"
              />
              <input 
                className="form-control" 
                placeholder="CVC" 
                disabled={payMethod !== "card"}
                value={cvc}
                onChange={handleCvcChange}
                maxLength="4"
              />
            </div>
            <input 
              className="form-control mb-2" 
              placeholder="Name of the card holder" 
              disabled={payMethod !== "card"}
              value={cardholderName}
              onChange={handleCardholderChange}
            />
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="saveCard"
                checked={saveCard}
                onChange={handleSaveCardChange}
                disabled={payMethod !== "card"}
              />
              <label className="form-check-label" htmlFor="saveCard">
                Save this card for a faster checkout next time
              </label>
            </div>
          </label>
        </div>
      </div>

      <div style={{marginTop: '1.5rem'}}>
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleConfirm}
          style={{padding: '10px', fontSize: '16px', cursor: 'pointer'}}
        >
          Confirm Top-up
        </button>
        {inlineError && (
          <div className="text-danger small mt-2" style={{textAlign: 'center', fontSize: '14px'}}>{inlineError}</div>
        )}
      </div>
        </>
      )}

      {showConfirmModal && (
        <div className="activity-modal-overlay" onClick={closeModal}>
          <div className="activity-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 340}}>
            <div className="modal-body text-center p-4">
              <div className="text-muted mb-1" style={{fontSize: 13, letterSpacing: 1}}>TOP-UP AMOUNT</div>
              <div style={{fontSize: 32, fontWeight: 700, margin: '8px 0'}}>₱{Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className="text-muted mb-3" style={{fontSize: 13}}>{payMethod === 'gcash' ? 'PAY WITH GCASH' : 'PAY WITH DEBIT / CREDIT'}</div>
              <button className="btn btn-primary w-100" onClick={handleConfirmTopUp}>CONFIRM TOP-UP</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="activity-modal-overlay" onClick={handleDone}>
          <div className="activity-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 360}}>
            <div className="modal-body p-4">
              <div style={{fontSize: 18, fontWeight: 700, marginBottom: 24, textAlign: 'center'}}>
                You're All topped-up!
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14}}>
                <span className="text-muted">Top up amount</span>
                <span style={{fontWeight: 600}}>₱{Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14}}>
                <span className="text-muted">Paid with</span>
                <span style={{fontWeight: 600}}>{payMethod === 'gcash' ? 'GCash' : 'Debit / Credit'}</span>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontSize: 14}}>
                <span className="text-muted">Latest balance</span>
                <span style={{fontWeight: 600}}>₱{(parseFloat(localStorage.getItem("walletBalance") || "0")).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>

              <button className="btn btn-primary w-100" onClick={handleDone}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpPage;
