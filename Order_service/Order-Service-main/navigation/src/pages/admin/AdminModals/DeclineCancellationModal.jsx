import { useState } from "react";
import "./AdminModals.css";

function DeclineCancellationModal({
    onClose,
    onConfirm,
    onBack,
    orderId
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // YOUR ACTUAL ENDPOINT from OrdersController!
            const response = await fetch(`https://localhost:7237/api/Orders/admin/review-cancellation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    OrderId: orderId,
                    Approve: false // this tells backend to DECLINE
                })
            });

            if (!response.ok) {
                throw new Error('failed to decline cancellation, api said no');
            }

            const result = await response.json();
            console.log('decline success:', result);

            // success! call the parent callback
            if (onConfirm) {
                onConfirm();
            }

            onClose();
        } catch (err) {
            setError(err.message || 'something went wrong bestie');
            console.error('error declining cancellation:', err);
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
                            Are you sure you want to decline the cancellation?
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
                        {isLoading ? 'processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeclineCancellationModal;