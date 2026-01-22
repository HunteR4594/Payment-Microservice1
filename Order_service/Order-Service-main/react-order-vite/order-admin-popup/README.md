# Order Admin Popup

Admin modals for handling cancellation requests and updating order status. These components are ready to integrate with your backend.

## Components

### ReviewCancellationModal

Shows all the order details and cancellation info so admins can review before making a decision.

**Props:**
- `onApprove` - fires when "Cancel Order" button is clicked
- `onDecline` - fires when "Keep Order" button is clicked  
- `onClose` - closes the modal
- `orderData` (optional) - pass order data here, otherwise uses mock data

**Button Labels:**
- "Keep Order" - gray button, keeps the order active
- "Cancel Order" - red button, approves the cancellation

**Order Data Format:**
```javascript
{
  orderId: "123-456-789",
  orderDate: "2025-10-13",
  customerName: "Bruno Decano",
  orderStatus: "Looking for a Rider",
  cancellationDate: "2025-10-13",
  reason: "Looking for a Rider",
  customerNotes: "Looking for a Rider"
}
```

### UpdateOrderStatusModal

Lets admins change the order status. All the order info is read-only except for the status dropdown.

**Props:**
- `onClose` - closes the modal
- `orderData` (optional) - order data object
- `onUpdateStatus` (optional) - custom callback for status updates
- `initialStatus` (optional) - starting status value

**Status Options:**
- Preparing
- Out for Delivery
- Delivered
- Cancelled

The dropdown has a custom arrow and proper styling so it doesn't get cut off.

### ApproveCancellationModal

Confirmation popup that appears when admin clicks "Cancel Order". Asks "Are you sure you want to approve the cancellation?"

**Props:**
- `onClose` - closes everything
- `onConfirm` (optional) - runs when confirmed
- `onBack` - goes back to ReviewCancellationModal (when "Not yet" is clicked)
- `orderId` (optional) - for API calls
- `onApproveCancellation` (optional) - custom API handler

**Buttons:**
- "Not yet" - red button, goes back to review modal
- "Yes, I am" - gray button, confirms the cancellation

### DeclineCancellationModal

Confirmation popup for when admin clicks "Keep Order". Asks "Are you sure you want to decline the cancellation?"

**Props:**
- `onClose` - closes everything
- `onConfirm` (optional) - runs when confirmed
- `onBack` - goes back to ReviewCancellationModal (when "Not yet" is clicked)
- `orderId` (optional) - for API calls
- `onDeclineCancellation` (optional) - custom API handler

**Buttons:**
- "Not yet" - red button, goes back to review modal
- "Yes, I am" - gray button, confirms keeping the order

## Backend API Endpoints

The components expect these endpoints:

**Update Order Status:**
```
PUT /api/orders/{orderId}/status
Content-Type: application/json

Body: { "status": "Preparing" }
```

**Approve Cancellation:**
```
POST /api/orders/{orderId}/cancel/approve
```

**Decline Cancellation:**
```
POST /api/orders/{orderId}/cancel/decline
```

## Usage Example

```javascript
import ReviewCancellationModal from './components/ReviewCancellationModal';
import ApproveCancellationModal from './components/ApproveCancellationModal';
import DeclineCancellationModal from './components/DeclineCancellationModal';

function AdminDashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Get order data from your API
  useEffect(() => {
    fetch(`http://localhost:8080/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => setSelectedOrder(data));
  }, [orderId]);

  return (
    <>
      {activeModal === 'review' && (
        <ReviewCancellationModal
          orderData={selectedOrder}
          onApprove={() => setActiveModal('approve')}
          onDecline={() => setActiveModal('decline')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'approve' && (
        <ApproveCancellationModal
          orderId={selectedOrder?.orderId}
          onBack={() => setActiveModal('review')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'decline' && (
        <DeclineCancellationModal
          orderId={selectedOrder?.orderId}
          onBack={() => setActiveModal('review')}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
```

## Testing

The `App.jsx` file is just for testing the modals. Replace it with your actual admin dashboard when integrating. All components work with mock data if you don't pass `orderData`, so you can test the UI without backend first.
