import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  Boxes,
  ArrowUpRight,
  PlusCircle,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await reportService.getDashboardStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const { kpis, sales_trend, category_distribution, top_products, recent_transactions, low_stock_alerts } = stats;

  return (
    <div className="p-4 overflow-y-auto h-100">
      {/* Top Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
            Store Performance Overview
          </h2>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Real-time analytics and transaction updates from your supermarket operations.
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {user?.is_admin && (
            <button
              onClick={() => navigate('/products?action=add')}
              className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2"
              style={{
                borderRadius: 10,
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)'
              }}
              title="Add new supermarket product"
            >
              <PlusCircle size={18} />
              <span>+ Add Items</span>
            </button>
          )}
          <button
            onClick={() => navigate('/billing')}
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            <ShoppingCart size={18} />
            <span>Open POS Counter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Today's Revenue */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <DollarSign size={26} />
            </div>
            <div>
              <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>TODAY'S REVENUE</div>
              <div className="fw-bold" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
                ₹{kpis.today_revenue.toFixed(2)}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {kpis.today_transactions} sales today
              </div>
            </div>
          </div>
        </div>

        {/* All-time Sales */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-icon-wrap" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <TrendingUp size={26} />
            </div>
            <div>
              <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>TOTAL REVENUE</div>
              <div className="fw-bold" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
                ₹{kpis.all_time_revenue.toFixed(2)}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Cumulative sales
              </div>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-icon-wrap" style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
              <Package size={26} />
            </div>
            <div>
              <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>ACTIVE PRODUCTS</div>
              <div className="fw-bold" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
                {kpis.total_products}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Across {category_distribution.length} categories
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/inventory')}
          >
            <div className="stat-icon-wrap" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <AlertTriangle size={26} />
            </div>
            <div>
              <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>LOW STOCK ITEMS</div>
              <div className="fw-bold text-danger" style={{ fontSize: '1.4rem' }}>
                {kpis.low_stock_count}
              </div>
              <div className="text-danger" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {kpis.out_of_stock_count} out of stock
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        {/* Sales Trend (7 Days) */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
                  Daily Revenue Trend
                </h5>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Last 7 days performance</span>
              </div>
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1" style={{ borderRadius: 20 }}>
                Live Data
              </span>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales_trend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val) => [`₹${val}`, 'Revenue']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Sales Distribution */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
            <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
              Category Breakdown
            </h5>
            <span className="text-muted mb-3" style={{ fontSize: '0.78rem' }}>Sales volume by category</span>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={category_distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={80} />
                  <Tooltip
                    formatter={(val) => [`₹${val}`, 'Sales']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Low Stock Alerts */}
      <div className="row g-4">
        {/* Recent Transactions */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
                  Recent Invoices
                </h5>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Latest completed transactions</span>
              </div>
              <button
                onClick={() => navigate('/invoices')}
                className="btn btn-sm btn-outline-primary py-1 px-2"
                style={{ borderRadius: 8, fontSize: '0.75rem' }}
              >
                View All
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recent_transactions.map((inv) => (
                      <tr key={inv.id}>
                        <td className="fw-semibold text-primary">#{inv.invoice_number}</td>
                        <td>{inv.customer_name}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {inv.payment_method?.toUpperCase()}
                          </span>
                        </td>
                        <td className="fw-bold">₹{inv.grand_total}</td>
                        <td className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0 text-danger" style={{ fontSize: '1.05rem' }}>
                  Low Stock Watchlist
                </h5>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Items requiring urgent reorder</span>
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="btn btn-sm btn-outline-danger py-1 px-2"
                style={{ borderRadius: 8, fontSize: '0.75rem' }}
              >
                Manage Stock
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {low_stock_alerts.length === 0 ? (
                <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                  All items are well stocked! 🎉
                </div>
              ) : (
                low_stock_alerts.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 border rounded-2 d-flex justify-content-between align-items-center bg-light"
                  >
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '0.85rem', color: '#1E293B' }}>
                        {item.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Threshold: {item.min_stock} | Category: {item.category_name}
                      </div>
                    </div>
                    <span
                      className={`badge ${item.stock <= 0 ? 'bg-danger' : 'bg-warning text-dark'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {item.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
