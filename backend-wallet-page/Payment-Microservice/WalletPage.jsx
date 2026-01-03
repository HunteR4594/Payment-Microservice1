import React, { useState } from "react";
import { Link } from "react-router-dom"; // for navigation
import "../style.css";

const WalletPage = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Initialize localStorage with default balance if not present
  React.useEffect(() => {
    if (!localStorage.getItem("walletBalance")) {
      localStorage.setItem("walletBalance", "0");
      console.log("[WalletPage] Initialized walletBalance to 0");
    }
  }, []);
  
  const [balance, setBalance] = useState(parseFloat(localStorage.getItem("walletBalance") || "0"));
  const [rawBalance, setRawBalance] = useState(localStorage.getItem("walletBalance") || null);
  const [lastRead, setLastRead] = useState(null);

  // Update balance when localStorage changes (e.g., after top-up)
  // Helper to refresh balance (callable from UI)
  const refreshBalance = () => {
    const raw = localStorage.getItem("walletBalance");
    const parsed = parseFloat(raw || "0");
    console.log("[WalletPage] refreshBalance called - new balance:", parsed, "raw:", raw);
    setRawBalance(raw);
    setBalance(parsed);
    setLastRead(Date.now());
  };
  
  // Manual refresh with visual feedback
  const handleManualRefresh = () => {
    console.log("[WalletPage] Manual refresh clicked");
    setIsRefreshing(true);
    refreshBalance();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  React.useEffect(() => {
    function updateBalance() {
      refreshBalance();
    }
    
    console.log("[WalletPage] Component mounted - setting up listeners");
    
    // Listen for storage events (cross-tab updates)
    window.addEventListener("storage", () => {
      console.log("[WalletPage] Storage event detected");
      updateBalance();
    });
    
    // Initial balance load
    updateBalance();
    
    // Poll every second for changes
    const interval = setInterval(() => {
      console.log("[WalletPage] Polling for balance changes...");
      updateBalance();
    }, 1000);
    
    // Also update when page becomes visible (user navigates back)
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        console.log("[WalletPage] Page became visible - refreshing balance");
        updateBalance();
      }
    };
    
    // Listen for custom in-tab event when balance is updated
    function onWalletUpdated(event) {
      console.log("[WalletPage] walletBalanceUpdated event received", event.detail);
      updateBalance();
    }
    
    window.addEventListener('walletBalanceUpdated', onWalletUpdated);
    document.addEventListener("visibilitychange", onVisibility);
    
    return () => {
      console.log("[WalletPage] Component unmounting - cleaning up listeners");
      window.removeEventListener("storage", updateBalance);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener('walletBalanceUpdated', onWalletUpdated);
      clearInterval(interval);
    };
  }, []);

  // Load activities from localStorage
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem("walletActivities");
      const loaded = saved ? JSON.parse(saved) : [];
      console.log("[WalletPage] Initialized activities from localStorage:", loaded);
      return loaded;
    } catch (err) {
      console.error("[WalletPage] Error loading activities:", err);
      return [];
    }
  });

  // Refresh activities from localStorage
  const refreshActivities = () => {
    try {
      const saved = localStorage.getItem("walletActivities");
      const loaded = saved ? JSON.parse(saved) : [];
      console.log("[WalletPage] Refreshing activities from localStorage:", loaded);
      setActivities(loaded);
    } catch (err) {
      console.error("[WalletPage] Error refreshing activities:", err);
    }
  };

  // Listen for activities updates
  React.useEffect(() => {
    function onActivitiesUpdated() {
      console.log("[WalletPage] walletActivitiesUpdated event received");
      refreshActivities();
    }
    
    window.addEventListener('walletActivitiesUpdated', onActivitiesUpdated);
    
    return () => {
      window.removeEventListener('walletActivitiesUpdated', onActivitiesUpdated);
    };
  }, []);

  const openActivity = (activity) => {
    setSelectedActivity(activity);
  };

  const closeActivity = () => setSelectedActivity(null);

  return (
    <>
      {/* FULL-WIDTH PAGE HEADER */}
      <div className="page-header d-flex align-items-center">
        <span className="back-arrow me-2">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </span>
        <h2 className="header-title mb-0">KapeBara</h2>
      </div>

      {/* MAIN CONTAINER */}
      <div className="container-xl">
        <div className="row g-4">

          {/* LEFT COLUMN */}
          <div className="col-12 col-lg-4">

            {/* Wallet Card */}
            <div className="balance-card shadow-sm">
              <div className="balance-header">
                <div className="logo d-flex align-items-center">
                  <span className="logo-text">KapeBara Wallet</span>
                </div>
              </div>
              <div className="balance-label">Available balance</div>
              <div className="balance-amount">₱ {balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className="wallet-coins">{balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} KapeBara Coins</div>
              <div className="small text-muted mt-2">
                <div className="text-muted small">Updated balance displayed above.</div>
              </div>
              <a href="#" className="view-history">View coin history</a>
            </div>

            {/* Top Up Button */}
            <Link
              to="/topup"
              className="top-up-btn d-flex align-items-center justify-content-center"
            >
              <span className="wallet-icon">
                <ion-icon name="wallet-outline"></ion-icon>
              </span>
              <span className="top-up-text">Top up</span>
            </Link>
            
            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className="refresh-btn d-flex align-items-center justify-content-center mt-2"
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: isRefreshing ? '#f0f0f0' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: isRefreshing ? 0.7 : 1,
              }}
              disabled={isRefreshing}
            >
              <span style={{ marginRight: '8px' }}>
                <ion-icon name="refresh-outline" style={{
                  transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                  transition: 'transform 0.6s ease',
                  display: 'inline-block',
                }}></ion-icon>
              </span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Balance'}</span>
            </button>

          </div>

          {/* RIGHT COLUMN */}
          <div className="col-12 col-lg-8">

            {/* Recent Activities */}
            <div className="activities-section shadow-sm mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="section-title d-flex gap-2 align-items-center">
                  <span className="icon">
                    <ion-icon name="time-outline"></ion-icon>
                  </span>
                  <span>Recent Wallet Activities</span>
                </div>
                <a href="#" className="view-all-link">View all</a>
              </div>

              {/* Render activity items from data and make them clickable */}
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="activity-item d-flex"
                  role="button"
                  onClick={() => openActivity(act)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="activity-icon">
                    <ion-icon name={act.type === "Top-up" ? "reload-outline" : "document-text-outline"}></ion-icon>
                  </div>
                  <div className="activity-info flex-grow-1">
                    <div className="activity-header d-flex justify-content-between">
                      <span className="activity-type">{act.type}</span>
                      <span className="activity-date">{act.date}</span>
                    </div>
                    <div className="activity-details">{act.details}</div>
                  </div>
                  <div className="activity-right text-end">
                    <span className={`activity-amount ${act.amount.startsWith("+") ? "positive" : "negative"}`}>{act.amount}</span>
                    <span className="arrow"><ion-icon name="chevron-forward-outline"></ion-icon></span>
                  </div>
                </div>
              ))}

              {/* Simple modal / overlay to show details (placeholder/error for now) */}
              {selectedActivity && (
                <div className="activity-modal-overlay" onClick={closeActivity}>
                  <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{selectedActivity.type} Details</h5>
                      <button className="btn-close" onClick={closeActivity} aria-label="Close"></button>
                    </div>
                    <div className="modal-body mt-3">
                      {selectedActivity.type === "Order" ? (
                        <div>
                          <div><strong>Order date:</strong> {selectedActivity.date}</div>
                          <div><strong>Order location:</strong> {selectedActivity.details}</div>
                          <div><strong>Amount:</strong> {selectedActivity.amount}</div>
                        </div>
                      ) : (
                        <div>
                          <div><strong>Top-up date:</strong> {selectedActivity.date}</div>
                          <div><strong>MOP / Source:</strong> {selectedActivity.details}</div>
                          <div><strong>Amount:</strong> {selectedActivity.amount}</div>
                        </div>
                      )}

                      <div className="mt-3 text-danger"><strong>Error:</strong> Details page not available yet.</div>
                    </div>
                    <div className="modal-footer mt-3 text-end">
                      <button className="btn btn-secondary" onClick={closeActivity}>Close</button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default WalletPage;
