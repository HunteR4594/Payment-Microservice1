import { useState } from "react";
import "../App.css";

function UpdateOrderStatusModal({ 
  onClose, 
  orderData, // Accept orderData as prop
  onUpdateStatus, // Callback when status is updated
  initialStatus // Initial status from orderData
}) {
  // Default mock data for testing (remove in production)
  const defaultOrderData = {
    orderId: "123-456-789",
    orderDate: "2025-10-13",
    customerName: "Bruno Decano"
  };

  const data = orderData || defaultOrderData;
  const [status, setStatus] = useState(initialStatus || data.orderStatus || "Preparing");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(data.orderId, status);
      } else {
        // Fallback: API call if onUpdateStatus not provided
        const response = await fetch(`http://localhost:8080/api/orders/${data.orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status })
        });

        if (!response.ok) {
          throw new Error('Failed to update order status');
        }
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
            <h2 className="modal-title">Update Order Status</h2>
            <p className="modal-sub">
              Manage and confirm order status updates.
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

        {/* CUSTOMER */}
        <div className="info-item full">
          <label className="label">Customer Name</label>
          <div className="info-box">
            {data.customerName}
          </div>
        </div>

        {/* STATUS */}
        <div className="form-group">
          <label className="label">Order Status</label>
          <select
            className="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Preparing</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ 
            color: '#d32f2f', 
            fontSize: '14px', 
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* ACTION */}
        <div className="btn-wrapper">
          <button 
            className="primary-btn" 
            onClick={handleUpdateStatus}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default UpdateOrderStatusModal;
