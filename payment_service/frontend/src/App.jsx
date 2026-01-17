import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { CurrentUserProvider } from './context/currentUser';
import RequireAdmin from './components/RequireAdmin';

// Layout
import MainLayout from './layouts/MainLayout';

// Dashboard
import Dashboard from './pages/Dashboard';

// Wallet Feature Pages
import WalletPage from './pages/wallet/WalletPage';
import TopUpPage from './pages/wallet/TopUpPage';
import TopUpCheckout from './pages/wallet/TopUpCheckout';
import TopUpSuccess from './pages/wallet/TopUpSuccess';
import TopUpFailed from './pages/wallet/TopUpFailed';
import RecentOrdersPage from './pages/wallet/RecentOrdersPage';
import RecentTopUpPage from './pages/wallet/RecentTopUpPage';
import OrderDetail from './pages/wallet/OrderDetail';
import TopUpDetail from './pages/wallet/TopUpDetail';
import MockCheckout from './pages/wallet/MockCheckout';

// Checkout Feature Pages
import CheckoutPage from './pages/checkout/CheckoutPage';
import MyVouchers from './pages/checkout/MyVouchers';

// Refund Feature Pages
import RefundPage from './pages/refund/RefundPage';

// Admin Feature Pages
import RefundAdminPage from './pages/admin/RefundAdminPage';

function App() {
  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes with Navigation Layout */}
          <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
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
          <Route path="/checkout/:orderId" element={<CheckoutPage />} />
          <Route path="/vouchers" element={<MyVouchers />} />
          
          {/* Refund Routes */}
          <Route path="/refund" element={<RefundPage />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/refunds"
            element={
              <RequireAdmin>
                <RefundAdminPage />
              </RequireAdmin>
            }
          />
        </Route>
        
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CurrentUserProvider>
  );
}

export default App;
