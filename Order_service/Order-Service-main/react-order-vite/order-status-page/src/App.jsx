import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import MenuPage from './MenuPage';
import OrderStatus from './OrderStatus';

import kapebara_logo_transparent_Pic from './kapebara logo transparent.png';
import kapebara_cart_Pic from './kapebara cart.jpg';

function App() {
    return (
        <Router>
            <Navbar expand="lg" className="navbar" style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img src={kapebara_logo_transparent_Pic} height="40" className="d-inline-block align-text-top" alt="Kapebara Logo" />
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="center-nav" />
                    <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
                        <Nav className="ms-auto gap-4 align-items-center" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>

                            <Nav.Link as={Link} to="/" style={{ color: '#3B302A' }}>Home</Nav.Link>
                            <Nav.Link as={Link} to="/menu" style={{ color: '#3B302A' }}>Menu</Nav.Link>

                            <Nav.Link as={Link} to="/order-status" style={{ color: '#617A55' }}>My Orders</Nav.Link>

                            <Nav.Link href="#my-profile" style={{ color: '#3B302A' }}>My Profile</Nav.Link>
                            <Nav.Link href="#cart">
                                <img src={kapebara_cart_Pic} height="25" style={{ objectFit: "contain" }} alt="Cart" />
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/order-status" element={<OrderStatus />} />
            </Routes>
        </Router>
    );
}

export default App;