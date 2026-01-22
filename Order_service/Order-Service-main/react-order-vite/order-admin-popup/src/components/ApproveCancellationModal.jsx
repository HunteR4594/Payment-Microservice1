import { useState } from "react";
import "../App.css";

function ApproveCancellationModal({ 
  onClose, 
  onConfirm, 
  onBack,
  orderId, // Order ID for API call
  onApproveCancellation // API callback
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (onApproveCancellation && orderId) {
        // API call to approve cancellation
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to approve cancellation');
        }

        if (onConfirm) {
          onConfirm();
        }
      } else if (onConfirm) {
        // Use callback if provided
        await onConfirm();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve cancellation');
      console.error('Error approving cancellation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotYet = () => {
    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="order-status-modal">
        {/* CLOSE BUTTON */}
        <button className="close-btn-absolute" onClick={handleNotYet}>
          X
        </button>

        {/* HEADER */}
        <div className="modal-header" style={{ justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h2 className="modal-title" style={{ textAlign: 'center' }}>
              Are you sure you want to approve the cancellation?
            </h2>
          </div>
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
        <div className="btn-row">
          <button 
            className="not-yet-btn" 
            onClick={handleNotYet}
            disabled={isLoading}
          >
            Not yet
          </button>

          <button 
            className="yes-i-am-btn" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Yes, I am'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ApproveCancellationModal;

