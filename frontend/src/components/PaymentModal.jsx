import React, { useState } from 'react';
import {
  Banknote,
  Smartphone,
  CreditCard,
  CheckCircle2,
  Printer,
  Download,
  X
} from 'lucide-react';
import { billingService } from '../services/billingService';
import { toast } from 'react-toastify';

const PaymentModal = ({
  isOpen,
  onClose,
  totals,
  selectedCustomer,
  discountType,
  discountValue,
  cartItems,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);

  if (!isOpen) return null;

  const grandTotal = totals.grandTotal;
  const numReceived = parseFloat(amountReceived) || 0;
  const changeDue = paymentMethod === 'cash' ? Math.max(0, numReceived - grandTotal) : 0;
  const isCashInsufficient = paymentMethod === 'cash' && numReceived < grandTotal;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'cash' && isCashInsufficient) {
      toast.warning('Amount received is less than grand total.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || 'Walk-in Customer',
        customer_phone: selectedCustomer?.phone || '',
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        discount_type: discountType,
        discount_value: discountValue,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'cash' ? numReceived : grandTotal,
        notes,
      };

      const result = await billingService.checkout(payload);
      toast.success(`Invoice ${result.invoice_number} created successfully!`);
      setCompletedInvoice(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail || 'Checkout failed. Please check product stock.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!completedInvoice) return;
    const url = billingService.getInvoicePdfUrl(completedInvoice.id);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    if (!completedInvoice) return;
    const url = billingService.getInvoicePdfUrl(completedInvoice.id);
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 520 }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          {/* Header */}
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              {completedInvoice ? (
                <>
                  <CheckCircle2 size={22} className="text-success" />
                  <span>Payment Completed</span>
                </>
              ) : (
                <>
                  <span>Checkout & Payment</span>
                </>
              )}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            {completedInvoice ? (
              <div className="text-center py-2">
                <div
                  className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64 }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="fw-bold mb-1">₹{completedInvoice.grand_total}</h4>
                <div className="text-muted mb-3" style={{ fontSize: '0.88rem' }}>
                  Invoice <strong>#{completedInvoice.invoice_number}</strong>
                </div>

                <div className="card bg-light border-0 p-3 mb-4 text-start" style={{ borderRadius: 12 }}>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                    <span className="text-muted">Customer:</span>
                    <span className="fw-semibold">{completedInvoice.customer_name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                    <span className="text-muted">Payment Method:</span>
                    <span className="fw-semibold text-uppercase">{completedInvoice.payment_method}</span>
                  </div>
                  {completedInvoice.payment_method === 'cash' && (
                    <>
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">Amount Tendered:</span>
                        <span>₹{completedInvoice.amount_paid}</span>
                      </div>
                      <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">Change Returned:</span>
                        <span className="fw-bold text-success">₹{completedInvoice.change_due}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    onClick={handleDownloadPdf}
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    style={{ borderRadius: 10, padding: '0.6rem 1.25rem' }}
                  >
                    <Download size={18} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="btn btn-primary d-flex align-items-center gap-2"
                    style={{ borderRadius: 10, padding: '0.6rem 1.25rem' }}
                  >
                    <Printer size={18} />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Total amount highlight */}
                <div
                  className="p-3 mb-3 text-center rounded-3"
                  style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#1E40AF', fontWeight: 600 }}>
                    TOTAL AMOUNT DUE
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1D4ED8' }}>
                    ₹{grandTotal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {totals.totalItems} Items | GST Included
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                    Select Payment Method
                  </label>
                  <div className="row g-2">
                    {[
                      { id: 'cash', label: 'Cash', icon: Banknote },
                      { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                      { id: 'debit_card', label: 'Debit Card', icon: CreditCard },
                      { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                    ].map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <div key={pm.id} className="col-6">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`w-100 p-2 d-flex align-items-center gap-2 btn ${
                              isSelected ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                            style={{
                              borderRadius: 10,
                              borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                              backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : '#334155',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            <Icon size={18} />
                            <span>{pm.label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cash Tender Input */}
                {paymentMethod === 'cash' && (
                  <div className="p-3 mb-3 bg-light rounded-3 border">
                    <div className="mb-2">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Amount Tendered (Cash Received)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={grandTotal.toFixed(2)}
                          value={amountReceived}
                          onChange={(e) => setAmountReceived(e.target.value)}
                          className="form-control fw-bold"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Quick Cash Suggestions */}
                    <div className="d-flex gap-1 mb-2 flex-wrap">
                      {[Math.ceil(grandTotal), 500, 1000, 2000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmountReceived(amt.toString())}
                          className="btn btn-sm btn-outline-secondary px-2 py-0"
                          style={{ fontSize: '0.75rem', borderRadius: 6 }}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>

                    {/* Change returned calculation */}
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <span className="fw-semibold text-muted" style={{ fontSize: '0.85rem' }}>
                        Change to return:
                      </span>
                      <span
                        className={`fw-bold fs-5 ${
                          isCashInsufficient ? 'text-danger' : 'text-success'
                        }`}
                      >
                        ₹{changeDue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Order notes / reference (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ borderRadius: 8 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!completedInvoice && (
            <div className="modal-footer border-top px-4 py-3 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={loading}
                style={{ borderRadius: 8 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2 px-4"
                onClick={handleCheckout}
                disabled={loading || (paymentMethod === 'cash' && isCashInsufficient)}
                style={{
                  borderRadius: 10,
                  backgroundColor: '#2563EB',
                  fontWeight: 600,
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Complete Sale (₹{grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
