import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OrderCart from "./pages/order/OrderCart/OrderCart";
import OrderStatus from "./pages/order/OrderStatus/OrderStatus";
import OrderHistory from "./pages/order/OrderHistory/OrderHistory";
import OrderDetails from "./pages/order/OrderDetails/OrderDetails";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import AdminCancellations from "./pages/admin/AdminCancellations/AdminCancellations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/order/order" replace />} />
        <Route path="/order/order" element={<OrderCart />} />
        <Route path="/order/orderstatus" element={<OrderStatus />} />
        <Route path="/order/orderhistory" element={<OrderHistory />} />
        <Route path="/order/orderdetails" element={<OrderDetails />} />
        <Route path="/admin/admindashboard" element={<AdminDashboard />} />
        <Route path="/admin/admincancellations" element={<AdminCancellations />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
