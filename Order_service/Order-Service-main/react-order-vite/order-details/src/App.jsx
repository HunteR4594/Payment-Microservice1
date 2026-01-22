// App.jsx
import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const kapebara_cart_Pic = "/assets/kapebara cart.jpg";


const OrderDetails = () => {
  return (
    <div className="order-details-container">
      {/* Header */}
      <div className="header-section">
        <h1 className="page-title">Order Details</h1>

        {/* Default Bootstrap Navigation Bar */}
          <Navbar expand="lg" className="navbar">
            <Container>
              <div className="d-flex align-items-center">
              <Navbar.Brand href="#home">
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

      </div>

      {/* Main Content */}
      <div className="main-content">

      {/* LEFT COLUMN */}
    <div className="order-item-card">

    <div className="orders-section">
      <h4 className="section-header">ORDERS</h4>

      {/* ITEM 1 */}
    <div className="order-item">
      <img
          src="./assets/matchabara-cold-brew.png"
          alt="Classic Matchabara Cold Brew"
          className="product-image"
      />

    <div className="item-details">
          <span className="quantity">1x</span>
          <div className="item-name">Classic Matchabara Cold Brew</div>
          <div className="item-size">Medium</div>
    </div>
        <span className="price">₱120.00</span>
  </div>

    {/* ORDER NOTE */}
      <div className="order-note">
        <h4>Order Note:</h4>
        <p>"Please less ice on the Matcha. Thank you!"</p>
      </div>

      {/* ITEM 2 */}
      <div className="order-item">
        <img
          src="./assets/coffeebara-cold-brew.png"
          alt="Classic Coffeebara Cold Brew"
          className="product-image"
        />

      <div className="item-details">
          <span className="quantity">1x</span>
          <div className="item-name">Classic Coffeebara Cold Brew</div>
          <div className="item-size">Medium</div>
      </div>
           <span className="price">₱100.00</span>
      </div>

      {/* ORDER NOTE */}
      <div className="order-note">
        <h4>Order Note:</h4>
        <p>"Please less ice on the Matcha. Thank you!"</p>
      </div>
    </div>

      {/* FOOTER */}
      <div className="order-footer">
      <div className="left-footer">
        <span className="status-completed">Completed</span>
        <div className="order-id">
          <span>Order ID</span>{" "}
          <span className="id-number">123456 - Nov 20, 2025</span>
        </div>
      </div>
      <button className="request-for-refund-btn">Request for Refund</button>
    </div>
  </div>

     {/* RIGHT COLUMN */}
    <div className="right-column">
    
    {/* SHIPPING INFO */}
    <div className="shipping-info-card">
      <h4 className="section-header">SHIPPING INFORMATION</h4>
    <div className="customer-info">
        <div className="info-row">
           <img
            src="./assets/user-icon.png"
            alt="Usr Icon"
            className="icon-image"
          />
          <span className="customer-name">Jona Dela Cruz</span>
        </div>
        <div className="info-row">
          <img
            src="./assets/location-icon.png"
            alt="Location Icon"
            className="icon-image"
          />
          <span>84A Road 14, Bagong Pag-Asa, Quezon City, Metro Manila</span>
        </div>
        <div className="info-row">
          <img
            src="./assets/contact-icon.png"
            alt= "Contact Icon"
            className="icon-image"
          />
          <span>09171234567</span>
        </div>
      </div>

      <div className="timeline">
        <div className="timeline-item">
          <span className="timeline-label">Order Time</span>
          <span className="timeline-value">12:01 PM</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-label">Payment Time</span>
          <span className="timeline-value">12:03 PM</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-label">Shipped Time</span>
          <span className="timeline-value">12:09 PM</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-label">Completed Time</span>
          <span className="timeline-value">12:22 PM</span>
        </div>
      </div>
    </div>

    {/* PAYMENT SUMMARY */}
    <div className="payment-summary-card">
      <h4 className="section-header">PAYMENT SUMMARY</h4>

      <div className="payment-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₱220.00</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>₱0.00</span>
        </div>
        <div className="summary-row total">
          <span>GRAND TOTAL</span>
          <span>₱220.00</span>
        </div>
      </div>

      <div className="payment-method">
        <h4>Payment Method</h4>
        <div className="payment-card">
          <div className="gcash-badge">GCash</div>
          <span className="card-number">******* 9283</span>
          <span className="check-icon">✓</span>
        </div>
        </div>
      </div>
     </div>
    </div>
   </div>
 );
};

export default OrderDetails;