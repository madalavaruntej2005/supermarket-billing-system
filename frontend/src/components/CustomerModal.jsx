import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, User, Check, X } from 'lucide-react';
import { customerService } from '../services/customerService';
import { toast } from 'react-toastify';

const CustomerModal = ({ isOpen, onClose, onSelectCustomer }) => {
  const [tab, setTab] = useState('search'); // 'search' or 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

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

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.warning('Customer name is required');
      return;
    }

    try {
      const newCust = await customerService.createCustomer({
        name: newName,
        phone: newPhone || null,
        email: newEmail || null,
        address: newAddress,
      });
      toast.success('Customer registered successfully!');
      onSelectCustomer(newCust);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.phone?.[0] || 'Failed to create customer';
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="modal-header border-bottom px-4 py-3">
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${tab === 'search' ? 'btn-primary' : 'btn-light'}`}
                style={{ borderRadius: 8, fontWeight: 600 }}
                onClick={() => setTab('search')}
              >
                <Search size={14} className="me-1" />
                Find Customer
              </button>
              <button
                className={`btn btn-sm ${tab === 'create' ? 'btn-primary' : 'btn-light'}`}
                style={{ borderRadius: 8, fontWeight: 600 }}
                onClick={() => setTab('create')}
              >
                <UserPlus size={14} className="me-1" />
                New Customer
              </button>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {tab === 'search' ? (
              <div>
                <form onSubmit={handleSearch} className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: '8px 0 0 8px' }}
                      autoFocus
                    />
                    <button className="btn btn-primary px-3" type="submit" style={{ borderRadius: '0 8px 8px 0' }}>
                      <Search size={16} />
                    </button>
                  </div>
                </form>

                {/* Walk-in customer shortcut */}
                <div
                  onClick={() => {
                    onSelectCustomer(null);
                    onClose();
                  }}
                  className="p-2 mb-3 d-flex align-items-center justify-content-between rounded-3 border border-dashed text-primary"
                  style={{ cursor: 'pointer', backgroundColor: '#EFF6FF' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <User size={16} />
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Walk-in Customer (Guest)</span>
                  </div>
                  <span className="badge bg-primary">Select</span>
                </div>

                {/* Customer Results List */}
                <div style={{ maxHeight: 250, overflowY: 'auto' }} className="d-flex flex-column gap-2">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary"></div>
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                      No customers found. Click "New Customer" to register.
                    </div>
                  ) : (
                    customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCustomer(c);
                          onClose();
                        }}
                        className="p-2 border rounded-2 d-flex align-items-center justify-content-between hover-bg-light"
                        style={{ cursor: 'pointer', transition: 'background-color 0.15s' }}
                      >
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.88rem', color: '#1E293B' }}>
                            {c.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            📞 {c.phone || 'No phone'} | Points: {c.loyalty_points}
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-primary py-1 px-2" style={{ borderRadius: 6 }}>
                          <Check size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateCustomer}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-sm"
                    placeholder="Customer Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Phone Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="name@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Address</label>
                  <textarea
                    rows="2"
                    className="form-control form-control-sm"
                    placeholder="Delivery/residential address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    style={{ borderRadius: 8 }}
                  ></textarea>
                </div>
                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button type="button" className="btn btn-sm btn-light" onClick={onClose} style={{ borderRadius: 8 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary px-3" style={{ borderRadius: 8 }}>
                    Register & Select
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
