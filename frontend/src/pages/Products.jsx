import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Barcode,
  Upload,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    sku: '',
    description: '',
    category_id: '',
    purchase_price: '',
    selling_price: '',
    tax_rate: '5.00',
    stock: 0,
    min_stock: 5,
    unit: 'pcs',
    image: null,
    image_url: '',
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data.results || data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      const data = await productService.getProducts(params);
      setProducts(data.results || data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: Date.now().toString(), // suggested barcode
      sku: '',
      description: '',
      category_id: categories[0]?.id || '',
      purchase_price: '',
      selling_price: '',
      tax_rate: '5.00',
      stock: 10,
      min_stock: 5,
      unit: 'pcs',
      image: null,
      image_url: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      barcode: p.barcode,
      sku: p.sku || '',
      description: p.description || '',
      category_id: p.category_id || p.category,
      purchase_price: p.purchase_price,
      selling_price: p.selling_price,
      tax_rate: p.tax_rate,
      stock: p.stock,
      min_stock: p.min_stock,
      unit: p.unit || 'pcs',
      image: null,
      image_url: p.image_url || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('barcode', formData.barcode);
      data.append('sku', formData.sku);
      data.append('description', formData.description);
      data.append('category_id', formData.category_id);
      data.append('purchase_price', formData.purchase_price);
      data.append('selling_price', formData.selling_price);
      data.append('tax_rate', formData.tax_rate);
      data.append('stock', formData.stock);
      data.append('min_stock', formData.min_stock);
      data.append('unit', formData.unit);
      if (formData.image_url) data.append('image_url', formData.image_url);
      if (formData.image) data.append('image', formData.image);

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(data);
        toast.success('Product added successfully!');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      const msg = err.response?.data?.barcode?.[0] || 'Error saving product. Please check fields.';
      toast.error(msg);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product removed successfully');
      setDeleteConfirmId(null);
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="p-4 overflow-y-auto h-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
            Products Inventory
          </h2>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Manage catalog, pricing, barcodes, and inventory thresholds.
          </div>
        </div>

        {user?.is_admin && (
          <button
            onClick={openAddModal}
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 12 }}>
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <Search size={18} className="position-absolute text-muted" style={{ left: 12, top: 10 }} />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search by product name, barcode, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 8, fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
              style={{ borderRadius: 8, fontSize: '0.88rem' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3 d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary w-100"
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Filter
            </button>
            <button
              type="button"
              className="btn btn-light border"
              style={{ borderRadius: 8 }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                productService.getProducts().then((res) => setProducts(res.results || res));
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Products Table Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>Item</th>
                <th>Product Name</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>GST Rate</th>
                <th>Stock</th>
                {user?.is_admin && <th className="text-end pe-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={user?.is_admin ? 8 : 7} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={user?.is_admin ? 8 : 7} className="text-center py-5 text-muted">
                    No products matching criteria found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= p.min_stock;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {p.effective_image ? (
                            <img
                              src={p.effective_image}
                              alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Package size={20} className="text-muted" />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{p.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Unit: {p.unit}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">
                          {p.barcode}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {p.category_name}
                        </span>
                      </td>
                      <td className="fw-bold text-dark">
                        ₹{parseFloat(p.selling_price).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-25 text-dark">
                          {p.tax_rate}%
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isOut
                              ? 'bg-danger'
                              : isLow
                              ? 'bg-warning text-dark'
                              : 'bg-success'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>
                      {user?.is_admin && (
                        <td className="text-end pe-4">
                          <button
                            onClick={() => openEditModal(p)}
                            className="btn btn-sm btn-outline-secondary p-1 me-1"
                            title="Edit Product"
                            style={{ borderRadius: 6 }}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="btn btn-sm btn-outline-danger p-1"
                            title="Delete Product"
                            style={{ borderRadius: 6 }}
                          >
                            <Trash2 size={15} />
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Fortune Sunflower Oil 1L"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Category *
                      </label>
                      <select
                        required
                        className="form-select"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        style={{ borderRadius: 8 }}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Barcode (Unique) *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="Scan or enter barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Unit of Measure
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="pcs, kg, pack, bottle"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Purchase Cost (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="0.00"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="form-control"
                        placeholder="0.00"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        GST Tax Rate (%)
                      </label>
                      <select
                        className="form-select"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                        style={{ borderRadius: 8 }}
                      >
                        <option value="0.00">0% (Nil / Exempt)</option>
                        <option value="5.00">5% GST</option>
                        <option value="12.00">12% GST</option>
                        <option value="18.00">18% GST</option>
                        <option value="28.00">28% GST</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Initial / Current Stock *
                      </label>
                      <input
                        type="number"
                        required
                        className="form-control"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Minimum Low-Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        required
                        className="form-control"
                        value={formData.min_stock}
                        onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value, 10) || 5 })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Image URL (Unsplash or direct web image link)
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                        Or Upload Image File from Computer
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
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
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content border-0 shadow-lg p-4 text-center" style={{ borderRadius: 16 }}>
              <div
                className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 56, height: 56 }}
              >
                <AlertTriangle size={28} />
              </div>
              <h5 className="fw-bold mb-2">Delete Product?</h5>
              <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                Are you sure you want to remove this product? It will be marked inactive to preserve past invoice history.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-light"
                  onClick={() => setDeleteConfirmId(null)}
                  style={{ borderRadius: 8 }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-3"
                  onClick={() => handleDeleteProduct(deleteConfirmId)}
                  style={{ borderRadius: 8 }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
