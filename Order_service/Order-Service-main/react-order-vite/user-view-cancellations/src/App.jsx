import { useState } from "react";
import "./App.css";


function App() {
  const [showPopup, setShowPopup] = useState(true);
  const [selectedReason, setSelectedReason] = useState("");


  return (
    <>
      {showPopup && (
        <div className="modal-overlay">
          <div className="cancel-order-modal">


            <h2>Cancel Order</h2>
            <p className="modal-sub">
              Please select a reason to cancel you order instantly.
              </p>
             
            <p className="approval-note">
             <em>Cancellation requests are subject to approval.</em>
            </p>


            {/* REASONS */}
            <p className="label">Reason for Cancellation *</p>
            {[
              "Found a better price elsewhere",
              "Ordered by mistake",
              "High delivery costs",
              "Need to change shipping address",
              "Ordered wrong item/size",
              "Other reason",
            ].map((r) => (
            <label
            key={r}
            className={
                "radio-box " +
                (selectedReason === r ? "selected-red" : "")
         }
       >
           <input
             type="radio"
             name="reason"
             checked={selectedReason === r}
             onChange={() => setSelectedReason(r)}
          />
            <span>{r}</span>
            </label>
        ))}






            {selectedReason === "Other reason" && (
               <textarea
                  placeholder="Please provide additional details for your cancellation..."
               />
           )}
           
            {/* POLICY */}
            <div className="policy-box">
              <strong>Cancellation Policy</strong>
              <p>
                Once cancelled, refunds are processed within 5–7 business days.
              </p>
            </div>


            {/* ACTIONS */}
            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setShowPopup(false)}
              >
                Keep Order
              </button>
              <button
                className="btn-danger"
                onClick={() => setShowPopup(false)}
              >
                Cancel Order
              </button>
            </div>


          </div>
        </div>
      )}
    </>
  );
}


export default App;



