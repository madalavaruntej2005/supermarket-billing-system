import React, { useState, useEffect } from 'react';
import {
  Boxes,
  PlusCircle,
  AlertTriangle,
  History,
  Search,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Inventory = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'movements'
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('restock');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lowStock, allProds] = await Promise.all([
        inventoryService.getLowStockProducts(),
        productService.getProducts(),
      ]);
      setLowStockProducts(lowStock);
      setAllProducts(allProds.results || allProds);

      if (activeTab === 'movements') {
        const moves = await inventoryService.getMovements();
        setMovements(moves.results || moves);
      }
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.warning('Please select a product');
      return;
    }
    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty === 0) {
      toast.warning('Quantity cannot be zero');
      return;
    }

    setAdjusting(true);
    try {
      await inventoryService.adjustStock({
        product_id: parseInt(selectedProductId, 10),
        movement_type: movementType,
        quantity: numQty,
        notes,
      });
      toast.success('Stock adjusted successfully!');
      setIsAdjustModalOpen(false);
      setSelectedProductId('');
      setQuantity('');
      setNotes('');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to adjust stock';
      toast.error(msg);
    } finally {
      setAdjusting(false);
    }
  };

  const openAdjustForProduct = (prodId) => {
    setSelectedProductId(prodId);
    setMovementType('restock');
    setQuantity(20);
    setNotes('Restocked low inventory');
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="p-4 overflow-y-auto h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
            Inventory Management
          </h2>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Monitor stock thresholds, restock supplies, and trace real-time movement history.
          </div>
        </div>

        {user?.is_admin && (
          <button
            onClick={() => {
              setSelectedProductId(allProducts[0]?.id || '');
              setIsAdjustModalOpen(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            <PlusCircle size={18} />
            <span>Adjust / Restock Stock</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-light'}`}
          style={{ borderRadius: 8, fontWeight: 600 }}
        >
          <AlertTriangle size={15} className="me-1" />
          Low Stock Alerts ({lowStockProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`btn btn-sm ${activeTab === 'movements' ? 'btn-primary' : 'btn-light'}`}
          style={{ borderRadius: 8, fontWeight: 600 }}
        >
          <History size={15} className="me-1" />
          Stock Movement History
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="row g-4">
          {/* Low Stock Warning Banner */}
          {lowStockProducts.length > 0 ? (
            <div className="col-12">
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-danger text-white"
                    style={{ width: 40, height: 40 }}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="fw-bold text-danger" style={{ fontSize: '0.95rem' }}>
                      {lowStockProducts.length} Items Require Immediate Attention
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      These items have reached or fallen below their designated reorder threshold.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-12">
              <div
                className="p-3 rounded-3 d-flex align-items-center gap-3"
                style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}
              >
                <CheckCircle size={24} className="text-success" />
                <div className="fw-semibold text-success">
                  All products in catalog have healthy inventory levels!
                </div>
              </div>
            </div>
          )}

          {/* Low Stock Items Grid */}
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Barcode</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Reorder Level</th>
                      <th>Status</th>
                      {user?.is_admin && <th className="text-end pe-4">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                          Checking inventory...
                        </td>
                      </tr>
                    ) : lowStockProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No low-stock items.
                        </td>
                      </tr>
                    ) : (
                      lowStockProducts.map((p) => {
                        const isOut = p.stock <= 0;
                        return (
                          <tr key={p.id}>
                            <td className="fw-semibold text-dark">{p.name}</td>
                            <td>
                              <span className="badge bg-light text-dark border font-monospace">
                                {p.barcode}
                              </span>
                            </td>
                            <td>{p.category_name}</td>
                            <td className="fw-bold">
                              <span className={isOut ? 'text-danger' : 'text-warning'}>
                                {p.stock} {p.unit}
                              </span>
                            </td>
                            <td className="text-muted">{p.min_stock} {p.unit}</td>
                            <td>
                              <span className={`badge ${isOut ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {isOut ? 'Out of Stock' : 'Low Stock'}
                              </span>
                            </td>
                            {user?.is_admin && (
                              <td className="text-end pe-4">
                                <button
                                  onClick={() => openAdjustForProduct(p.id)}
                                  className="btn btn-sm btn-primary py-1 px-3"
                                  style={{ borderRadius: 6, fontSize: '0.78rem' }}
                                >
                                  Restock Now
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Stock Movements Audit Log */
        <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty Change</th>
                  <th>Previous</th>
                  <th>New Balance</th>
                  <th>Reason / Notes</th>
                  <th>User</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading stock movements...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No stock movement history recorded.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="fw-semibold text-dark">{m.product_name}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                            {m.product_barcode}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              m.movement_type === 'sale'
                                ? 'bg-info bg-opacity-25 text-dark'
                                : m.movement_type === 'restock'
                                ? 'bg-success bg-opacity-25 text-success'
                                : 'bg-secondary bg-opacity-25 text-dark'
                            }`}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {m.movement_type}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`fw-bold d-flex align-items-center gap-1 ${
                              isPositive ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="text-muted">{m.previous_stock}</td>
                        <td className="fw-bold">{m.new_stock}</td>
                        <td className="text-muted" style={{ maxWidth: 200 }}>
                          {m.notes || '—'}
                        </td>
                        <td>{m.created_by_name || 'System'}</td>
                        <td className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {new Date(m.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold">Adjust / Restock Inventory</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsAdjustModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleAdjustStock}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Select Product *
                    </label>
                    <select
                      required
                      className="form-select"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      style={{ borderRadius: 8 }}
                    >
                      <option value="">-- Choose Product --</option>
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Current: {p.stock} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Operation Type *
                    </label>
                    <select
                      className="form-select"
                      value={movementType}
                      onChange={(e) => setMovementType(e.target.value)}
                      style={{ borderRadius: 8 }}
                    >
                      <option value="restock">Restock / Purchase (Add Stock)</option>
                      <option value="adjustment">Manual Count Adjustment</option>
                      <option value="return">Customer Return (Add Stock)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Quantity (Units to change) *
                    </label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 20 (or -5 for deduction)"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{ borderRadius: 8 }}
                    />
                    <div className="form-text" style={{ fontSize: '0.75rem' }}>
                      Use positive number to add stock, or negative number to deduct.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Reason / Reference Notes
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Vendor delivery invoice #4421"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setIsAdjustModalOpen(false)}
                    style={{ borderRadius: 8 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={adjusting}
                    style={{ borderRadius: 8, fontWeight: 600 }}
                  >
                    {adjusting ? 'Saving...' : 'Apply Stock Change'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
