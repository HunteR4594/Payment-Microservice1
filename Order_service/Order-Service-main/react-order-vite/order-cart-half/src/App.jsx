
import React, { useState } from 'react';
import { Navbar, Container, Nav, Card, Row, Col, Button, Form, ListGroup, ListGroupItem } from 'react-bootstrap';
import './App.css';
import classic_matchabara_cold_brew_Pic from './classic matchabara cold brew.png';
import kapebara_logo_transparent_Pic from './kapebara logo transparent.png';
import kapebara_cart_Pic from './kapebara cart.jpg';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const product = {
    id: 1,
    name: "Classic Matchabara Cold Brew",
    image: classic_matchabara_cold_brew_Pic,
    prices: { M: 120, L: 140 }
  };

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("M");
  const [notes, setNotes] = useState("");

  const price = product.prices[size] || 0;

  const handleAddToBag = () => {
    const cartItem = {
      id: Date.now(),
      productId: product.id,
      name: product.name,
      size,
      quantity,
      price,
      total: price * quantity,
      notes,
      image: product.image
    };
    setCartItems(prev => [...prev, cartItem]);
    setIsCartOpen(true);
  };

  const updateQuantity = (index, newQty) => {
    if (newQty < 1) return;
    const newCart = [...cartItems];
    newCart[index].quantity = newQty;
    newCart[index].total = newCart[index].price * newQty;
    setCartItems(newCart);
  };

  const handleRemoveItem = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const estimatedTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  const handlePlaceOrder = () => {
    alert("Order placed! 🎉");
    setCartItems([]);
    setIsCartOpen(false);
  };
