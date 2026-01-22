import React, { useState } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import classic_matchabara_cold_brew_Pic from './classic matchabara cold brew.png';

const MenuPage = () => {
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('M');

    const sizePrice = { M: 120, L: 140 };
    const price = sizePrice[size] || 0;

    const colors = { primary: '#3B302A', text: '#1C1C1C', accent: '#617A55' };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)', padding: '20px' }}>
            <Card className="card-glossy" style={{ maxWidth: '800px', width: '100%', display: 'flex', padding: '20px', minHeight: '500px' }}>
                <Row className="g-0" style={{ width: '100%', height: '100%' }}>
                    <Col md={6}>
                        <Card.Img src={classic_matchabara_cold_brew_Pic} className="img-fluid rounded-start" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                    </Col>

                    <Col md={6} className="d-flex">
                        <div style={{ margin: 'auto', width: '100%' }}>
                            <Card.Body style={{ width: '100%' }}>
                                <div style={{ width: '100%', textAlign: 'left', marginBottom: '15px' }}>
                                    <Card.Title style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '20px', fontWeight: 700, color: colors.primary }}>Classic Matchabara Cold Brew</Card.Title>
                                    <Card.Title style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '40px', fontWeight: 700, color: colors.text }}>₱{price}</Card.Title>
                                    <Card.Text style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', fontWeight: 400, color: '#757575', lineHeight: 1.6 }}>
                                        A rich matcha latte for calm and cozy days.
                                    </Card.Text>
                                </div>

                                <Row style={{ width: '100%', marginBottom: '15px' }}>
                                    <Col xs={6} className="d-flex justify-content-start">
                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                                            <Button variant="outline-secondary" size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                                            <span style={{ fontWeight: 'bold' }}>{quantity}</span>
                                            <Button variant="outline-secondary" size="sm" onClick={() => setQuantity(q => q + 1)}>+</Button>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {['M', 'L'].map(s => (
                                                <div key={s} onClick={() => setSize(s)}
                                                    style={{
                                                        flex: 1, textAlign: 'center', padding: '5px', borderRadius: '5px', cursor: 'pointer', fontWeight: 700,
                                                        backgroundColor: size === s ? colors.primary : 'white',
                                                        color: size === s ? 'white' : colors.primary,
                                                        border: `1px solid ${colors.primary}`
                                                    }}>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </Col>
                                </Row>

                                <Button style={{ width: '100%', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, backgroundColor: colors.primary, border: 'none' }}>
                                    Add to Bag
                                </Button>

                                <Form.Group controlId="formNotes" style={{ width: '100%', marginTop: '15px' }}>
                                    <Form.Label style={{ fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Notes</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Add any special instructions..." style={{ width: '100%', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', fontWeight: 400 }} />
                                </Form.Group>

                            </Card.Body>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default MenuPage;