import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import WalletPage from './pages/WalletPage';
import TopUpPage from './pages/TopUpPage';
import TopUpCheckout from './pages/TopUpCheckout';
import TopUpSuccess from './pages/TopUpSuccess';
import TopUpFailed from './pages/TopUpFailed';
import RecentOrdersPage from './pages/RecentOrdersPage';
import RecentTopUpPage from './pages/RecentTopUpPage';
import OrderDetail from './pages/OrderDetail';
import TopUpDetail from './pages/TopUpDetail';
import MockCheckout from './pages/MockCheckout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to wallet */}
        <Route path="/" element={<Navigate to="/wallet" replace />} />
        
        {/* Main Pages */}
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/topup" element={<TopUpPage />} />
        <Route path="/topup/checkout/:topUpId" element={<TopUpCheckout />} />
        <Route path="/topup/success/:topUpId" element={<TopUpSuccess />} />
        <Route path="/topup/failed/:topUpId" element={<TopUpFailed />} />
        
        {/* Mock Checkout (for testing without PayMongo) */}
        <Route path="/mock-checkout/:topUpId" element={<MockCheckout />} />
        
        {/* Detail Pages */}
        <Route path="/order/:orderId" element={<OrderDetail />} />
        <Route path="/topup-detail/:topUpId" element={<TopUpDetail />} />
        
        {/* Recent Activity Pages */}
        <Route path="/recent-orders" element={<RecentOrdersPage />} />
        <Route path="/recent-topup" element={<RecentTopUpPage />} />
        
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/wallet" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
