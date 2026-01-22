// OrderDetails.jsx
// Page: Order Details view — shows order items, shipping info and payment summary.
// Short, focused comments added throughout for clarity.

import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link, useLocation, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./OrderDetails.css";

// Assets used in the page
import kapebara_logo_transparent_Pic from "./kapebara logo transparent.png";
import userIcon from "./user-icon.png";
import locationIcon from "./location-icon.png";
import contactIcon from "./contact-icon.png";
import kapebara_cart_Pic from "./kapebara cart.jpg";

// API base used by this page
const API_ROOT = "https://localhost:7237/api";

/* -------------------------
   Utility / formatting helpers
   ------------------------- */

// Format full date + time for display
function formatDateDisplay(dateString) {
    if (!dateString) return "No date";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid date";
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${datePart} - ${hours}:${minutes} ${ampm}`;
}

// Format only date
function formatDateOnly(dateString) {
    if (!dateString) return "No date";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Format time only
function formatTimeOnly(dateString) {
    if (!dateString) return "Unavailable";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Unavailable";
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
}

// Normalize backend status values (number/string) to friendly labels
function formatStatusLabel(raw) {
    if (raw === null || raw === undefined) return "";

    const numeric = typeof raw === "number" ? raw : Number(String(raw).trim());
    if (!Number.isNaN(numeric)) {
        switch (numeric) {
            case 1:
                return "Placed";
            case 2:
                return "Preparing";
            case 3:
                return "Ready for Pickup";
            case 4:
                return "In Transit";
            case 5:
                return "Delivered";
            case 6:
                return "Failed";
            case 7:
                return "Cancelled";
            default:
                return String(raw);
        }
    }

    // Normalize typical string formats into readable label
    let s = String(raw).trim();
    s = s.replace(/^["']|["']$/g, "");
    s = s.replace(/[_\-]/g, " ");
    s = s.replace(/([a-z])([A-Z])/g, "$1 $2");
    s = s.replace(/\s+/g, " ").trim();

    const lower = s.toLowerCase();

    if (lower.includes("ready") && lower.includes("pickup")) return "Ready for Pickup";
    if (lower.includes("in") && lower.includes("transit")) return "In Transit";
    if (lower.includes("cancel")) return "Cancelled";
    if (lower.includes("failed")) return "Failed";
    if (lower.includes("deliver")) return "Delivered";
    if (lower.includes("completed")) return "Completed";
    if (lower.includes("prepar")) return "Preparing";

    return s
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

// Map status label to Bootstrap text classes (used for color)
function getStatusTextClass(raw) {
    const label = formatStatusLabel(raw).toLowerCase();
    if (label === "completed" || label === "delivered") return "text-success";
    if (label === "failed" || label === "cancelled") return "text-danger";
    return "text-warning";
}

/* -------------------------
   Data mapping helpers
   ------------------------- */

// Normalize different API shapes for an order item into the view model used by this page.
// Picks a sensible fallback for image and note fields.
function mapOrderItemToView(it) {
    // Prefer special_instructions (DB column) but accept several variants.
    const note = (it.special_instructions ?? it.specialInstruction ?? it.specialInstructions ?? it.special_instruction ?? it.note ?? it.notes ?? it.instructions ?? "")
        .toString()
        .trim();

    // Normalize image URL property variations and provide fallback asset.
    const image = it.img_url ?? it.image ?? it.imgUrl ?? it.img ?? "/assets/matchabara-cold-brew.png";

    return {
        id: it.order_item_id ?? it.id ?? it.cart_item_id ?? it.productId ?? `${it.id ?? "itm"}`,
        name: it.item_name ?? it.name ?? it.productName ?? it.product_name ?? "Item",
        size: it.variant_name ?? it.size ?? it.variant ?? "Regular",
        qty: it.quantity ?? it.qty ?? it.count ?? it.item_count ?? 1,
        price: it.variant_price ?? it.price ?? it.unit_price ?? it.total ?? 0,
        image,
        note
    };
}

/* -------------------------
   Network helpers
   ------------------------- */

// Fetch all order items and filter those that belong to the given orderId.
// Returns mapped items suitable for rendering.
async function fetchItemsForOrder(orderId) {
    try {
        const res = await fetch(`${API_ROOT}/General/orderitems`);
        if (!res.ok) return [];
        const all = await res.json();

        // Keep a lightweight debug log during development.
        console.debug("Fetched orderitems count:", all.length, " sample:", all.slice(0, 3));

        // Support different FK naming conventions in the payload.
        const matches = all.filter((it) => it.orders_id == orderId || it.order_id == orderId || it.orderId == orderId);
        console.debug("Matched items for order", orderId, matches);

        return matches.map(mapOrderItemToView);
    } catch (e) {
        console.error("Failed to fetch order items:", e);
        return [];
    }
}

/* -------------------------
   Component
   ------------------------- */

const OrderDetails = () => {
    // Read route state / params for order context
    const location = useLocation();
    const params = useParams();
    const stateOrder = location.state && location.state.order ? location.state.order : null;
    const stateOrderId = location.state && location.state.orderId ? location.state.orderId : null;
    const paramOrderId = params?.id;

    // Local state
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(Boolean(!stateOrder && (stateOrderId || paramOrderId)));
    const [error, setError] = useState(null);
    const orderIdToFetch = stateOrder ? stateOrder.orders_id || stateOrder.id : stateOrderId || paramOrderId;

    /* Duplicate fetchItemsForOrder definition inside component scope to ensure closure safety.
       (This mirrors the top-level helper so both calls work; keep one if you prefer.) */
    async function fetchItemsForOrderLocal(orderId) {
        try {
            const res = await fetch(`${API_ROOT}/General/orderitems`);
            if (!res.ok) return [];
            const all = await res.json();
            console.debug("Fetched orderitems count:", all.length, " sample:", all.slice(0, 3));
            const matches = all.filter((it) => it.orders_id == orderId || it.order_id == orderId || it.orderId == orderId);
            console.debug("Matched items for order", orderId, matches);
            return matches.map(mapOrderItemToView);
        } catch (e) {
            console.error("Failed to fetch order items:", e);
            return [];
        }
    }

    // Effect: fetch order when route/state changes. Also fetch and attach order items.
    useEffect(() => {
        let mounted = true;

        // If order object was passed in route state, map it immediately and then try to fetch items.
        if (stateOrder) {
            const base = mapIncomingToView(stateOrder, []);
            setOrder(base);
            (async () => {
                const fetchedItems = await fetchItemsForOrderLocal(base.id);
                if (!mounted) return;
                if (fetchedItems.length > 0) {
                    setOrder((prev) => ({ ...(prev || base), items: fetchedItems }));
                }
            })();
            setLoading(false);
            return () => { mounted = false; };
        }

        // If there's no order id to load, stop loading.
        if (!orderIdToFetch) {
            setLoading(false);
            return () => { mounted = false; };
        }

        // Otherwise fetch order and its items from API.
        const abort = new AbortController();
        async function fetchOrder() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_ROOT}/General/orders/${orderIdToFetch}`, { signal: abort.signal });
                if (!res.ok) {
                    if (res.status === 404) {
                        setError("Order not found.");
                        setOrder(null);
                        setLoading(false);
                        return;
                    }
                    throw new Error(`Server returned ${res.status}`);
                }
                const data = await res.json();

                // fetch related items and map
                const items = await fetchItemsForOrderLocal(data.orders_id ?? data.id ?? orderIdToFetch);
                if (!mounted) return;
                setOrder(mapIncomingToView(data, items));
            } catch (e) {
                if (e.name !== "AbortError") {
                    console.error("Failed to fetch order:", e);
                    setError("Failed to load order details.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchOrder();
        return () => { mounted = false; abort.abort(); };
    }, [stateOrder, orderIdToFetch]);

    // Map incoming order payload (various shapes) into the page view model
    function mapIncomingToView(src, itemsOverride) {
        const id = src.orders_id ?? "unknown";
        const placed = src.placed_at ?? null;

        // Build timeline fields (best-effort)
        const paymentRaw = src.payment_time ?? src.paid_at ?? src.paymentCompletedAt ?? src.payment_completed_at ?? null;
        const shippedRaw = src.shipped_at ?? src.dispatched_at ?? src.shippedAt ?? null;
        const fulfilledRaw = src.fulfilled_at ?? null;

        const timeline = {
            orderTime: formatTimeOnly(placed),
            paymentTime: formatTimeOnly(paymentRaw),
            shippedTime: formatTimeOnly(shippedRaw),
            completedTime: formatTimeOnly(fulfilledRaw)
        };

        // Normalize items from either the provided override, the order payload, or fallback
        const itemsRaw =
            itemsOverride ??
            src.items ??
            (Array.isArray(src.orderItems) ? src.orderItems : undefined) ??
            src.itemsOrdered ??
            src.item_list ??
            [];

        const mappedItems =
            Array.isArray(itemsRaw) && itemsRaw.length > 0
                ? itemsRaw.map((it) => mapOrderItemToView(it))
                : [
                    {
                        id: "n/a",
                        name: src.name ?? "Unknown item",
                        size: "Regular",
                        qty: src.item_count ?? 0,
                        price: src.total_cost ?? 0,
                        image: "/assets/matchabara-cold-brew.png",
                        note: src.special_instructions ?? ""
                    }
                ];

        // Lightweight debug — remove in production
        try {
            console.debug("mapIncomingToView: itemsRaw sample:", Array.isArray(itemsRaw) ? itemsRaw.slice(0, 3) : itemsRaw);
            console.debug("mapIncomingToView: mappedItems sample:", mappedItems.slice(0, 3));
        } catch (e) {
            console.debug("mapIncomingToView debug error", e);
        }

        return {
            id,
            date: formatDateDisplay(placed),
            dateOnly: formatDateOnly(placed),
            status: src.statusName ?? src.displayStatus ?? (src.status ? src.status : "Unknown"),
            customer: {
                name: src.customerName ?? "Guest User",
                address: src.customer_address ?? src.customerAddress ?? "Customer address not available",
                phone: src.customer_phone ?? src.customerPhone ?? "N/A"
            },
            timeline,
            items: mappedItems,
            payment: {
                method: src.paymentMethod ?? "GCash",
                last4: src.cardLast4 ?? "----",
                deliveryFee: src.delivery_fee ?? src.deliveryFee ?? 0
            },
            meta: src
        };
    }

    // Try to resolve a note for a view item. Prefer normalized note, otherwise inspect raw order payload.
    function findNoteForItem(item) {
        if (item?.note && String(item.note).trim().length > 0) return String(item.note).trim();

        // Raw candidate arrays that might contain original order-item objects
        const candidates =
            order?.meta?.orderItems ??
            order?.meta?.items ??
            order?.meta?.itemsOrdered ??
            order?.meta?.item_list ??
            order?.items ??
            [];

        if (!Array.isArray(candidates) || candidates.length === 0) return "";

        // Attempt to match the view item to the raw object using common id fields
        const match = candidates.find((r) => {
            const rawIds = [r.order_item_id, r.id, r.cart_item_id, r.productId, r.product_id, r.cart_id];
            const viewIds = [item.id, item.productId, item.cart_item_id, item.order_item_id];
            return rawIds.some((rid) => viewIds.some((vid) => vid !== undefined && rid != null && String(rid) == String(vid)));
        });

        if (!match) return "";

        // Prefer special_instructions, otherwise fall back to common note fields
        return (
            (match.special_instructions ?? match.specialInstruction ?? match.specialInstructions ?? match.note ?? match.notes ?? match.instructions ?? "")
                .toString()
                .trim()
        );
    }

    // Loading / error / empty guards
    if (loading) {
        return (
            <div className="order-details-container">
                <p>Loading order details…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-details-container">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-details-container">
                <p>No order selected. Open this page from Order History (we expect Link state or a route param).</p>
            </div>
        );
    }

    // Compute totals for summary
    const subtotal = order.items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
    const grandTotal = subtotal + (order.payment.deliveryFee || 0);

    const friendlyStatus = formatStatusLabel(order.status);
    const statusTextClass = getStatusTextClass(order.status);

    // Disable refund button when order is cancelled
    const isCancelled = formatStatusLabel(order.status).toLowerCase() === "cancelled";

    return (
        <div className="order-details-container">

            {/* HEADER: page title + navbar */}
            <div className="header-section">
                <h1 className="page-title">Order Details</h1>

                {/* Navbar: main site navigation and cart icon */}
                <Navbar expand="lg" className="navbar" fixed="top">
                    <Container>
                        <Navbar.Brand as={Link} to="/">
                            <img src={kapebara_logo_transparent_Pic} height="30" className="d-inline-block align-text-top" />
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="center-nav" />
                        <Navbar.Collapse id="center-nav" className="w-100 justify-content-center">
                            <Nav className="ms-auto gap-4 align-items-center">
                                <Nav.Link as={Link} to="/order/order">Home</Nav.Link>
                                <Nav.Link as={Link} to="/order/order">Menu</Nav.Link>
                                <Nav.Link as={Link} to="/order/orderhistory">My Orders</Nav.Link>
                                <Nav.Link as={Link} to="/admin/admindashboard">My Profile</Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="#cart"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // setIsCartOpen toggler would go here if implemented
                                    }}
                                >
                                    <img src={kapebara_cart_Pic} height="30" style={{ objectFit: "contain" }} />
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>

            {/* MAIN CONTENT: left = items, right = shipping & payment */}
            <div className="main-content">
                {/* LEFT COLUMN */}
                <div className="order-item-card">
                    <div className="orders-section">
                        <h4 className="section-header">ORDERS</h4>

                        {order.items.map((item) => (
                            <React.Fragment key={item.id}>
                                <div className="order-item">
                                    <img src={item.image} alt={item.name} className="product-image" />
                                    <div className="item-details">
                                        <span className="quantity">{item.qty}x</span>
                                        <div className="item-name">{item.name}</div>
                                        <div className="item-size">{item.size}</div>
                                    </div>
                                    <span className="price">₱{(item.price || 0).toFixed(2)}</span>
                                </div>

                                {/* Render note if present for this item */}
                                {(() => {
                                    const noteText = findNoteForItem(item);
                                    return noteText && noteText.length > 0 ? (
                                        <div className="order-note">
                                            <h4>Order Note:</h4>
                                            <p>"{noteText}"</p>
                                        </div>
                                    ) : null;
                                })()}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* FOOTER: status, order id, refund CTA */}
                    <div className="order-footer">
                        <div className="left-footer">
                            <span className={`status-badge ${statusTextClass}`} style={{ fontWeight: 700 }}>
                                {friendlyStatus}
                            </span>

                            <div className="order-id">
                                <span>Order ID</span>{" "}
                                <span className="id-number">
                                    {order.id} - {order.dateOnly}
                                </span>
                            </div>
                        </div>

                        <button
                            className="request-for-refund-btn"
                            disabled={isCancelled}
                            aria-disabled={isCancelled}
                            title={isCancelled ? "Refund unavailable for cancelled orders" : "Request for Refund"}
                        >
                            Request for Refund
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: shipping info + payment summary */}
                <div className="right-column">
                    <div className="shipping-info-card">
                        <h4 className="section-header">SHIPPING INFORMATION</h4>

                        <div className="customer-info">
                            <div className="info-row">
                                <img src={userIcon} className="icon-image" alt="user" />
                                <span className="customer-name">{order.customer.name}</span>
                            </div>

                            <div className="info-row">
                                <img src={locationIcon} className="icon-image" alt="location" />
                                <span style={{ whiteSpace: "pre-wrap" }}>{order.customer.address}</span>
                            </div>

                            <div className="info-row">
                                <img src={contactIcon} className="icon-image" alt="phone" />
                                <span>{order.customer.phone}</span>
                            </div>
                        </div>

                        <div className="timeline" style={{ marginTop: 12 }}>
                            <div className="timeline-item">
                                <span className="timeline-label">Order Time</span>
                                <span className="timeline-value">{order.timeline.orderTime ?? "Unavailable"}</span>
                            </div>
                            <div className="timeline-item">
                                <span className="timeline-label">Payment Time</span>
                                <span className="timeline-value">{order.timeline.paymentTime ?? "Unavailable"}</span>
                            </div>
                            <div className="timeline-item">
                                <span className="timeline-label">Shipped Time</span>
                                <span className="timeline-value">{order.timeline.shippedTime ?? "Unavailable"}</span>
                            </div>
                            <div className="timeline-item">
                                <span className="timeline-label">Completed Time</span>
                                <span className="timeline-value">{order.timeline.completedTime ?? "Unavailable"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="payment-summary-card" style={{ marginTop: 16 }}>
                        <h4 className="section-header">PAYMENT SUMMARY</h4>

                        <div className="payment-summary">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₱{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Fee</span>
                                <span>₱{order.payment.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>GRAND TOTAL</span>
                                <span>₱{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="payment-method">
                            <h4 className="section-header">PAYMENT METHOD</h4>
                            <div className="payment-card">
                                <div className="gcash-badge">{order.payment.method}</div>
                                <span className="card-number">******* {order.payment.last4}</span>
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