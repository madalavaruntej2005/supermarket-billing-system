import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Users,
  Boxes,
  BarChart3,
  Settings,
  LogOut,
  Store,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header gap-3">
        <div className="logo-badge">
          <Store size={20} />
        </div>
        <div>
          <div className="logo-text">SuperMart</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
            POS & Inventory
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/billing"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <ShoppingCart size={18} />
          <span>Billing / POS</span>
        </NavLink>

        <NavLink
          to="/invoices"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Invoices</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Customers</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <Boxes size={18} />
          <span>Inventory</span>
        </NavLink>

        {user?.is_admin && (
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            <span>Reports</span>
          </NavLink>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        {user?.is_admin && (
          <a
            href="/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item-link"
            style={{ color: '#4338CA' }}
            title="Open Django Admin Panel in new tab"
          >
            <ShieldCheck size={18} />
            <span>Admin Portal</span>
          </a>
        )}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: user?.is_admin ? '#EFF6FF' : '#F0FDF4',
                color: user?.is_admin ? '#2563EB' : '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: '1px solid #E2E8F0',
                flexShrink: 0
              }}
            >
              {user?.username?.substring(0, 2).toUpperCase() || 'SM'}
            </div>
            <div className="overflow-hidden">
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#1E293B',
                }}
              >
                {user?.full_name || user?.username}
              </div>
              <span
                className={`badge ${
                  user?.is_admin ? 'bg-primary' : 'bg-success'
                }`}
                style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}
              >
                {user?.role || 'User'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline-danger p-1"
            title="Sign Out"
            style={{ borderRadius: 6 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
