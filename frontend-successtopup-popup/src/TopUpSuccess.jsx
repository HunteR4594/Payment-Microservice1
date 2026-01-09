import "./TopUpSuccess.css";

function TopUpSuccess() {
  return (
    <div className="popup-wrapper">
      <div className="popup-card">
        <h1 className="popup-title">
          <i className="bi bi-check-circle"></i> You’re all topped up!
        </h1>

        <div className="popup-details">
          <div className="detail-row">
            <span>Top-up amount</span>
            <span>₱[Amount].00</span>
          </div>

          <div className="detail-row">
            <span>Paid with</span>
            <span>[MOP]</span>
          </div>

          <div className="detail-row">
            <span>Latest Balance</span>
            <span>₱[Amount].00</span>
          </div>
        </div>

        <button className="popup-button">Done</button>
      </div>
    </div>
  );
}

export default TopUpSuccess;
