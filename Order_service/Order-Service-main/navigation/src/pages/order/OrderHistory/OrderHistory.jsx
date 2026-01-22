import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Card, Row, Col, ButtonGroup, ToggleButton } from "react-bootstrap";
import "./OrderHistory.css";
import classic_matchabara_cold_brew_Pic from "./classic matchabara cold brew.png";
import classic_macchiabara_cold_brew_Pic from "./classic macchiabara cold brew.png";
import classic_coffeebara_cold_brew_Pic from "./classic coffeebara cold brew.png";
import kapebara_logo_transparent_Pic from "./kapebara logo transparent.png";
import kapebara_cart_Pic from "./kapebara cart.jpg";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
function App() {

const navigate = useNavigate();

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
          <h1 className="fw-bold mb-1">Order History</h1>
          <p className="text-muted mb-4">Track all your orders effortlessly.</p>

          {/* Filter + Sort */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <ButtonGroup>
              {tabs.map((tab) => (
                <ToggleButton key={tab} type="radio" checked={activeTab === tab} onClick={() => setActiveTab(tab)}
                  className={`rounded-pill tab-compact me-2 custom-tab ${
                    activeTab === tab ? "active" : ""
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
              <Card key={order.id} className="mb-3 border-0 shadow-sm" style={{ cursor: "pointer"}} onClick={() => navigate("/order/orderdetails", { state: { orderId: order.id } })}>
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
                      <div className="fw-semibold">{order.name}</div>
                      <div
                        className={`fw-semibold ${
                          order.status === "Ongoing"
                            ? "text-warning"
                            : order.status === "Completed"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {order.status}
                      </div>

                      <div className="text-muted small">
                        {order.items} Item(s) · {order.date}
                      </div>
                    </Col>

                    {/* Price */}
                    <Col xs="auto" className="fw-bold">
                      ₱{order.price}
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