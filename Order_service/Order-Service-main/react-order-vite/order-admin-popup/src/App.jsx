import { useState } from "react";
import UpdateOrderStatusModal from "./components/UpdateOrderStatusModal";
import ReviewCancellationModal from "./components/ReviewCancellationModal";
import ApproveCancellationModal from "./components/ApproveCancellationModal";
import DeclineCancellationModal from "./components/DeclineCancellationModal";

function App() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div style={{ padding: 40, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: 20, color: '#1C1C1C' }}>Popup Tester</h2>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveModal("update")}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#3B302A',
            color: '#F5F5F5',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif'
          }}
        >
          Open Update Order Status
        </button>

        <button 
          onClick={() => setActiveModal("review")}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#3B302A',
            color: '#F5F5F5',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif'
          }}
        >
          Open Review Cancellation
        </button>
      </div>

      {/* MODALS */}
      {activeModal === "update" && (
        <UpdateOrderStatusModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "review" && (
        <ReviewCancellationModal
          onApprove={() => setActiveModal("approve")}
          onDecline={() => setActiveModal("decline")}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "approve" && (
        <ApproveCancellationModal 
          onClose={() => setActiveModal(null)}
          onBack={() => setActiveModal("review")}
        />
      )}

      {activeModal === "decline" && (
        <DeclineCancellationModal 
          onClose={() => setActiveModal(null)}
          onBack={() => setActiveModal("review")}
        />
      )}
    </div>
  );
}

export default App;
