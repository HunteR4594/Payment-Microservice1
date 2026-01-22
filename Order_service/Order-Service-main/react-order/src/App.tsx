import React from 'react';
import './index.css';
import { Navbar, Container, Nav, Card, Row, Col, Button, Form } from 'react-bootstrap';
import classic_matchabara_cold_brew_Pic from './classic matchabara cold brew.png';

{/* JS Hub for Quantity & Size Selectors */}
function App() {
  const [quantity, setQuantity] = React.useState(1);
  const [size, setSize] = React.useState<'M' | 'L' | ''>('M');
  const sizePrice = { M: 120, L: 140 };
  const price = sizePrice[size as 'M' | 'L'] || 0;

  return (
    <>
      {/* Default Bootstrap Navigation Bar */}
      <Navbar expand="lg" className="navbar">
        <Container>
          <Navbar.Brand href="#home" style={{ fontFamily: 'Jakarta Sans, sans-serif' }}>Kapebara</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#menu">Menu</Nav.Link>
              <Nav.Link href="#about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Centered Card */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 56px)', padding: '20px' }}>
        <Card className = "card-glossy" style={{ maxWidth: '800px', width: '100%', display: 'flex', padding: '20px', height: '600px' }}>
          <Row className="g-0" style={{ width: '100%', height: '100%' }}>

            {/* Image */}
            <Col md={6}>
              <Card.Img src={classic_matchabara_cold_brew_Pic} className="img-fluid rounded-start" style={{ height: '100%', width: '100%', objectFit: 'cover' }}/>
            </Col>

            {/* Card Body */}
            <Col md={6} className="d-flex">
              <div style={{ margin: 'auto', width: '100%' }}>
                <Card.Body style={{ width: '100%' }}>

                  {/* Product Info */}
                  <div style={{ width: '100%', textAlign: 'left', marginBottom: '15px' }}>
                    <Card.Title style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '20px', fontWeight: 600 }}>Classic Matchabara Cold Brew</Card.Title>
                    <Card.Title style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '40px', fontWeight: 700 }}>₱{price}</Card.Title>
                    <Card.Text style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', fontWeight: 400, color: '#757575', lineHeight: 1.6 }}>A rich matcha latte for calm and cozy days.</Card.Text>
                  </div>

                  {/* Labels */}
                  <Row style={{ width: '100%', marginBottom: '10px', fontWeight: 500 }}>
                    <Col xs={6} className="text-left mb-1">Quantity</Col>
                    <Col xs={6} className="text-left mb-1">Size</Col>
                  </Row>

                  {/* Stepper + Size Boxes */}
                  <Row style={{ width: '100%', marginBottom: '15px' }}>

                    {/* Quantity Stepper */}
                    <Col xs={6} className="d-flex justify-content-start">
                      <div style={{ display: 'flex', alignItems: 'center', width: '92%', justifyContent: 'space-between', padding: '5px 10px' }}>
                        <Button variant="light" style={{ padding: 0, width: '25px', height: '25px' }} onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                        <span style={{ textAlign: 'center', flex: 1 }}>{quantity}</span>
                        <Button variant="light" style={{ padding: 0, width: '25px', height: '25px' }} onClick={() => setQuantity(q => q + 1)}>+</Button>
                      </div>
                    </Col>

                    {/* Size Boxes */}
                    <Col xs={6} className="d-flex justify-content-start">
                      <div style={{ display: 'flex', gap: '10px', width: '92%' }}>
                        {['M', 'L'].map(s => (
                          <div key={s} onClick={() => setSize(s as 'M' | 'L')} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: '5px', cursor: 'pointer', backgroundColor: size === s ? '#AA6E39' : 'white', color: size === s ? 'white' : '#333', fontWeight: 500 }}>
                            {s}
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>

                  {/* Add to Bag */}
                  <Button className="add-to-bag-btn" style={{ width: '90%', fontFamily: 'DM Sans, sans-serif', fontSize: "15px", fontWeight: 700 }}>Add to Bag</Button>

                  {/* Notes */}
                  <Form.Group controlId="formNotes" style={{ width: '90%', marginTop: '10px' }}>
                    <Form.Label style = {{fontWeight: 500}}>Notes</Form.Label>
                    <Form.Control className = "notes-textarea" as="textarea" rows={3} placeholder="Add any special instructions..." style={{ width: '100%', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', fontWeight: 400 }}/>
                  </Form.Group>

                </Card.Body>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

    </>
  );
}

export default App;