import React from 'react';
import {
  Navbar,
  Container,
  Nav,
  Card,
  Row,
  Col,
  Button,
  Form
} from 'react-bootstrap';
import './App.css';
import classic_matchabara_cold_brew_Pic from './classic matchabara cold brew.png';
import kapebara_logo_transparent_Pic from './kapebara logo transparent.png';
import kapebara_cart_Pic from './kapebara cart.jpg';

// --- Cart Component ---
function Cart({ items, isOpen, onClose, onRemove, onUpdateQuantity, onPlaceOrder }) {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="cart">
      {/* Cart Header */}
      <div className="cart-header">
        <div>
          <h1 className="cart-title">My KapeBag</h1>
          <p className="cart-subtitle">All your picks in one spot.</p>
        </div>
        <Button variant="link" onClick={onClose} className="cart-close-btn">
          X
        </Button>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          items.map((item, index) => (
            <div key={item.productId + item.size + item.notes} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-size">Size: {item.size}</div>
                <div className="cart-item-notes">
                  {item.notes ? item.notes : 'No special instructions'}
                </div>
              </div>
              <div className="cart-item-controls">
                <div className="cart-item-price">₱{item.price * item.quantity}.00</div>
                <div className="quantity-controls">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.productId, item.size, item.notes, item.quantity - 1)}
                    className="cart-quantity-btn"
                  >
                    -
                  </Button>
                  <span className="cart-quantity-display">{item.quantity}</span>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.productId, item.size, item.notes, item.quantity + 1)}
                    className="cart-quantity-btn"
                  >
                    +
                  </Button>
                </div>
                <button
                  onClick={() => onRemove(item.productId, item.size, item.notes)}
                  className="cart-remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer */}
      <div className="cart-footer">
        <div className="cart-total-row">
          <span>Estimated Total:</span>
          <span className="cart-total-amount">₱{total}.00</span>
        </div>
        <Button 
          variant="none"
          onClick={onPlaceOrder} 
          className="place-order-btn"
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}

function App() {
  const product = {
    id: 1,
    name: "Classic Matchabara Cold Brew",
    image: classic_matchabara_cold_brew_Pic,
    prices: { M: 120, L: 140 }
  };

  const [quantity, setQuantity] = React.useState(1);
  const [size, setSize] = React.useState("M");
  const [notes, setNotes] = React.useState("");
  const [cartItems, setCartItems] = React.useState([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  //  Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [itemToRemove, setItemToRemove] = React.useState(null);

  const price = product.prices[size] || 0;

  const handleAddToBag = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      image: product.image,
      size,
      quantity,
      price,
      total: price * quantity,
      notes
    };

    const existingItemIndex = cartItems.findIndex(
      item =>
        item.productId === cartItem.productId &&
        item.size === cartItem.size &&
        item.notes === cartItem.notes
    );

    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += cartItem.quantity;
      updatedCartItems[existingItemIndex].total =
        updatedCartItems[existingItemIndex].price * updatedCartItems[existingItemIndex].quantity;
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, cartItem]);
    }

    setQuantity(1);
    setSize("M");
    setNotes("");
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId, itemSize, itemNotes) => {
    setCartItems(
      cartItems.filter(
        item => !(item.productId === productId && item.size === itemSize && item.notes === itemNotes)
      )
    );
  };

  const handleUpdateQuantity = (productId, itemSize, itemNotes, newQuantity) => {
    if (newQuantity <= 0) {
      setItemToRemove({ productId, size: itemSize, notes: itemNotes });
      setShowConfirmModal(true);
      return;
    }

    setCartItems(
      cartItems.map(item =>
        item.productId === productId && item.size === itemSize && item.notes === itemNotes
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      )
    );
  };

  const handlePlaceOrder = () => {
    alert('Order placed successfully!');
    setCartItems([]);
    setIsCartOpen(false);
  };

  //  Confirmation Modal Component
  const ConfirmRemoveModal = () => {
    if (!showConfirmModal) return null;

    const { productId, size, notes } = itemToRemove || {};

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '24px',
          borderRadius: '12px',
          textAlign: 'center',
          width: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontFamily: 'DM Sans, sans-serif'
        }}>
          <h5 style={{ 
            marginBottom: '20px', 
            fontWeight: 500,
            fontSize: '16px',
            color: '#1C1C1C'
          }}>
            Do you want to remove this order?
          </h5>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              style={{
                backgroundColor: '#ddd',
                borderColor: '#ddd',
                color: '#333',
                fontWeight: 600,
                fontSize: '14px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                handleRemoveFromCart(productId, size, notes);
                setShowConfirmModal(false);
              }}
              style={{
                backgroundColor: '#E53935',
                borderColor: '#E53935',
                fontWeight: 600,
                fontSize: '14px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              Remove Order
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Navbar */}
      <Navbar expand="lg" className="navbar" fixed="top">
        <Container>
          <Navbar.Brand href="#home">
            <img src={kapebara_logo_transparent_Pic} height="30" className="d-inline-block align-text-top" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="center-nav" />
          <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
            <Nav className="ms-auto gap-4 align-items-center">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#menu">Menu</Nav.Link>
              <Nav.Link href="#my-orders">My Orders</Nav.Link>
              <Nav.Link href="#my-profile">My Profile</Nav.Link>
              <Nav.Link
                href="#cart"
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

      {/* Main Content */}
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
        <Card className="main-card">
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
                <Card className="glossy-card">
                  <Card.Body>
                    <div style={{ width: '100%', textAlign: 'left', marginBottom: '15px' }}>
                      <Card.Title className="product-title">{product.name}</Card.Title>
                      <Card.Title className="product-price">₱{price}</Card.Title>
                    </div>

                    <Row className="control-row">
                      <Col xs={6} className="text-left mb-1">Quantity</Col>
                      <Col xs={6} className="text-left mb-1">Size</Col>
                    </Row>

                    <Row className="control-row">
                      <Col xs={6} className="d-flex justify-content-start">
                        <div className="quantity-stepper">
                          <Button
                            variant="light"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="quantity-btn"
                          >
                            -
                          </Button>
                          <span className="cart-quantity-display">{quantity}</span>
                          <Button
                            variant="light"
                            onClick={() => setQuantity(q => q + 1)}
                            className="quantity-btn"
                          >
                            +
                          </Button>
                        </div>
                      </Col>

                      <Col xs={6} className="d-flex justify-content-start">
                        <div style={{ display: 'flex', gap: '10px', width: '92%' }}>
                          {['M', 'L'].map(s => (
                            <div
                              key={s}
                              onClick={() => setSize(s)}
                              className={`size-option ${size === s ? 'active' : 'inactive'}`}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>

                    <Form.Group controlId="formNotes" style={{ width: '100%', marginTop: '10px' }}>
                      <Form.Label className="notes-label">Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any special instructions..."
                        className="notes-textarea"
                      />
                    </Form.Group>

                    <Button onClick={handleAddToBag} className="add-to-bag-btn">
                      Add to Bag
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Cart */}
      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Confirmation Modal */}
      {ConfirmRemoveModal()}
    </>
  );
}

export default App;