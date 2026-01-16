import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Wallet Pages
import WalletPage from './pages/wallet/WalletPage';
import TopUpPage from './pages/wallet/TopUpPage';
import TopUpCheckout from './pages/wallet/TopUpCheckout';
import TopUpSuccess from './pages/wallet/TopUpSuccess';
import TopUpFailed from './pages/wallet/TopUpFailed';
import MockCheckout from './pages/wallet/MockCheckout';
import OrderDetail from './pages/wallet/OrderDetail';
import TopUpDetail from './pages/wallet/TopUpDetail';
import RecentOrdersPage from './pages/wallet/RecentOrdersPage';
import RecentTopUpPage from './pages/wallet/RecentTopUpPage';

// Checkout Pages
import CheckoutPage from './pages/checkout/CheckoutPage';
import MyVouchers from './pages/checkout/MyVouchers';

// Refund Pages
import RefundPage from './pages/refund/RefundPage';

// Admin Pages
import RefundAdminPage from './pages/admin/RefundAdminPage';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/wallet" replace />} />
          
          {/* Wallet Routes */}
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/topup" element={<TopUpPage />} />
          <Route path="/topup/checkout/:topUpId" element={<TopUpCheckout />} />
          <Route path="/topup/success/:topUpId" element={<TopUpSuccess />} />
          <Route path="/topup/failed/:topUpId" element={<TopUpFailed />} />
          <Route path="/mock-checkout/:topUpId" element={<MockCheckout />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/topup-detail/:topUpId" element={<TopUpDetail />} />
          <Route path="/recent-orders" element={<RecentOrdersPage />} />
          <Route path="/recent-topup" element={<RecentTopUpPage />} />
          
          {/* Checkout Routes */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/vouchers" element={<MyVouchers />} />
          
          {/* Refund Routes */}
          <Route path="/refund" element={<RefundPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/refunds" element={<RefundAdminPage />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/wallet" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
