import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WalletPage from "./WalletPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WalletPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
