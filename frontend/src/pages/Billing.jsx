import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  User,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Tag,
  AlertCircle,
  Percent,
  CheckCircle2,
  PackageX
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useCart } from '../context/CartContext';
import PaymentModal from '../components/PaymentModal';
import CustomerModal from '../components/CustomerModal';
import { toast } from 'react-toastify';

const Billing = () => {
  const {
    cartItems,
    selectedCustomer,
    setSelectedCustomer,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    setItemQuantity,
    removeFromCart,
    clearCart,
    totals,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const barcodeInputRef = useRef(null);

  // Load products and categories on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.results || data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (catId = selectedCategory, search = searchTerm) => {
    setLoading(true);
    try {
      const params = {};
      if (catId) params.category = catId;
      if (search) params.search = search;
      const data = await productService.getProducts(params);
      setProducts(data.results || data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    fetchProducts(catId, searchTerm);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchProducts(selectedCategory, val);
  };

  // Barcode scanner auto-detect on Enter
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      const product = await productService.getByBarcode(code);
      if (product) {
        addToCart(product);
        toast.info(`Added: ${product.name}`);
        setBarcodeInput('');
      }
    } catch (err) {
      toast.error(`No product found with barcode "${code}"`);
    }
  };

  return (
    <div className="pos-container">
      {/* ================= CENTER PANEL: PRODUCTS ================= */}
      <section className="pos-products-panel">
        {/* Top Controls: Search Bar & Barcode Scanner */}
        <div className="d-flex gap-2 mb-3">
          <div className="position-relative flex-grow-1">
            <Search
              size={18}
              className="position-absolute text-muted"
              style={{ left: 14, top: 11 }}
            />
            <input
              type="text"
              className="form-control ps-5 py-2"
              placeholder="Search products by name, brand, or SKU..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ borderRadius: 10, borderColor: '#E2E8F0', fontSize: '0.9rem' }}
            />
          </div>

          <form onSubmit={handleBarcodeSubmit} style={{ width: 220 }}>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                <Barcode size={18} className="text-primary" />
              </span>
              <input
                ref={barcodeInputRef}
                type="text"
                className="form-control border-start-0 py-2"
                placeholder="Scan Barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                style={{ borderRadius: '0 10px 10px 0', fontSize: '0.88rem' }}
              />
            </div>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills-wrap">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Product Grid Listing */}
        <div className="flex-grow-1 overflow-y-auto">
          {loading ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
              <PackageX size={48} className="mb-2 text-secondary opacity-50" />
              <p className="fw-semibold mb-1">No products found</p>
              <span style={{ fontSize: '0.85rem' }}>Try clearing filters or search term</span>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.min_stock;

                return (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => !isOutOfStock && addToCart(product)}
                    style={{ opacity: isOutOfStock ? 0.6 : 1 }}
                  >
                    {/* Image Wrap */}
                    <div className="product-card-img-wrap">
                      {product.effective_image ? (
                        <img
                          src={product.effective_image}
                          alt={product.name}
                          className="product-card-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <ShoppingBag size={32} className="text-muted opacity-50" />
                      )}

                      {/* Stock Badge */}
                      <span
                        className={`badge position-absolute top-0 end-0 m-2 ${
                          isOutOfStock
                            ? 'bg-danger'
                            : isLowStock
                            ? 'bg-warning text-dark'
                            : 'bg-success'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
                      </span>

                      {/* Tax rate badge */}
                      {product.tax_rate > 0 && (
                        <span
                          className="badge position-absolute bottom-0 start-0 m-2 bg-dark bg-opacity-75 text-white"
                          style={{ fontSize: '0.62rem' }}
                        >
                          GST {product.tax_rate}%
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="product-card-body">
                      <div>
                        <div className="product-card-title" title={product.name}>
                          {product.name}
                        </div>
                        <div className="product-card-meta">
                          {product.category_name}
                        </div>
                      </div>

                      <div className="product-card-footer">
                        <div>
                          <span className="product-price">
                            ₹{parseFloat(product.selling_price).toFixed(2)}
                          </span>
                          <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>
                            /{product.unit || 'pc'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-add-item"
                          disabled={isOutOfStock}
                          title="Add to invoice"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= RIGHT PANEL: CURRENT INVOICE ================= */}
      <section className="pos-invoice-panel">
        {/* Invoice Header */}
        <div className="cart-header">
          <div>
            <div className="fw-bold" style={{ fontSize: '1rem', color: '#1E293B' }}>
              Current Invoice
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {cartItems.length} items in bill
            </div>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-2"
              style={{ borderRadius: 6, fontSize: '0.75rem' }}
              title="Clear entire invoice"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Customer Selector Bar */}
        <div className="px-3 py-2 bg-light border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              className="rounded-circle bg-white border d-flex align-items-center justify-content-center"
              style={{ width: 28, height: 28, color: '#2563EB', flexShrink: 0 }}
            >
              <User size={15} />
            </div>
            <div className="overflow-hidden">
              <div
                className="fw-semibold text-truncate"
                style={{ fontSize: '0.82rem', color: '#1E293B' }}
              >
                {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
              </div>
              {selectedCustomer?.phone && (
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  📞 {selectedCustomer.phone}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="btn btn-sm btn-outline-primary py-0 px-2"
            style={{ fontSize: '0.75rem', borderRadius: 6 }}
          >
            {selectedCustomer ? 'Change' : 'Select'}
          </button>
        </div>

        {/* Line Items List */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-5">
              <ShoppingBag size={42} className="opacity-30 mb-2 text-secondary" />
              <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>
                Invoice is Empty
              </div>
              <div style={{ fontSize: '0.78rem', textAlign: 'center', maxWidth: 220 }}>
                Click on products on the left or scan a barcode to add them.
              </div>
            </div>
          ) : (
            totals.items.map((item) => (
              <div key={item.product.id} className="cart-item-card">
                <div className="cart-item-row">
                  <div className="pe-2">
                    <div className="cart-item-title">{item.product.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      ₹{item.unitPrice.toFixed(2)} × {item.quantity}
                      {item.taxRate > 0 && ` (+${item.taxRate}% GST)`}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold" style={{ fontSize: '0.92rem', color: '#1E293B' }}>
                      ₹{item.itemTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-1 border-top">
                  {/* Quantity Control */}
                  <div className="qty-control-wrap">
                    <button
                      className="qty-btn"
                      onClick={() => decreaseQuantity(item.product.id)}
                      title="Decrease"
                    >
                      <Minus size={13} />
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={item.quantity}
                      onChange={(e) => setItemQuantity(item.product.id, e.target.value)}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => increaseQuantity(item.product.id)}
                      title="Increase"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    className="btn btn-sm text-danger p-0 border-0 bg-transparent"
                    onClick={() => removeFromCart(item.product.id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Invoice Summary & Checkout Actions */}
        <div className="cart-summary-section">
          {/* Discount Field */}
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>
              Discount:
            </span>
            <div className="d-flex align-items-center gap-1" style={{ maxWidth: 160 }}>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn py-0 px-2 ${discountType === 'fixed' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setDiscountType('fixed')}
                >
                  ₹
                </button>
                <button
                  type="button"
                  className={`btn py-0 px-2 ${discountType === 'percentage' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => setDiscountType('percentage')}
                >
                  %
                </button>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                className="form-control form-control-sm text-end"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                style={{ width: 80, borderRadius: 6, fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span className="fw-semibold">₹{totals.subtotal.toFixed(2)}</span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="summary-row text-success">
              <span>Discount</span>
              <span>- ₹{totals.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Estimated GST / Tax</span>
            <span>+ ₹{totals.taxAmount.toFixed(2)}</span>
          </div>

          <div className="summary-row total-row">
            <span>Grand Total</span>
            <span className="text-primary">₹{totals.grandTotal.toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={cartItems.length === 0}
            className="btn btn-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '1rem',
              backgroundColor: '#2563EB',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <CreditCard size={20} />
            <span>Proceed to Payment (₹{totals.grandTotal.toFixed(2)})</span>
          </button>
        </div>
      </section>

      {/* Customer Selection Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(cust) => setSelectedCustomer(cust)}
      />

      {/* Checkout & Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totals={totals}
        selectedCustomer={selectedCustomer}
        discountType={discountType}
        discountValue={discountValue}
        cartItems={cartItems}
        onSuccess={(invoice) => {
          clearCart();
          fetchProducts(); // Refresh stock in product grid
        }}
      />
    </div>
  );
};

export default Billing;
