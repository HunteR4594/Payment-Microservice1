import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './TopUpRecentActivity.css';

const TopUpRecentActivity = () => {
  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="topup-activity-page">
      {/* Header */}
      <div className="activity-header">
        <button className="back-btn" onClick={handleBackClick}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <div className="logo-container">
          
          <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo" />
        </div>
      </div>

      {/* Current Balance Card */}
      <div className="balance-card">
        <div className="balance-icon">
          <i className="bi bi-receipt"></i>
        </div>
        <div className="balance-info">
          <div className="balance-label">Top-up</div>
          <div className="balance-amount">+ ₱ 0.00</div>
          <div className="balance-source">[date], [time]</div>
          <div className="balance-source">[source/mop]</div>
        </div>
      </div>


    </div>
  );
};

export default TopUpRecentActivity;