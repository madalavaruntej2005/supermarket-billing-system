import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Phone, Mail, Award, Clock } from 'lucide-react';
import { customerService } from '../services/customerService';
import { billingService } from '../services/billingService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  // History modal
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (search = '') => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers({ search });
      setCustomers(data.results || data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers(searchTerm);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
        toast.success('Customer updated successfully!');
      } else {
        await customerService.createCustomer(formData);
        toast.success('Customer registered successfully!');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err) {
      const msg = err.response?.data?.phone?.[0] || 'Error saving customer';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      await customerService.deleteCustomer(id);
      toast.success('Customer deleted');
      loadCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const viewPurchases = async (cust) => {
    setSelectedCustomerHistory(cust);
    setHistoryLoading(true);
    try {
      const invoices = await customerService.getCustomerPurchases(cust.id);
      setCustomerInvoices(invoices);
    } catch (err) {
      toast.error('Failed to load purchase history');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="p-4 overflow-y-auto h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
            Customer Directory
          </h2>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Registered customers, contact details, loyalty points, and purchase history.
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
          style={{ borderRadius: 10, fontWeight: 600 }}
        >
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 12 }}>
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <div className="position-relative flex-grow-1">
            <Search size={18} className="position-absolute text-muted" style={{ left: 12, top: 10 }} />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search customers by name, phone number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: 8, fontSize: '0.88rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary px-4" style={{ borderRadius: 8, fontWeight: 600 }}>
            Search
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light">
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Address</th>
                <th>Loyalty Points</th>
                <th>Purchases</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold"
                          style={{ width: 34, height: 34, fontSize: '0.82rem', border: '1px solid #E2E8F0' }}
                        >
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="fw-semibold text-dark">{c.name}</span>
                      </div>
                    </td>
                    <td>{c.phone || <span className="text-muted">N/A</span>}</td>
                    <td>{c.email || <span className="text-muted">N/A</span>}</td>
                    <td>
                      <span className="text-truncate d-inline-block" style={{ maxWidth: 200 }}>
                        {c.address || <span className="text-muted">N/A</span>}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-warning bg-opacity-25 text-dark fw-bold">
                        ⭐ {c.loyalty_points}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => viewPurchases(c)}
                        className="btn btn-sm btn-light border py-1 px-2"
                        style={{ fontSize: '0.78rem', borderRadius: 6 }}
                      >
                        <Clock size={13} className="me-1" />
                        {c.total_purchases} Bills
                      </button>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        onClick={() => openEditModal(c)}
                        className="btn btn-sm btn-outline-secondary p-1 me-1"
                        style={{ borderRadius: 6 }}
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      {user?.is_admin && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn btn-sm btn-outline-danger p-1"
                          style={{ borderRadius: 6 }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveCustomer}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="Customer name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="customer@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Address
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Delivery address / locality"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      style={{ borderRadius: 8 }}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setIsModalOpen(false)}
                    style={{ borderRadius: 8 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    style={{ borderRadius: 8, fontWeight: 600 }}
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Purchase History Modal */}
      {selectedCustomerHistory && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold">
                  Purchase History – {selectedCustomerHistory.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCustomerHistory(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {historyLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    Loading past transactions...
                  </div>
                ) : customerInvoices.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    No past purchases found for this customer.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                      <thead className="table-light">
                        <tr>
                          <th>Invoice #</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total Amount</th>
                          <th>Payment Method</th>
                          <th className="text-end">Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerInvoices.map((inv) => (
                          <tr key={inv.id}>
                            <td className="fw-semibold text-primary">#{inv.invoice_number}</td>
                            <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                            <td>{inv.item_count} items</td>
                            <td className="fw-bold">₹{inv.grand_total}</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {inv.payment_method?.toUpperCase()}
                              </span>
                            </td>
                            <td className="text-end">
                              <a
                                href={billingService.getInvoicePdfUrl(inv.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-primary py-1 px-2"
                                style={{ borderRadius: 6, fontSize: '0.75rem' }}
                              >
                                PDF
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
