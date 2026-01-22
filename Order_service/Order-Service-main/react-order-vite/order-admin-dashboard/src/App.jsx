import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Card, Row, Col, ButtonGroup, ToggleButton, Button, Modal, Form } from "react-bootstrap";
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
  const [modalShow, setModalShow] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalMode, setModalMode] = useState("update");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchedOrders = [
      {
        id: 1230001,
        name: "Classic Matchabara Cold Brew",
        status: "Ongoing",
        progress: "Preparing",
        items: 1,
        date: "2025-12-04T10:00:00",
        price: 120,
        image: classic_matchabara_cold_brew_Pic
      },
      {
        id: 1230002,
        name: "Classic Macchiabara Cold Brew",
        status: "Canceled",
        progress: "Canceled",
        items: 1,
        date: "2025-12-04T10:00:00",
        price: 130,
        cancelReason: "Changed my mind",
        cancelNotes: "N/A",
        image: classic_macchiabara_cold_brew_Pic
      },
      {
        id: 1230003,
        name: "Classic Coffeebara Cold Brew",
        status: "Completed",
        progress: "Delivered",
        items: 1,
        date: "2025-12-04T10:00:00",
        price: 100,
        image: classic_coffeebara_cold_brew_Pic
      },
    ];

    setOrders(fetchedOrders);
  }, []);

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

  const openModal = (order) => {
    setSelectedOrder(order);
    setModalMode(order.status === "Canceled" ? "cancel" : "update");
    setNewStatus(order.status);
    setModalShow(true);
  };

  const handleUpdateStatus = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
        ? { ...order, status: newStatus === "Completed" ? "Completed" : "Ongoing", progress: newStatus }
        : order
      )
    );
    setModalShow(false);
  };

  const handleApproveCancel = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
        ? { ...order, status: "Canceled" }
        : order
      )
    );
    setModalShow(false);
  };

  const handleRejectCancel = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
        ? { ...order, status: "Ongoing", cancelReason: null }
        : order
      )
    );
    setModalShow(false);
  };

  return (
    <>
      {/* Default Bootstrap Navigation Bar */}
      <Navbar expand="lg" className="navbar">
        <Container>
          <div className="d-flex align-items-center">
          <Navbar.Brand href="#home">
            <img src={kapebara_logo_transparent_Pic} height="30" className="d-inline-block align-text-top"/>
          </Navbar.Brand>
          </div>
          <Navbar.Toggle aria-controls="center-nav" />
          <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
            <Nav className="ms-auto gap-4 align-items-center">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#menu">Menu</Nav.Link>
              <Nav.Link href="#my-orders">My Orders</Nav.Link>
              <Nav.Link href="#my-profile">My Profile</Nav.Link>
              <Nav.Link href="#cart"><img src={kapebara_cart_Pic} height="30" style={{ objectFit: "contain" }}/></Nav.Link>
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
            ))
          )}
        </Card>
      </div>

      {/* Modals */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered dialogClassName="admin-modal">
        <Modal.Header closeButton className="admin-modal-header">
          <Modal.Title>
            {modalMode === "cancel"
              ? "Cancellation Request"
              : "Update Order Status"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="admin-modal-body">
          {selectedOrder && (
            <>
              <p><strong>Order ID:</strong> {selectedOrder.id}</p>
              <p><strong>Order Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
              <p><strong>Order Items:</strong> {selectedOrder.items}</p>

              {modalMode === "cancel" ? (
                <>
                  <strong>Reason:</strong>
                  <p className="text-muted">{selectedOrder.cancelReason}</p>
                  <strong>Notes:</strong>
                  <p className="text-muted">{selectedOrder.cancelNotes}</p>
                </>
              ) : (
                <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="Preparing">Preparing</option>
                  <option value="Looking for Rider">Looking for Rider</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Completed">Delivered</option>
                </Form.Select>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="admin-modal-footer">
          {modalMode === "cancel" ? (
            <>
              <Button variant="danger" onClick={handleRejectCancel}>Reject</Button>
              <Button variant="success" onClick={handleApproveCancel}>Approve</Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleUpdateStatus}>Update Status</Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;