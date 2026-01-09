import { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

function OrderSuccessPage() {
  const [showModal, setShowModal] = useState(false);

  {/* TTEMPORARY PAGE */}
  return (
    <div className="page-container">
      {/* Button to trigger modal */}
      <button className="trigger-btn" onClick={() => setShowModal(true)}>
        order success 
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Success Icon */}
            <div className="success-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>

            {/* Title */}
            <h1 className="modal-title">Order Placed Successfully</h1>

            {/* Order Number */}
            <p className="order-number">Order No. [orderNumber]</p>

            {/* Total */}
            <p className="total">Total: [PRICE].00</p>

            {/* Coins Earned */}
            <p className="coins-earned">
              <i className="bi bi-coin"></i>
              <span>Coins earned: [x] coins</span>
            </p>

            {/* Estimated Delivery */}
            <p className="delivery-estimate">Estimated Delivery: [Date], [time]</p>

            {/* View Order Status Button */}
            <button className="view-order-btn" onClick={() => setShowModal(false)}>
              View order status
            </button>

            {/* Back to Main Menu Link */}
            <button className="back-link" onClick={() => setShowModal(false)}>
              Back to Main Menu
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

        /* Modal Overlay - Transparent with blur */
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

        /* Modal Content - More transparent white */
        .modal-content {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 3rem 2.5rem;
          max-width: 450px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Success Icon */
        .success-icon {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }

        .success-icon i {
          font-size: 5rem;
          color: #2d2d2d;
        }

        /* Title */
        .modal-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2d2d2d;
          margin-bottom: 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* Order Number */
        .order-number {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 1rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Total */
        .total {
          font-size: 1rem;
          color: #2d2d2d;
          margin-bottom: 0.75rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
        }

        /* Coins Earned */
        .coins-earned {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          color: #2d2d2d;
          margin-bottom: 0.75rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .coins-earned i {
          font-size: 1.2rem;
          color: #2d2d2d;
        }

        /* Delivery Estimate */
        .delivery-estimate {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 2rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* View Order Button */
        .view-order-btn {
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
          margin-bottom: 1rem;
          transition: background-color 0.2s;
        }

        .view-order-btn:hover {
          background-color: #2d2420;
        }

        /* Back Link */
        .back-link {
          background: none;
          border: none;
          color: #2d2d2d;
          font-size: 0.95rem;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .back-link:hover {
          opacity: 0.7;
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .modal-content {
            padding: 2rem 1.5rem;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .success-icon i {
            font-size: 4rem;
          }
        }
      `}</style>
    </div>
  );
}

export default OrderSuccessPage;