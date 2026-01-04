import { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

function PaymentMethodPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('kapebara');

  return (
    <div className="page-container">
      {/* Button to trigger modal */}
      <button className="trigger-btn" onClick={() => setShowModal(true)}>
        Select Payment Method
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="close-btn" onClick={() => setShowModal(false)}>
              <i className="bi bi-x-circle"></i>
            </button>

            {/* Title */}
            <h2 className="modal-title">Select payment method</h2>

            {/* Payment Options */}
            <div className="payment-options">
              
              {/* Kapebara Wallet */}
              <label className="payment-option">
                <div className="payment-info">
                  <div className="payment-logo">
                    
                    <img src="/kapebara-logo-2.png" alt="Kapebara" className="logo-img" />
                  </div>
                  <div className="payment-details">
                    <div className="payment-name">My Kapebara Wallet</div>
                    {selectedMethod === 'kapebara' && (
                      <div className="payment-balance">your total balance is [Balance]</div>
                    )}
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="kapebara"
                  checked={selectedMethod === 'kapebara'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                />
              </label>

              {/* Credit/Debit Card */}
              <label className="payment-option">
                <div className="payment-info">
                  <div className="card-logos">
                    
                    <img src="/visa-logo.png" alt="Visa" className="card-logo" />
                    <img src="/mastercard-logo.png" alt="Mastercard" className="card-logo" />
                  </div>
                  <div className="payment-details">
                    <div className="payment-name">Credit/Debit Card</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={selectedMethod === 'card'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                />
              </label>

              {/* Card Form - Shows when card is selected */}
              {selectedMethod === 'card' && (
                <div className="card-form">
                  <div className="form-row">
                    <input type="text" placeholder="Last name" className="form-input" />
                    <input type="text" placeholder="First name" className="form-input" />
                  </div>
                  <div className="form-row">
                    <input type="text" placeholder="Email" className="form-input" />
                    <input type="text" placeholder="Card Number" className="form-input" />
                  </div>
                  <div className="form-row">
                    <input type="text" placeholder="MM" className="form-input" />
                    <input type="text" placeholder="YYYY" className="form-input" />
                    <input type="text" placeholder="CVV" className="form-input" />
                  </div>
                </div>
              )}

              {/* E-wallet */}
              <label className="payment-option">
                <div className="payment-info">
                  <div className="ewallet-logos">
                    
                    <img src="/gcash-logo.png" alt="GCash" className="ewallet-logo" />
                    <img src="/maya-logo.png" alt="Maya" className="ewallet-logo" />
                  </div>
                  <div className="payment-details">
                    <div className="payment-name">E-wallet</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="ewallet"
                  checked={selectedMethod === 'ewallet'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                />
              </label>

              {/* Other online payment method */}
              <label className="payment-option">
                <div className="payment-info">
                  <div className="payment-details">
                    <div className="payment-name">Other online payment method</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="other"
                  checked={selectedMethod === 'other'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                />
              </label>
            </div>

            {/* Confirm Button */}
            <button className="confirm-btn">
              Confirm Payment
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        .page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white; 
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .trigger-btn {
          padding: 1rem 2rem;
          background-color: #2d2d2d;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .trigger-btn:hover {
          transform: translateY(-2px);
          background-color: #1a1a1a;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          
        }

        /* Payment Modal */
        .payment-modal {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2.5rem 2rem;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Close Button */
        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn i {
          font-size: 1.5rem;
          color: #2d2d2d;
        }

        .close-btn:hover i {
          color: #666;
        }

        /* Title */
        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d2d2d;
          margin-bottom: 1.5rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* Payment Options */
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .payment-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255, 255, 255, 0.5);
        }

        .payment-option:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: #2d2d2d;
        }

        .payment-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .payment-logo, .card-logos, .ewallet-logos {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-img {
          height: 50px;
          width: auto;
          object-fit: contain;
        }

        .card-logo, .ewallet-logo {
          height: 18px;
          width: auto;
          object-fit: contain;
        }

        .payment-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .payment-name {
          font-weight: 600;
          color: #2d2d2d;
          font-size: 0.95rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .payment-balance {
          font-size: 0.8rem;
          color: #666;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .payment-option input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #2d2d2d;
        }

        /* Card Form */
        .card-form {
          padding: 1rem;
          background: rgba(249, 249, 249, 0.8);
          border-radius: 0.75rem;
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .form-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: rgba(255, 255, 255, 0.9);
        }

        .form-input.full-width {
          width: 100%;
        }

        .form-input:focus {
          outline: none;
          border-color: #2d2d2d;
        }

        .form-input::placeholder {
          color: #999;
        }

        /* Confirm Button */
        .confirm-btn {
          width: 100%;
          padding: 1rem;
          background-color: #3B302A;
          color: white;
          border: none;
          border-radius: 2rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background-color 0.2s;
        }

        .confirm-btn:hover {
          background-color: #2d2420;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .payment-modal {
            padding: 2rem 1.5rem;
          }

          .modal-title {
            font-size: 1.3rem;
          }

          .form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default PaymentMethodPage;