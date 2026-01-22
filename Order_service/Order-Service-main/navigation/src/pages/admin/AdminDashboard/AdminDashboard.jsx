import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Card, Row, Col, ButtonGroup, ToggleButton, Button, Modal, Form } from "react-bootstrap";
import "./AdminDashboard.css";
import classic_matchabara_cold_brew_Pic from "./classic matchabara cold brew.png";
import classic_macchiabara_cold_brew_Pic from "./classic macchiabara cold brew.png";
import classic_coffeebara_cold_brew_Pic from "./classic coffeebara cold brew.png";
import kapebara_logo_transparent_Pic from "./kapebara logo transparent.png";
import kapebara_cart_Pic from "./kapebara cart.jpg";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import UpdateOrderStatusModal from "../AdminModals/UpdateOrderStatusModal";

const API_BASE_URL = "https://localhost:7237/api/Orders";

function App() {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("All");
    const [sortBy, setSortBy] = useState("recent");
    const [modalShow, setModalShow] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalMode, setModalMode] = useState("update");
    const [newStatus, setNewStatus] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false); 
    const [isOrderReadOnly, setIsOrderReadOnly] = useState(false); // whether update should be disabled for the selected order

    // --- HELPER FUNCTIONS ---
    const fetchWithRetry = async (url, options = {}, retries = 5, backoff = 1000) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (err) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw err;
        }
    };

    const formatOrderDate = (dateString) => {
        // New format: "Jan 12, 2026 - 5:14 PM"
        if (!dateString) return "No date";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "Invalid date";

            // Date part: "Jan 12, 2026"
            const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Time part: 12-hour with minutes and AM/PM
            let hours = d.getHours();
            const minutes = d.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            if (hours === 0) hours = 12;

            return `${datePart} - ${hours}:${minutes} ${ampm}`;
        } catch (e) {
            console.error("Error", e);
            return "error";
        }
    };

    // Format status strings for UI (insert spaces for ReadyForPickup / InTransit, normalize casing)
    const formatStatusLabel = (raw) => {
        if (!raw && raw !== 0) return "";
        let s = String(raw).trim();

        // Remove surrounding quotes if any
        s = s.replace(/^["']|["']$/g, "");

        // Convert snake/kebab to spaces
        s = s.replace(/[_\-]/g, " ");

        // Insert spaces between camel/pascal case boundaries: ReadyForPickup -> Ready For Pickup
        s = s.replace(/([a-z])([A-Z])/g, "$1 $2");

        // Normalize multiple spaces
        s = s.replace(/\s+/g, " ").trim();

        const lower = s.toLowerCase();

        // Specific friendly mappings
        if (lower === "readyforpickup" || (lower.includes("ready") && lower.includes("pickup"))) return "Ready for Pickup";
        if (lower === "intransit" || (lower.includes("in") && lower.includes("transit"))) return "In Transit";
        if (lower.includes("cancel")) return "Cancelled";
        if (lower.includes("deliver")) return "Delivered";
        if (lower.includes("completed")) return "Completed";
        if (lower.includes("prepar")) return "Preparing";

        // Fallback: Title-case each word but keep 'for' lowercase
        const words = s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        // preserve small word "for" as lowercase
        return words.map(w => (w.toLowerCase() === "for" ? "for" : w)).join(" ");
    };

    // --- THE LIVE LOAD FUNCTION ---
    const loadOrders = async () => {
        try {
            let filterParam = activeTab.toLowerCase();
            if (filterParam === "canceled") filterParam = "cancelled";
            const sortParam = sortBy === "recent" ? "newest" : "oldest";

            const data = await fetchWithRetry(`${API_BASE_URL}/admin/history?filter=${filterParam}&sortOrder=${sortParam}`);

            if (Array.isArray(data)) {
                const mappedOrders = data.map(o => {
                    let displayStatus = "Ongoing";
                    if (o.statusName === "Cancelled" || o.statusName === "Failed") {
                        displayStatus = "Canceled";
                    } else if (o.statusName === "Delivered" || o.statusName === "Completed") {
                        displayStatus = "Completed";
                    }

                    return {
                        id: o.orders_id,
                        name: `Order ${o.orders_id}`,
                        status: displayStatus,
                        progress: o.statusName, 
                        items: o.item_count,
                        date: formatOrderDate(o.placed_at),
                        price: o.total_cost,
                        cancelReason: o.cancellation_reason,
                        cancelNotes: o.cancellation_requested ? "Drama Pending 🚩" : "N/A",
                        image: classic_coffeebara_cold_brew_Pic,
                        rawStatusValue: o.statusValue,
                        cancellationRequested: o.cancellation_requested,
                        customerName: "Guest User"
                    };
                });
                setOrders(mappedOrders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [activeTab, sortBy]);

    const tabs = ["All", "Ongoing", "Completed", "Canceled"];

    const filteredOrders = orders;

    const openModal = (order) => {
        setSelectedOrder(order);

        // Always open the modal. If order is cancelled, show modal but make it read-only.
        const isCancelled = order.status === "Canceled" || order.cancellationRequested;
        setIsOrderReadOnly(isCancelled);

        // keep modalMode for backward compatibility but we will always show the details modal
        setModalMode(isCancelled ? "cancel" : "update");

        setShowUpdateModal(true);
        setNewStatus(order.status);
    };

    const handleUpdateStatusAction = async (orderId, newStatusName) => {
        const statusMap = {
            "Preparing": 2,
            "Ready for Pickup": 3,
            "In Transit": 4,
            "Delivered": 5,
            "Completed": 6,
            "Cancel": 7,
            "Cancelled": 7
        };

        const payload = {
            orderId: orderId,
            newStatus: statusMap[newStatusName] || 1,
            userRole: "admin"
        };

        const url = `${API_BASE_URL}/status`;

        try {
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const text = await res.text().catch(() => '');
                if (text) {
                    try { JSON.parse(text); } catch { /* non-json body is fine */ }
                }
                await loadOrders();
                return;
            }

            const errText = await res.text().catch(() => '');
            throw new Error("Status can't go backwards.");
        } catch (err) {
            console.error("Error updating order status:", err);
            throw err;
        }
    };

    const handleApproveCancel = () => {
        setModalShow(false);
        loadOrders();
    };

    const handleRejectCancel = () => {
        setModalShow(false);
        loadOrders();
    };


    return (
        <>
            {/* Navbar */}
            <Navbar expand="lg" className="navbar" fixed="top">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img src={kapebara_logo_transparent_Pic} height="30" className="d-inline-block align-text-top" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="center-nav" />
                    <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
                        <Nav className="ms-auto gap-4 align-items-center">
                            <Nav.Link as={Link} to="/order/order">Home</Nav.Link>
                            <Nav.Link as={Link} to="/admin/admincancellations">Menu</Nav.Link>
                            <Nav.Link as={Link} to="/order/orderhistory">My Orders</Nav.Link>
                            <Nav.Link as={Link} to="/admin/admindashboard">My Profile</Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="#cart"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsCartOpen(!isCartOpen);
                                }}
                            >
                                <img src={kapebara_cart_Pic} height="30" style={{ objectFit: "contain" }} />
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Card something */}
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
                <Card className="card-glossy" style={{ maxWidth: "800px", width: "100%", padding: "24px", height: "600px" }}>
                    {/* Header */}
                    <h1 className="fw-bold mb-1">Admin Order Dashboard</h1>
                    <p className="text-muted mb-4">Track and manage all orders effortlessly.</p>

                    {/* Filter + Sort */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <ButtonGroup>
                            {tabs.map((tab) => (
                                <ToggleButton key={tab} type="radio" checked={activeTab === tab} onClick={() => setActiveTab(tab)}
                                    className={`rounded-pill tab-compact me-2 custom-tab ${activeTab === tab ? "active" : ""
                                        }`}
                                >
                                    {tab}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </div>
                    {/* Sort by, left side) */}
                    <div className="sort-row mb-3">
                        <span className="sort-label">Sort by</span>
                        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="recent">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    {/* Order list */}
                    {filteredOrders.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No orders found.
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <Card key={order.id} className="mb-3 border-0 shadow-sm">
                                <Card.Body>
                                    <Row className="align-items-center">
                                        {/* Image */}
                                        <Col xs="auto">
                                            <img
                                                src={order.image}
                                                alt={order.name}
                                                width={55}
                                                style={{ borderRadius: "8px" }}
                                            />
                                        </Col>

                                        {/* Details */}
                                        <Col>
                                            <div className="fw-semibold">Order #{order.id}</div>
                                            <div
                                                className={`fw-semibold ${
                                                    order.status === "Ongoing"
                                                        ? "text-warning"
                                                        : order.status === "Completed"
                                                            ? "text-success"
                                                            : "text-danger"
                                                }`}
                                            >
                                                {formatStatusLabel(order.progress || order.status)}
                                            </div>

                                            <div className="text-muted small">
                                                {order.items} Item(s) · {order.date}
                                            </div>
                                        </Col>

                                        {/* View Details/Popup Button */}
                                        <Col xs="auto">
                                            <Button size="sm" variant="link" className="view-link" onClick={() => openModal(order)}>View Details</Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        )))
                    }
                </Card>
            </div>

            {/*MODALS*/}
            {showUpdateModal && selectedOrder && (
                <UpdateOrderStatusModal
                    onClose={() => setShowUpdateModal(false)}
                    orderData={{
                        orderId: selectedOrder.id,
                        // pass the already-formatted date string from the order list
                        orderDate: selectedOrder.date,
                        // map customer name (placeholder) from the order object
                        customerName: selectedOrder.customerName || "Guest User",
                        cancelReason: selectedOrder.cancelReason,
                        cancelNotes: selectedOrder.cancelNotes
                    }}
                    initialStatus={selectedOrder.progress}
                    onUpdateStatus={handleUpdateStatusAction}
                    allowUpdate={!isOrderReadOnly} // disable updates when the selected order is cancelled
                />
            )}
        </>
    );
}

export default App;