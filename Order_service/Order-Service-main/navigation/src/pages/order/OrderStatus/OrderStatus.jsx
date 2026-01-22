import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Row, Col, Button as BootstrapButton } from 'react-bootstrap';
import { Check, CupHotFill, PersonFill, Bicycle, HouseDoorFill, GeoAltFill, Shop } from 'react-bootstrap-icons';
import confetti from 'canvas-confetti';
import { Link, useLocation } from 'react-router-dom';
import './OrderStatus.css';


/*
    1. Map all of the Order Details from the Database instead of the Mock values.
    2. Integrate with backend to fetch real-time order status updates.
    3. Make an interval to update the order status every X seconds to simulate real-time tracking.
    4. Make the logic for cancelling orders with backend integration.
    5. Block the cancel button from being clicked if the order is already requested for cancellation or already delivered.
*/



// Assets
import kapebara_logo_transparent_Pic from './kapebara logo transparent.png';
import kapebara_cart_Pic from './kapebara cart.jpg';
import capybarabarista from './capybarabarista.png';
import capybaralooking from './capybaralooking.png';
import capybararider from './capybararider.png';
import capybaradelivered from './capybaradelivered.png';
import capybarasad from './capybarasad.png';

const OrderStatus = () => { 
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);
    const [orderId, setOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const orderIdFromState = location.state?.orderId;
    
    // States
    const [currentStep, setCurrentStep] = useState(1); 
    const [cancellationRequested, setCancellationRequested] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderStatus, setOrderStatus] = useState('active');
    const [selectedReason, setSelectedReason] = useState(""); 
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Branding Colors
    const BARA_BROWN = '#3B302A';
    const BARA_GREEN = '#617A55';
    const BARA_BG = '#FCFDFB';
    const PRIMARY_TEXT = '#1C1C1C';
    const SECONDARY_TEXT = '#757575';

    const isCancelDisabled =
        currentStep >= 4 ||
        orderStatus == 'cancelled' ||
        cancellationRequested;

    // Calculate Totals based on mapped items
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = 0;
    const grandTotal = subtotal + deliveryFee;

    const getStatusLogo = () => {
        if (currentStep === 1) return capybarabarista;
        if (currentStep === 2) return capybaralooking;
        if (currentStep === 3) return capybararider;
        if (currentStep === 4) return capybaradelivered;
        return capybarabarista;
    };

    useEffect(() => {
        if (!orderIdFromState) return;

        const fetchOrderDetails = async () => {
            try {
                
                //console.log("Fetching order details for Order ID:", orderIdFromState);
                
                const reponse = await fetch(
                    `https://localhost:7237/api/Orders/${orderIdFromState}/items`
                );

                if (!reponse.ok) {
                throw new Error('Failed to fetch order items');
            }

                const data = await reponse.json();

                setCancellationRequested(data.cancellationRequested === true); // Set the cancellationReuqested to true if the backend says so else false.

                setCartItems(data.items);
                setOrderId(data.orderId);

                switch (data.status) {
                    case 1:
                        setCurrentStep(1);
                        break;
                    case 2:
                        setCurrentStep(2);
                        break;
                    case 3:
                        setCurrentStep(3);
                        break;
                    case 4:
                        setCurrentStep(4);
                        break;
                    default:
                        setCurrentStep(1);
                }
            } catch (error) {
            console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderIdFromState]);

    useEffect(() => {
        if (currentStep === 4 && orderStatus !== 'cancelled') {
            const duration = 3 * 1000;
            const end = Date.now() + duration;
            const frame = () => {
                confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: [BARA_BROWN, BARA_GREEN, '#FFC107'] });
                confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: [BARA_BROWN, BARA_GREEN, '#FFC107'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, [currentStep, orderStatus]);

    const requestCancellation = async () => {
        try {
            setCancellationRequested(true); // lock the button
            
            const response = await fetch(
                "https://localhost:7237/api/Orders/request-cancellation",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        orderId: orderIdFromState,
                        reason: selectedReason
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Cancellation failed.");
            }

            console.log(result.message);
            setShowCancelModal(false);
        } catch (error) {
            console.error("Cancellation error:", error);
            setCancellationRequested(false); // unlock the button on error
            alert(error.message);
        }
    };

    const steps = [
        { label: "RECEIVED", icon: <Check /> },
        { label: "PREPARING", icon: <CupHotFill /> },
        { label: "RIDER", icon: <PersonFill /> },
        { label: "TRANSIT", icon: <Bicycle /> },
        { label: "DELIVERED", icon: <HouseDoorFill /> },
    ];

    const modalStyles = {
        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 },
        modal: { background: '#fff', width: '450px', maxWidth: '95%', borderRadius: '16px', padding: '25px', maxHeight: '90vh', overflowY: 'auto', fontFamily: "'Plus Jakarta Sans', sans-serif" },
        radioBox: (selected) => ({ display: 'flex', gap: '10px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', backgroundColor: selected ? '#fdecec' : 'transparent', borderColor: selected ? '#c43737' : '#ddd', transition: 'all 0.2s' }),
        policy: { background: '#fff3cd', padding: '12px', borderRadius: '8px', marginTop: '15px', fontSize: '13px' }
    };

    if (orderStatus === 'cancelled') {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: BARA_BG, padding: '20px' }}>
                <div className="text-center p-5" style={{ maxWidth: '500px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <img src={capybarasad} alt="Cancelled" width="150" className="mb-4" />
                    <h2 className="fw-bold" style={{ color: BARA_BROWN, fontFamily: "'DM Sans', sans-serif" }}>Order Cancelled</h2>
                    <p style={{ color: SECONDARY_TEXT }}>Your order has been cancelled successfully.</p>
                    <BootstrapButton as={Link} to="/order/order" style={{ backgroundColor: BARA_BROWN, border: 'none', borderRadius: '25px', padding: '10px 30px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', color: 'white' }}>Go Back to Menu</BootstrapButton>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar expand="lg" className="navbar" fixed="top">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img src={kapebara_logo_transparent_Pic} height="30" className="d-inline-block align-text-top" alt="Logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="center-nav" />
                    <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
                        <Nav className="ms-auto gap-4 align-items-center">
                            <Nav.Link as={Link} to="/order/order">Home</Nav.Link>
                            <Nav.Link as={Link} to="admin/admincancellations">Menu</Nav.Link>
                            <Nav.Link as={Link} to="/order/orderhistory">My Orders</Nav.Link>
                            <Nav.Link as={Link} to="/admin/admindashboard">My Profile</Nav.Link>
                            <Nav.Link as={Link} to="#" onClick={(e) => { e.preventDefault(); setIsCartOpen(!isCartOpen); }}>
                                <img src={kapebara_cart_Pic} height="30" style={{ objectFit: "contain" }} alt="Cart" />
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div style={{ padding: '80px 0 20px 0', backgroundColor: BARA_BG, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Container style={{ maxWidth: '1100px' }}>
                    <div className="d-flex justify-content-end mb-3">
                        <BootstrapButton variant="link" style={{ color: BARA_GREEN, fontWeight: '700', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: 'none' }} onClick={() => window.location.reload()}>Refresh Status</BootstrapButton>
                    </div>

                    {/* PROGRESS CARD */}
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3 text-center text-md-start">
                            <div className="d-flex align-items-center gap-3 flex-column flex-md-row">
                                <img src={getStatusLogo()} alt="Status" width="60" />
                                <h1 style={{ color: BARA_BROWN, fontWeight: '800', margin: 0, fontSize: 'clamp(1.2rem, 5vw, 1.7rem)', fontFamily: "'DM Sans', sans-serif" }}>
                                    {currentStep === 1 && "Your order is being prepared!"}
                                    {currentStep === 4 && "Delivered!"}
                                    {currentStep > 1 && currentStep < 4 && "Order is on the way!"}
                                </h1>
                            </div>
                            <BootstrapButton 
                                onClick={() => setShowCancelModal(true)}
                                disabled={isCancelDisabled}
                                style={{ 
                                    backgroundColor: isCancelDisabled ? '#ccc' : '#FF4D4F', 
                                    border: 'none', borderRadius: '10px', padding: '10px 25px', 
                                    fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
                                    boxShadow: 'none'
                                }}
                            >
                                Cancel Order
                            </BootstrapButton>
                        </div>

                        <div style={{ position: 'relative', margin: '30px 0 10px 0' }}>
                            <div style={{ position: 'absolute', top: '18px', left: '5%', right: '5%', height: '3px', backgroundColor: '#e0e0e0', zIndex: 0 }}></div>
                            <div style={{ position: 'absolute', top: '18px', left: '5%', width: `${(currentStep / 4) * 90}%`, height: '3px', backgroundColor: BARA_BROWN, zIndex: 1, transition: '0.5s ease' }}></div>
                            <div className="d-flex justify-content-between position-relative" style={{ zIndex: 2 }}>
                                {steps.map((step, index) => {
                                    const isActive = index <= currentStep;
                                    return (
                                        <div key={index} className="text-center" style={{ width: '20%' }}>
                                            <div style={{ 
                                                width: '35px', height: '35px', borderRadius: '50%', 
                                                backgroundColor: isActive ? BARA_BROWN : '#fff', 
                                                color: isActive ? '#fff' : BARA_BROWN, 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', 
                                                border: isActive ? '3px solid #fff' : `2px solid ${BARA_BROWN}`,
                                                fontSize: '14px'
                                            }}>{step.icon}</div>
                                            <div className="mt-2 fw-bold" style={{ 
                                                fontSize: 'clamp(8px, 2vw, 10px)', 
                                                color: isActive ? BARA_BROWN : SECONDARY_TEXT,
                                                whiteSpace: 'nowrap'
                                            }}>{step.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DETAILS GRID */}
                    <Row className="g-3">
                        <Col lg={7}>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee', height: '100%' }}>
                                <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
                                    <span style={{ fontWeight: '700', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", color: PRIMARY_TEXT }}>Order Details</span>
                                    <span style={{ color: SECONDARY_TEXT, fontSize: '13px' }}>Order ID: #KPB-{orderIdFromState}</span>
                                </div>
                                
                                <span style={{ color: SECONDARY_TEXT, fontWeight: '700', fontSize: '11px', display: 'block', marginBottom: '15px', textTransform: 'uppercase' }}>ITEMS ORDERED</span>
                                
                                {cartItems.length > 0 ? (
                                    cartItems.map((item, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex align-items-center gap-3">
                                                    <img src={item.image} width="40" height="40" style={{ borderRadius: '8px', objectFit: 'cover' }} alt={item.name} />
                                                    <div>
                                                        <h6 style={{ margin: 0, fontSize: '14px', color: PRIMARY_TEXT }}>
                                                            <span style={{ color: BARA_GREEN, fontWeight: '800' }}>{item.quantity}x</span> {item.name}
                                                        </h6>
                                                        <small style={{ color: SECONDARY_TEXT, fontSize: '12px' }}>Size: {item.size}</small>
                                                    </div>
                                                </div>
                                                <span style={{ fontWeight: '700', fontSize: '14px', color: PRIMARY_TEXT }}>₱{item.total.toFixed(2)}</span>
                                            </div>
                                            {item.notes && (
                                                <div style={{ background: 'rgba(59, 48, 42, 0.08)', borderLeft: `3px solid ${BARA_BROWN}`, padding: '6px 12px', borderRadius: '6px', marginLeft: '53px', marginTop: '4px' }}>
                                                    <p style={{ margin: 0, color: BARA_BROWN, fontSize: '12px', lineHeight: '1.4' }}>
                                                        <strong style={{ fontWeight: '700' }}>Note: </strong>{item.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted">No items found.</p>
                                )}
                            </div>
                        </Col>

                        <Col lg={5}>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee', height: '100%' }}>
                                <span style={{ fontWeight: '700', fontSize: '16px', display: 'block', marginBottom: '20px', fontFamily: "'DM Sans', sans-serif", color: PRIMARY_TEXT }}>Payment Summary</span>
                                <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span style={{fontWeight: '600'}}>₱{subtotal.toFixed(2)}</span></div>
                                <div className="d-flex justify-content-between mb-4 text-muted"><span>Delivery Fee</span><span>₱{deliveryFee.toFixed(2)}</span></div>
                                
                                <div className="d-flex justify-content-between mb-4" style={{ fontWeight: '800', fontSize: '18px', color: BARA_BROWN }}>
                                    <span>GRAND TOTAL</span><span>₱{grandTotal.toFixed(2)}</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <small style={{ color: SECONDARY_TEXT, fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Payment Method</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F8FF', padding: '5px 10px', borderRadius: '8px', border: '1px solid #D0E3F5' }}>
                                        <div style={{ background: '#007BFF', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', fontSize: '9px' }}>GCash</div>
                                        <Check size={14} className="text-primary" />
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>

                {/* CANCEL MODAL */}
                {showCancelModal && (
                    <div style={modalStyles.overlay}>
                        <div style={modalStyles.modal}>
                            <h2 className="fw-bold mb-1" style={{ fontSize: '20px', fontFamily: "'DM Sans', sans-serif", color: BARA_BROWN }}>Cancel Order</h2>
                            <p style={{ fontSize: '13px', color: SECONDARY_TEXT }}>Please select a reason to cancel your order instantly.</p>
                            <p style={{ fontSize: '12px', color: '#c43737', marginBottom: '15px' }}><em>Cancellation requests are subject to approval.</em></p>
                            
                            <p className="fw-bold mb-2" style={{ fontSize: '13px' }}>Reason for Cancellation *</p>
                            {[ "Found a better price elsewhere", "Ordered by mistake", "High delivery costs", "Need to change shipping address", "Ordered wrong item/size", "Other reason" ].map((r) => (
                                <label key={r} style={modalStyles.radioBox(selectedReason === r)}>
                                    <input type="radio" name="reason" checked={selectedReason === r} onChange={() => setSelectedReason(r)} />
                                    <span style={{ fontSize: '13px' }}>{r}</span>
                                </label>
                            ))}
                            
                            <div className="d-flex gap-2 mt-4">
                                <BootstrapButton variant="light" className="flex-grow-1 fw-bold" style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif", boxShadow: 'none' }} onClick={() => setShowCancelModal(false)}>Keep Order</BootstrapButton>
                                <BootstrapButton variant="danger" className="flex-grow-1 fw-bold" style={{ backgroundColor: '#e54848', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", boxShadow: 'none' }} onClick={requestCancellation}>Cancel Order</BootstrapButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderStatus;