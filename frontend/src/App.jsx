import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Ledger from './pages/Ledger';
import Integrity from './pages/Integrity';
import AuditLog from './pages/AuditLog';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/integrity" element={<Integrity />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
