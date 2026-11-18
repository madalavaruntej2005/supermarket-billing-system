import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Clock, Search, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';

const routeTitles = {
  '/dashboard': 'Dashboard Overview',
  '/billing': 'Smart POS & Billing Counter',
  '/invoices': 'Invoices & Sales History',
  '/products': 'Product Catalog & Pricing',
  '/categories': 'Category Management',
  '/customers': 'Customer Directory',
  '/inventory': 'Inventory Control & Stock Movements',
  '/reports': 'Sales Analytics & Financial Reports',
  '/settings': 'System Settings & Cashiers',
};

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const data = await inventoryService.getLowStockProducts();
        setLowStockCount(data.length);
      } catch (err) {
        // silent fail
      }
    };
    fetchLowStock();
  }, [location.pathname]);

  const currentTitle = routeTitles[location.pathname] || 'SuperMart System';

  return (
    <header className="top-navbar">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>
          {currentTitle}
        </h1>
        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
          SuperMart Retail Management Platform
        </div>
      </div>

      {/* Right Controls */}
      <div className="d-flex align-items-center gap-3">
        {/* Real-time Clock */}
        <div
          className="d-none d-md-flex align-items-center gap-2 px-3 py-1"
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            fontSize: '0.82rem',
            color: '#475569',
            fontWeight: 500,
          }}
        >
          <Clock size={15} color="#2563EB" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Low Stock Notification Bell */}
        <button
          onClick={() => navigate('/inventory')}
          className="btn position-relative p-2"
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            color: '#475569',
          }}
          title={lowStockCount > 0 ? `${lowStockCount} items low on stock` : 'All items sufficiently stocked'}
        >
          <Bell size={18} />
          {lowStockCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: '0.65rem' }}
            >
              {lowStockCount}
            </span>
          )}
        </button>

        {/* User Role Badge */}
        <div
          className="d-flex align-items-center gap-2 px-2 py-1"
          style={{
            backgroundColor: '#F1F5F9',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <UserCheck size={14} />
          </div>
          <div className="pe-2 d-none d-sm-block">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
              {user?.username}
            </span>
            <span className="text-muted ms-1" style={{ fontSize: '0.72rem' }}>
              ({user?.role})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
