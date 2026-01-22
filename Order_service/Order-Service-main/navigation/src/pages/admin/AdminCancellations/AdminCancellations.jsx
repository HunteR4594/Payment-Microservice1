import React, { useState, useEffect } from "react";
import {
    Navbar,
    Container,
    Nav,
    Card,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
    Badge
} from "react-bootstrap";
import "./AdminCancellations.css";
import classic_matchabara_cold_brew_Pic from "./classic matchabara cold brew.png";
import classic_macchiabara_cold_brew_Pic from "./classic macchiabara cold brew.png";
import classic_coffeebara_cold_brew_Pic from "./classic coffeebara cold brew.png";
import kapebara_logo_transparent_Pic from "./kapebara logo transparent.png";
import kapebara_cart_Pic from "./kapebara cart.jpg";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import ReviewCancellationModal from "../AdminModals/ReviewCancellationModal";


function App() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [sortBy, setSortBy] = useState("recent");

    // the date formatter you requested: "Jan 16, 2026 - 10:37 AM"
    const formatOrderDate = (dateString) => {
        if (!dateString) return "no date, sis";

        try {
            // we handle the date string like a pro
            const d = new Date(dateString);

            // if the date is being a diva (invalid)
            if (isNaN(d.getTime())) {
                // sometimes SQL dates need a little nudge (replacing space with T)
                const retryDate = new Date(String(dateString).replace(' ', 'T'));
                if (isNaN(retryDate.getTime())) return "invalid date";
                return formatFinal(retryDate);
            }

            return formatFinal(d);
        } catch (e) {
            console.error("date error:", e);
            return "error";
        }
    };

    // helper to keep the logic clean like a fresh ariana high note
    const formatFinal = (d) => {
        // "Jan 16, 2026"
        const datePart = d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // "10:37 AM"
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;

        return `${datePart} - ${hours}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://localhost:7237/api/General/orders`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setOrders([]);
                        return;
                    }
                    throw new Error("api is not responding, it's in its silent era.");
                }

                const data = await response.json();
                const rawData = Array.isArray(data) ? data : [];

                const mappedOrders = rawData
                    .filter(order => order.cancellation_requested == 1 || order.cancellation_requested === true)
                    .map(order => {
                        let statusLabel = "Unknown";
                        let colorClass = "text-secondary";

                        if (order.status == 1) {
                            statusLabel = "Placed";
                            colorClass = "text-warning bg-light";
                        } else if (order.status == 2) {
                            statusLabel = "Preparing";
                            colorClass = "text-info bg-light";
                        } else {
                            statusLabel = order.status || "Pending";
                        }

                        return {
                            id: order.orders_id,
                            name: `Order #${order.orders_id}`,
                            status: statusLabel,
                            statusColor: colorClass,
                            date: order.placed_at,
                            displayDate: formatOrderDate(order.placed_at),
                            price: order.total_cost || 0,
                            image: classic_coffeebara_cold_brew_Pic,
                            items: order.item_count || 0,
                            cancelReason: order.cancellation_reason || "No reason provided.",
                            cancelNotes: order.cancellation_notes || ""
                        };
                    });

                setOrders(mappedOrders);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const openCancelModal = (order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    const filteredOrders = orders
        .filter(o => {
            if (activeTab === "All") return true;
            return o.status === activeTab;
        })
        .sort((a, b) => {
            if (sortBy === "recent") return new Date(b.date) - new Date(a.date);
            return new Date(a.date) - new Date(b.date);
        });

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#fdf8f5" }}>
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 fw-bold text-secondary text-center">nagtitimpla pa ng data... ✨</p>
            </div>
        );
    }

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
          <h1 className="fw-bold mb-1">Order Cancellation Requests</h1>
          <p className="text-muted mb-4">Review and manage order cancellation requests with ease.</p>

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
                        {order.progress || order.status}
                      </div>

                      <div className="text-muted small">
                        { order.items } Item(s) · {order.displayDate}
                      </div>
                    </Col>

                    {/* View Details/Popup Button */}
                    <Col xs="auto">
                    <Button size="sm" variant="link" className="view-link" onClick={() => openCancelModal(order)}>View Details</Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Card>
      </div>

{/*MODALS*/}
    {showCancelModal && selectedOrder && (
       <ReviewCancellationModal
          onClose={() => setShowCancelModal(false)}
          onApprove={() => {
               // cancel order logic
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "Canceled" } : o));
                setShowCancelModal(false);
          }}
          onDecline={() => {
                // keep order logic
                  setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "Ongoing", cancelReason: null } : o));
                  setShowCancelModal(false);
                  }}
          orderData={{
                orderId: selectedOrder.id,
                orderDate: selectedOrder.displayDate, // ✨ using your formatted date!
                customerName: "Customer Name", // ✨ placeholder as requested
                orderStatus: selectedOrder.status, // ✨ using status not progress
                cancellationDate: selectedOrder.displayDate, // keeping for now, you'll remove later
                reason: selectedOrder.cancelReason,
                customerNotes: selectedOrder.cancelNotes || "No additional notes provided", // ✨ fallback text
                  }}
              />
          )}
    </>
  );
}

export default App;