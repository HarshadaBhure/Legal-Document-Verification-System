import React from 'react';
import { NavLink } from 'react-router-dom';
import { Upload, ShieldCheck, Database, Lock, Bell } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          <Lock size={24} color="#58a6ff" />
          BlockVerify
        </h1>
      </div>
      <nav className="nav-links">
        <NavLink 
          to="/register" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Upload size={20} />
          Register Document
        </NavLink>
        <NavLink 
          to="/verify" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ShieldCheck size={20} />
          Verify Document
        </NavLink>
        <NavLink 
          to="/ledger" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Database size={20} />
          Blockchain Ledger
        </NavLink>
        <NavLink 
          to="/integrity" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Lock size={20} />
          Chain Integrity
        </NavLink>
        <NavLink 
          to="/audit" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Bell size={20} />
          Security Audit
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
