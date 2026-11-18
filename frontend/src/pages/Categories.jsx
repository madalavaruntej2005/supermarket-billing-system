import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Layers, Package } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'Layers' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (search = '') => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories({ search });
      setCategories(data.results || data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCategories(searchTerm);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: 'Layers' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || 'Layers' });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully!');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category added successfully!');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || 'Error saving category';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error('Cannot delete category with associated products');
    }
  };

  return (
    <div className="p-4 overflow-y-auto h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
            Product Categories
          </h2>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Organize supermarket items into distinct sections and aisles.
          </div>
        </div>

        {user?.is_admin && (
          <button
            onClick={openAddModal}
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 12 }}>
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <div className="position-relative flex-grow-1">
            <Search size={18} className="position-absolute text-muted" style={{ left: 12, top: 10 }} />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search categories..."
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

      {/* Category Grid Cards */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary spinner-border-sm me-2"></div>
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">
            No categories found.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-between" style={{ borderRadius: 14 }}>
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                      }}
                    >
                      <Layers size={22} />
                    </div>
                    <span className="badge bg-light text-secondary border">
                      {cat.product_count || 0} Products
                    </span>
                  </div>

                  <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: '#1E293B' }}>
                    {cat.name}
                  </h5>
                  <p className="text-muted mb-3" style={{ fontSize: '0.82rem', minHeight: 40 }}>
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                {user?.is_admin && (
                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="btn btn-sm btn-outline-secondary p-1"
                      style={{ borderRadius: 6 }}
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="btn btn-sm btn-outline-danger p-1"
                      style={{ borderRadius: 6 }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveCategory}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Dairy Products, Beverages"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                      Description
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Brief details about what belongs in this category"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    Save Category
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

export default Categories;
