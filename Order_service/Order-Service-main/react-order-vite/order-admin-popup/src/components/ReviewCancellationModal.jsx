import "../App.css";

function ReviewCancellationModal({ 
  onApprove, 
  onDecline, 
  onClose,
  orderData // Accept orderData as prop from parent
}) {
  // Default mock data for testing (remove in production)
  const defaultOrderData = {
    orderId: "123-456-789",
    orderDate: "2025-10-13",
    customerName: "Bruno Decano",
    orderStatus: "Looking for a Rider",
    cancellationDate: "2025-10-13",
    reason: "Looking for a Rider",
    customerNotes: "Looking for a Rider"
  };

  const data = orderData || defaultOrderData;

  return (
    <div className="modal-overlay">
      <div className="order-status-modal">
        {/* CLOSE BUTTON */}
        <button className="close-btn-absolute" onClick={onClose}>
          X
        </button>

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Review Order Cancellation Request</h2>
            <p className="modal-sub">
              Kindly review the customer's reason before taking any action.
            </p>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="info-grid">
          <div className="info-item">
            <label className="label">Order ID</label>
            <div className="info-box">
              {data.orderId}
            </div>
          </div>

          <div className="info-item">
            <label className="label">Order Date</label>
            <div className="info-box">
              {data.orderDate}
            </div>
          </div>
        </div>

        {/* CUSTOMER NAME */}
        <div className="info-item full">
          <label className="label">Customer Name</label>
          <div className="info-box">
            {data.customerName}
          </div>
        </div>

        {/* ORDER STATUS & CANCELLATION DATE GRID */}
        <div className="info-grid">
          <div className="info-item">
            <label className="label">Order Status</label>
            <div className="info-box">
              {data.orderStatus}
            </div>
          </div>

          <div className="info-item">
            <label className="label">Cancellation Date</label>
            <div className="info-box">
              {data.cancellationDate}
            </div>
          </div>
        </div>

        {/* REASON FOR CANCELLATION */}
        <div className="info-item full">
          <label className="label">Reason for Cancellation</label>
          <div className="info-box">
            {data.reason}
          </div>
        </div>

        {/* CUSTOMER NOTES */}
        <div className="info-item full">
          <label className="label">Customer Notes</label>
          <div className="info-box">
            {data.customerNotes}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="btn-row">
          <button className="keep-order-btn" onClick={onDecline}>
            Keep Order
          </button>

          <button className="cancel-order-btn" onClick={onApprove}>
            Cancel Order
          </button>
        </div>

      </div>
    </div>
  );
}

export default ReviewCancellationModal;