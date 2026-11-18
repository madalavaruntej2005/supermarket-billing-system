import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Filter,
  PieChart as PieIcon,
  TrendingUp,
  Receipt
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

const Reports = () => {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const data = await reportService.getSalesReport(params);
      setReportData(data);
    } catch (err) {
      toast.error('Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="p-4 overflow-y-auto h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
            Financial & Sales Reports
          </h2>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Aggregated revenue, tax compliance, category margins, and payment method statistics.
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 12 }}>
        <form onSubmit={handleApplyFilter} className="row g-2 align-items-center">
          <div className="col-12 col-sm-3">
            <select
              className="form-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ borderRadius: 8, fontSize: '0.88rem' }}
            >
              <option value="daily">Daily View</option>
              <option value="monthly">Monthly View</option>
              <option value="yearly">Yearly View</option>
            </select>
          </div>

          <div className="col-12 col-sm-3">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ borderRadius: 8, fontSize: '0.88rem' }}
              placeholder="Start Date"
            />
          </div>

          <div className="col-12 col-sm-3">
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ borderRadius: 8, fontSize: '0.88rem' }}
              placeholder="End Date"
            />
          </div>

          <div className="col-12 col-sm-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary w-100" style={{ borderRadius: 8, fontWeight: 600 }}>
              Apply Filter
            </button>
            <button
              type="button"
              className="btn btn-light border"
              style={{ borderRadius: 8 }}
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPeriod('daily');
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {loading || !reportData ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          Generating financial report...
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>NET SALES REVENUE</div>
                  <div className="fw-bold" style={{ fontSize: '1.35rem', color: '#1E293B' }}>
                    ₹{reportData.summary.total_revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                  <Receipt size={24} />
                </div>
                <div>
                  <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>TOTAL INVOICES</div>
                  <div className="fw-bold" style={{ fontSize: '1.35rem', color: '#1E293B' }}>
                    {reportData.summary.total_invoices}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>COLLECTED GST</div>
                  <div className="fw-bold" style={{ fontSize: '1.35rem', color: '#1E293B' }}>
                    ₹{reportData.summary.total_tax.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                  <BarChart3 size={24} />
                </div>
                <div>
                  <div className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>DISCOUNTS APPLIED</div>
                  <div className="fw-bold" style={{ fontSize: '1.35rem', color: '#1E293B' }}>
                    ₹{reportData.summary.total_discount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-4">
            {/* Timeline Revenue Chart */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
                  Revenue Timeline
                </h5>
                <span className="text-muted mb-3" style={{ fontSize: '0.78rem' }}>Sales distribution over chosen timeframe</span>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        formatter={(val) => [`₹${val}`, 'Revenue']}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
                  Payment Methods
                </h5>
                <span className="text-muted mb-3" style={{ fontSize: '0.78rem' }}>Volume by tender type</span>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.payment_breakdown}
                        dataKey="total"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {reportData.payment_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [`₹${val}`, 'Revenue']}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Category Sales Table */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
            <div className="p-3 border-bottom bg-light">
              <h6 className="fw-bold mb-0" style={{ color: '#1E293B' }}>
                Category Sales Breakdown
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Category</th>
                    <th>Units Sold</th>
                    <th>Gross Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.category_breakdown.map((cat, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-dark">{cat.category}</td>
                      <td>{cat.quantity} items</td>
                      <td className="fw-bold text-primary">₹{cat.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
