import React, { useState, useEffect } from 'react';
import { Search, Download, Printer, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { billingService } from '../services/billingService';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async (search = '') => {
    setLoading(true);
    try {
      const data = await billingService.getInvoices({ search });
      setInvoices(data.results || data);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadInvoices(searchTerm);
  };

  const openInvoiceDetails = async (id) => {
    setDetailLoading(true);
    try {
      const inv = await billingService.getInvoiceById(id);
      setSelectedInvoice(inv);
    } catch (err) {
      toast.error('Failed to load invoice details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadPdf = (id) => {
    const url = billingService.getInvoicePdfUrl(id);
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 overflow-y-auto h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
            Invoices & Sales Transactions
          </h2>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Browse past customer billing records, print receipts, and export official tax PDFs.
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 12 }}>
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <div className="position-relative flex-grow-1">
            <Search size={18} className="position-absolute text-muted" style={{ left: 12, top: 10 }} />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by invoice number (e.g. SM-...), customer name, or cashier..."
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

      {/* Invoices Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light">
              <tr>
                <th>Invoice #</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Cashier</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Grand Total</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="fw-bold text-primary font-monospace">
                        #{inv.invoice_number}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {new Date(inv.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{inv.customer_name}</div>
                      {inv.customer_phone && (
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {inv.customer_phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {inv.cashier_name}
                      </span>
                    </td>
                    <td>{inv.item_count} items</td>
                    <td>
                      <span className="badge bg-info bg-opacity-20 text-dark" style={{ textTransform: 'uppercase' }}>
                        {inv.payment_method}
                      </span>
                    </td>
                    <td className="fw-bold text-dark fs-6">
                      ₹{parseFloat(inv.grand_total).toFixed(2)}
                    </td>
                    <td className="text-end pe-4">
                      <button
                        onClick={() => openInvoiceDetails(inv.id)}
                        className="btn btn-sm btn-outline-secondary p-1 me-1"
                        style={{ borderRadius: 6 }}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(inv.id)}
                        className="btn btn-sm btn-outline-primary p-1"
                        style={{ borderRadius: 6 }}
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-bottom px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <FileText className="text-primary" size={20} />
                  <h5 className="modal-title fw-bold mb-0">
                    Invoice #{selectedInvoice.invoice_number}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedInvoice(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>DATE</span>
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {new Date(selectedInvoice.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>CUSTOMER</span>
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {selectedInvoice.customer_name}
                    </span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>CASHIER</span>
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {selectedInvoice.cashier_name}
                    </span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>PAYMENT METHOD</span>
                    <span className="badge bg-success bg-opacity-20 text-success text-uppercase">
                      {selectedInvoice.payment_method}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="table-responsive border rounded-3 mb-4">
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">GST %</th>
                        <th className="text-end">Tax</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td className="fw-semibold">{item.product_name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="text-end">{item.tax_rate}%</td>
                          <td className="text-end">₹{parseFloat(item.tax_amount).toFixed(2)}</td>
                          <td className="text-end fw-bold">₹{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="row justify-content-end">
                  <div className="col-12 col-md-6">
                    <div className="bg-light p-3 rounded-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">Subtotal:</span>
                        <span className="fw-semibold">₹{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">Discount:</span>
                        <span className="text-success">- ₹{parseFloat(selectedInvoice.discount_amount).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">GST / Tax:</span>
                        <span>+ ₹{parseFloat(selectedInvoice.tax_amount).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top fw-bold fs-5 text-primary">
                        <span>Grand Total:</span>
                        <span>₹{parseFloat(selectedInvoice.grand_total).toFixed(2)}</span>
                      </div>
                      {selectedInvoice.payment_method === 'cash' && (
                        <div className="d-flex justify-content-between pt-1 text-muted" style={{ fontSize: '0.8rem' }}>
                          <span>Tendered: ₹{selectedInvoice.amount_paid}</span>
                          <span>Change: ₹{selectedInvoice.change_due}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setSelectedInvoice(null)}
                  style={{ borderRadius: 8 }}
                >
                  Close
                </button>
                <div className="d-flex gap-2">
                  <button
                    onClick={() => handleDownloadPdf(selectedInvoice.id)}
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    style={{ borderRadius: 8 }}
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = billingService.getInvoicePdfUrl(selectedInvoice.id);
                      window.open(url, '_blank');
                    }}
                    className="btn btn-primary d-flex align-items-center gap-2"
                    style={{ borderRadius: 8 }}
                  >
                    <Printer size={16} />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
