import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WalletPage from "./WalletPage";
import TopUpPage from "./TopUpPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WalletPage />} />
        <Route path="/topup" element={<TopUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