// Navbar
  return (
    <>
      <Navbar expand="lg" className="navbar">
        <Container>
          <Navbar.Brand href="#home">
            <img src={kapebara_logo_transparent_Pic} height="30" alt="Kapebara" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="center-nav" />
          <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
            <Nav className="ms-auto gap-4 align-items-center">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#menu">Menu</Nav.Link>
              <Nav.Link href="#my-orders">My Orders</Nav.Link>
              <Nav.Link href="#my-profile">My Profile</Nav.Link>
              <Nav.Link onClick={() => setIsCartOpen(!isCartOpen)}>
                <img src={kapebara_cart_Pic} height="30" style={{ objectFit: "contain" }} alt="Cart" />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
        <Card className="card" style={{ maxWidth: "800px", width: "100%", padding: "24px", height: "600px" }}>
          <Row className="g-0" style={{ width: '100%', height: '100%' }}>
            <h1 className="fw-bold mb-1">Customize Your Order</h1>
            <p className="text-muted mb-4">Review and adjust item details before adding it to your bag.</p>

            <Col md={6} className="d-flex align-items-center justify-content-center">
              <Card.Img
                src={product.image}
                className="img-fluid rounded-start"
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
              />
            </Col>

            <Col md={6} className="d-flex">
              <div style={{ margin: 'auto', width: '100%' }}>
                <Card className="card-glossy" style={{ maxWidth: "500px", width: "100%", padding: "20px", height: "440px" }}>
                  <Card.Body>
                    <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                      <Card.Title style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '20px', fontWeight: 600 }}>
                        {product.name}
                      </Card.Title>
                      <Card.Title style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '40px', fontWeight: 700 }}>
                        ₱{price}
                      </Card.Title>
                    </div>

                    <Row style={{ marginBottom: '10px', fontWeight: 500 }}>
                      <Col xs={6}>Quantity</Col>
                      <Col xs={6}>Size</Col>
                    </Row>

                    <Row style={{ marginBottom: '15px' }}>
                      <Col xs={6} className="d-flex justify-content-start">
                        <div style={{ display: 'flex', alignItems: 'center', width: '92%', justifyContent: 'space-between', padding: '5px 10px' }}>
                          <Button variant="light" style={{ padding: 0, width: '25px', height: '25px' }} onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                          <span style={{ textAlign: 'center', flex: 1 }}>{quantity}</span>
                          <Button variant="light" style={{ padding: 0, width: '25px', height: '25px' }} onClick={() => setQuantity(q => q + 1)}>+</Button>
                        </div>
                      </Col>

                      <Col xs={6} className="d-flex justify-content-start">
                        <div style={{ display: 'flex', gap: '10px', width: '92%' }}>
                          {['M', 'L'].map(s => (
                            <div
                              key={s}
                              onClick={() => setSize(s)}
                              style={{
                                flex: 1,
                                textAlign: 'center',
                                padding: '6px 0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                backgroundColor: size === s ? '#AA6E39' : '#F1F3F5',
                                color: size === s ? 'white' : '#333',
                                border: size === s ? 'none' : '1px solid #E0E0E0'
                              }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>

                    <Button
                      className="add-to-bag-btn"
                      style={{ width: '100%', marginTop: '25px', fontFamily: 'DM Sans, sans-serif', fontSize: "15px", fontWeight: 700 }}
                      onClick={handleAddToBag}
                    >
                      Add to Bag
                    </Button>

                    <Form.Group controlId="formNotes" style={{ width: '100%', marginTop: '15px' }}>
                      <Form.Label style={{ fontWeight: 500 }}>Notes</Form.Label>
                      <Form.Control
                        className="notes-textarea"
                        as="textarea"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any special instructions..."
                        style={{ width: '100%', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', fontWeight: 400 }}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* CART OVERLAY  */}
      {isCartOpen && (
        <div
          onClick={(e) => e.target === e.currentTarget && setIsCartOpen(false)}
          style={{
            position: 'fixed',
            top: '56px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1020,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Card
            style={{
              width: '420px',
              height: 'calc(100vh - 56px)',
              borderLeft: '1px solid #dee2e6',
              background: '#fff'
            }}
          >
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">KAPE CART</h5>
              <Button variant="link" size="sm" onClick={() => setIsCartOpen(false)}>✖</Button>
            </Card.Header>

            <Card.Body className="p-0" style={{ overflowY: 'auto' }}>
              {cartItems.length === 0 ? (
                <div className="text-center p-4">Your cart is empty.</div>
              ) : (
                <ListGroup variant="flush">
                  {cartItems.map((item, index) => (
                    <ListGroupItem key={item.id || index} className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex" style={{ gap: '16px', flex: 1, minWidth: 0 }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            height="60"
                            className="rounded"
                            style={{ objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}>
                              {item.name}
                            </strong>
                            <div className="text-muted mt-1" style={{ fontSize: '12px' }}>
                              {item.notes || "No special instructions"}
                            </div>
                            <div className="mt-2">
                              <small
                                className="px-2 py-1 rounded"
                                style={{ backgroundColor: '#f1f3f5', fontSize: '11px', fontWeight: 500 }}
                              >
                                Size: {item.size}
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-column align-items-end" style={{ marginLeft: '16px', minWidth: '80px' }}>
                          <span style={{ fontWeight: 700, fontSize: '16px', color: '#333', marginBottom: '10px' }}>
                            ₱{item.total.toFixed(2)}
                          </span>
                          <div className="d-flex align-items-center border rounded mb-2" style={{ height: '30px', padding: '0 6px' }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              style={{ padding: '0 8px', minWidth: '28px', fontSize: '16px', fontWeight: 500 }}
                            >
                              -
                            </button>
                            <span className="px-2" style={{ fontSize: '14px', fontWeight: 500 }}>{item.quantity}</span>
                            <button
                              className="btn btn-sm"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              style={{ padding: '0 8px', minWidth: '28px', fontSize: '16px', fontWeight: 500 }}
                            >
                              +
                            </button>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            style={{ fontSize: '13px', padding: '0', color: '#666', fontWeight: 500 }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              )}
            </Card.Body>

            {cartItems.length > 0 && (
              <>
                <div className="border-top p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <Row className="align-items-center">
                    <Col><strong>Estimated Total</strong></Col>
                    <Col className="text-end"><strong>₱{estimatedTotal.toFixed(2)}</strong></Col>
                  </Row>
                </div>
                <Card.Footer className="p-0">
                  <Button
                    variant="dark"
                    className="w-100"
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      padding: '12px 0'
                    }}
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </Button>
                </Card.Footer>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

export default App;