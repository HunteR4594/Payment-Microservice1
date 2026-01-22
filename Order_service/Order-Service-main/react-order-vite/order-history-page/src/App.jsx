import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Card, Row, Col, ButtonGroup, ToggleButton, Spinner } from "react-bootstrap";
import "./App.css";
import classic_matchabara_cold_brew_Pic from "./classic matchabara cold brew.png";
import classic_macchiabara_cold_brew_Pic from "./classic macchiabara cold brew.png";
import classic_coffeebara_cold_brew_Pic from "./classic coffeebara cold brew.png";
import kapebara_logo_transparent_Pic from "./kapebara logo transparent.png";
import kapebara_cart_Pic from "./kapebara cart.jpg";


function App() {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("All");
    const [sortBy, setSortBy] = useState("recent");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userId = 101;

    const mapStatusForTab = (statusName) => {
        const s = statusName?.toLowerCase();
        if (!s) return "Ongoing";
        const ongoing = ["placed", "preparing", "readyforpickup", "intransit"];
        if (ongoing.includes(s)) return "Ongoing";
        if (s === "delivered") return "Completed";
        if (s === "cancelled" || s === "failed") return "Canceled";
        return "Ongoing";
    };

    useEffect(() => {
        setLoading(true);
        fetch(`https://localhost:7237/api/Orders/history/${userId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) return [];
                    throw new Error("fetch failed");
                }
                return response.json();
            })
            .then(data => {
                const rawData = Array.isArray(data) ? data : [];
                const mappedOrders = rawData.map(order => ({
                    id: order.orders_id,
                    name: `Order #${order.orders_id}`,
                    status: mapStatusForTab(order.statusName),
                    displayStatus: order.statusName,
                    date: new Date(order.placed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
                    price: order.total_cost,
                    image: classic_macchiabara_cold_brew_Pic,
                    // YASSS QUEEN! fetching the real count from the backend now 📈
                    items: order.item_count || 0
                }));

                setOrders(mappedOrders);
                setLoading(false);
            })
            .catch(err => {
                console.error("errorrrr:", err);
                setError("Error fetching orders");
                setLoading(false);
            });
    }, [userId]);

    const tabs = ["All", "Ongoing", "Completed", "Canceled"];

    const filteredOrders = (
        activeTab === "All"
            ? orders
            : orders.filter((o) => o.status === activeTab)
    ).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

    return (
        <>
            <Navbar expand="lg" className="navbar">
                <Container>
                    <div className="d-flex align-items-center">
                        <Navbar.Brand href="#home">
                            <img src={kapebara_logo_transparent_Pic} height="30" className="d-inline-block align-text-top" alt="Logo" />
                        </Navbar.Brand>
                    </div>
                    <Navbar.Toggle aria-controls="center-nav" />
                    <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
                        <Nav className="ms-auto gap-4 align-items-center">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#menu">Menu</Nav.Link>
                            <Nav.Link href="#my-orders">My Orders</Nav.Link>
                            <Nav.Link href="#my-profile">My Profile</Nav.Link>
                            <Nav.Link href="#cart">
                                <img src={kapebara_cart_Pic} height="30" style={{ objectFit: "contain" }} alt="Cart" />
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
                <Card className="card-glossy" style={{ maxWidth: "800px", width: "100%", padding: "24px", minHeight: "600px" }}>
                    <h1 className="fw-bold mb-1">Order History</h1>
                    <p className="text-muted mb-4">Track all your orders effortlessly.</p>

                    {/* Filter + Sort */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <ButtonGroup>
                            {tabs.map((tab) => (
                                <ToggleButton
                                    key={tab}
                                    type="radio"
                                    checked={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`rounded-pill tab-compact me-2 custom-tab ${activeTab === tab ? "active" : ""}`}
                                >
                                    {tab}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </div>

                    <div className="sort-row mb-3">
                        <span className="sort-label">Sort by</span>
                        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="recent">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="secondary" />
                            <p className="mt-2 text-muted">Loading your coffee journey...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-5 text-danger">{error}</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No orders found.
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <Card key={order.id} className="mb-3 border-0 shadow-sm">
                                <Card.Body>
                                    <Row className="align-items-center">
                                        <Col xs="auto">
                                            <img
                                                src={order.image}
                                                alt={order.name}
                                                width={55}
                                                style={{ borderRadius: "8px" }}
                                            />
                                        </Col>
                                        <Col>
                                            <div className="fw-semibold">{order.name}</div>
                                            <div
                                                className={`fw-semibold ${order.status === "Ongoing"
                                                    ? "text-warning"
                                                    : order.status === "Completed"
                                                        ? "text-success"
                                                        : "text-danger"
                                                    }`}
                                            >
                                                {order.displayStatus}
                                            </div>
                                            <div className="text-muted small">
                                                {order.items} Item(s) · {order.date}
                                            </div>
                                        </Col>
                                        <Col xs="auto" className="fw-bold">
                                            ₱{order.price.toFixed(2)}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Card>
            </div>
        </>
    );
}

export default App;