import { useState, useMemo } from "react";
import "./AdminModals.css";

function UpdateOrderStatusModal({
    onClose,
    orderData,
    onUpdateStatus,
    initialStatus,
    allowUpdate = true // new prop: whether updates are allowed for this order
}) {
    const defaultOrderData = {
        orderId: "unknown",
        orderDate: "unknown",
        customerName: "Guest User",
        cancelReason: null,
        cancelNotes: null
    };

    const data = orderData || defaultOrderData;
    const rawStatus = String(initialStatus || data.orderStatus || "").trim();

    // Normalize backend status strings to the UI labels so the select can show the actual current status.
    const mapToDisplay = (s) => {
        if (!s) return "Preparing";
        let txt = String(s).trim();
        txt = txt.replace(/^["']|["']$/g, "");                // remove quotes
        txt = txt.replace(/[_\-]/g, " ");                     // underscores/hyphens -> spaces
        txt = txt.replace(/([a-z])([A-Z])/g, "$1 $2");        // camelCase -> spaced
        txt = txt.replace(/\s+/g, " ").trim();               // normalize spacing
        const lower = txt.toLowerCase();

        if (lower.includes("ready") && lower.includes("pickup")) return "Ready for Pickup";
        if (lower === "readyforpickup") return "Ready for Pickup";
        if (lower.includes("cancel")) return "Cancelled";
        if (lower.includes("deliver")) return "Delivered";
        if (lower.includes("completed")) return "Completed";
        if (lower.includes("prepar")) return "Preparing";
        if (lower.includes("in") && lower.includes("transit")) return "In Transit";

        // Fallback: Title Case
        return txt.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    };

    const currentStatus = mapToDisplay(rawStatus);

    const allowedOptions = useMemo(() => {
        const normalized = currentStatus;
        if (normalized === "Ready for Pickup") {
            return ["Ready for Pickup", "Cancelled"];
        }
        if (normalized === "Cancelled" || normalized === "Cancel") {
            return ["Cancelled"];
        }
        return ["Preparing", "Ready for Pickup", "Cancelled"];
    }, [currentStatus]);

    // initialize select to the normalized current status when possible
    const [status, setStatus] = useState(() => {
        return allowedOptions.includes(currentStatus) ? currentStatus : allowedOptions[0];
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpdateStatus = async () => {
        if (!allowUpdate) {
            setError("Updates are disabled for cancelled orders.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await onUpdateStatus(data.orderId, status);
            onClose();
        } catch (err) {
            setError(err.message || 'failed to update status');
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

                {/* CUSTOMER NAME */}
                <div className="info-item full">
                    <label className="label">Customer Name</label>
                    <div className="info-box">
                        {data.customerName || "Guest User"}
                    </div>
                </div>

                {/* If cancel reason exists show it */}
                {data.cancelReason && (
                    <div className="info-item full">
                        <label className="label">Cancel Reason</label>
                        <div className="info-box">
                            {data.cancelReason}
                        </div>
                    </div>
                )}

                {/* STATUS */}
                <div className="form-group">
                    <label className="label">Order Status</label>
                    <select
                        className="status-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={!allowUpdate} // disable when updates are not allowed
                    >
                        {allowedOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    {!allowUpdate && (
                        <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                            This order is cancelled. Updating status is disabled.
                        </div>
                    )}
                    {currentStatus === "Ready for Pickup" && allowUpdate && (
                        <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                            Downgrading from "Ready for Pickup" to "Preparing" is not allowed.
                        </div>
                    )}
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
                        disabled={!allowUpdate || isLoading || (allowedOptions.length === 1 && allowedOptions[0] === status)}
                    >
                        {isLoading ? 'Updating...' : 'Update Status'}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default UpdateOrderStatusModal;
