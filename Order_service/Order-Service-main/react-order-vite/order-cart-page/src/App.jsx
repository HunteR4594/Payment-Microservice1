import React, { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  
  const userID = 1; // Example user ID - This is based on our Database, the Order Service DB one where the userID also lives.

  const API_BASE = "https://localhost:7237/api/Cart";
  const ORDER_API_BASE = "https://localhost:7237/api/Orders";

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/cart/${userID}`);
      const cart = await response.json();

      setCartItems(
        cart.cartItems.map(item => ({
          id: item.cart_item_id,
          name: item.item_name,
          size: item.variant_name,
          price: item.variant_price,
          quantity: item.quantity,
          image: item.img_url
        }))
      );

      setCartTotal(cart.subtotal);
    } catch (err) {
      console.error(err);
    }
  };

  // This part is a bit confusing since in the fetch part.
  /*
    First is that HTTPS is used instead of HTTP. This is because the backend API is set to use HTTPS.
    Second you have to make sure that you use the ${userID} for frontend control.
    Third you must use `` back ticks instead of '' single quotes for the fetch URL to work with the ${userID} variable.
  */
  useEffect(() => {
    fetchCart();
  }, [userID]);


  const updateQuantity = async (cartItemID, change) => {
    if (change < 0) {
      // Decrease the quantity
      try {
        await fetch(
          `${API_BASE}/item/${cartItemID}?userID=${userID}&quantityToRemove=1`,
          { method: "DELETE" }
        );

        fetchCart(); // Refresh cart items after update
      } catch (err) {
        console.error(err);
      }

    } else {
      // Increase Quantity
      if (change > 0) {
        try {
          await fetch(
            `${API_BASE}/item/${cartItemID}/increase?userID=${userID}&count=1`,
            { method: "PATCH" }
          );

          fetchCart(); // Refresh cart items after update
        } catch (err) {
          console.error(err);
        }
      }

    }

  }

  const removeItem = async (cartItemID) => {
    try {
      await fetch(
        `${API_BASE}/item/${cartItemID}?userID=${userID}&quantityToRemove=999`,
        { method: "DELETE" }
      );

      fetchCart(); // Refresh cart items after deletion
    } catch (err) {
      console.error(err);
    }
  };


   const placeOrder = async () => {
    try {
      const response = await fetch(
        `${ORDER_API_BASE}/place/order/${userID}`,
        { method: "POST" }
      );

      if (!response.ok)
      {
        throw new Error("Failed to place order");
      }

      const order = await response.json();
      console.log("Order placed successfully:", order);

      fetchCart(); // Refresh cart after placing order

    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="container-fluid p-4" style={{ paddingBottom: "220px" }}>
      <div className="bg-beige d-flex align-items-start pt-3 pb-2 mb-3">
        <button
          className="btn btn-sm text-dark p-0 fs-5 opacity-75"
          style={{ fontWeight: "500" }}
          onClick={() => window.history.back()}
        >
          ◀
        </button>
        <div className="ms-3">
          <h1 className="display-6 fw-bold mb-1">KAPE CART</h1>
          <p className="text-muted mb-0">All your picks in one spot.</p>
        </div>
      </div>

      {/* CART ITEMS */}
      <div className="card shadow-sm border-0" style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
        <div className="card-body p-0">
          {cartItems.map((item) => (
            <div key={item.id} className="d-flex align-items-start py-3 px-3 border-bottom">
              <img
                src={item.image}
                alt={item.name}
                className="me-3 rounded"
                style={{ width: 60, height: 60, objectFit: "cover" }}
              />
              <div className="flex-grow-1">
                <h5 className="mb-1 fw-semibold">{item.name}</h5>
                <small className="text-muted">{item.size}</small>
              </div>

              <div className="text-end">
                <div className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>₱{item.price}</div>
                <div className="d-flex flex-column align-items-end gap-1">
                  <div className="d-flex align-items-center gap-1">
                    <span className="text-muted small">Qty:</span>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-secondary px-2"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        –
                      </button>
                      <span className="btn btn-outline-secondary px-2">{item.quantity}</span>
                      <button
                        className="btn btn-outline-secondary px-2"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-link p-0 mt-1 fs-6 text-decoration-none"
                    onClick={() => removeItem(item.id)}
                    style={{ color: "#c31e2f" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAYMENT DETAILS */}
      <div
        className="card shadow-sm border-0 mt-3"
        style={{
          position: "fixed",
          bottom: "80px",
          left: "1rem",
          right: "1rem",
          zIndex: 999,
          maxWidth: "calc(100% - 2rem)",
          margin: "0 auto",
        }}
      >
        <div className="card-footer bg-white p-3">
          <div className="border-top pt-2">
            <div className="mb-2">
              <small>Payment Details</small>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Estimated Total:</strong>
              <strong>₱{cartTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* PLACE ORDER BUTTON */}
      <div
        className="position-fixed bottom-0 start-0 end-0 p-3 bg-white text-center"
        style={{ zIndex: 1000, borderTop: "1px solid #dee2e6" }}
      >
        <button className="btn btn-brown w-100 py-3 fs-5 fw-bold"
          onClick={placeOrder}>
         Place Order
        </button>
      </div>
    </div>
  );
}