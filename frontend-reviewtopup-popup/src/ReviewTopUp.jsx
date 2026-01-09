import "./ReviewTopUp.css";

export default function ReviewTopUp() {
  return (
    <div className="overlay">
      <div className="popup">
        {/* HEADER */}
        <div className="header">
          <button className="back-btn"> <i className="bi bi-arrow-left"></i></button>

          <h2>Review and Confirm</h2>
        </div>

        {/* CONTENT */}
        <div className="content">
          <p className="label">Top-up amount</p>
          <h1 className="amount">₱ [Amount].00</h1>
          <p className="mop">Pay with [MOP]</p>
        </div>

        {/* BUTTON */}
        <button className="confirm-btn">Confirm Top-up</button>
      </div>
    </div>
  );
}
