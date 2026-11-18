import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.warning('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(username, password);
      toast.success(`Welcome back, ${loggedUser.full_name || loggedUser.username}!`);
      if (loggedUser.is_admin) {
        navigate('/dashboard');
      } else {
        navigate('/billing');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundColor: '#F5F7FB',
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        padding: '1.5rem',
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Brand Top Header */}
        <div
          className="text-center p-4"
          style={{
            background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
            color: 'white',
          }}
        >
          <div
            className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow"
            style={{ width: 56, height: 56, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Store size={32} />
          </div>
          <h3 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>
            SuperMart
          </h3>
          <p className="mb-0 opacity-75" style={{ fontSize: '0.85rem' }}>
            Smart Supermarket Management & POS
          </p>
        </div>

        {/* Form Body */}
        <div className="p-4 p-sm-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.82rem' }}>
                Username
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                  <User size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  required
                  className="form-control border-start-0 py-2"
                  placeholder="admin or cashier"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ borderRadius: '0 10px 10px 0', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.82rem' }}>
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type="password"
                  required
                  className="form-control border-start-0 py-2"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: '0 10px 10px 0', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-4"
              style={{
                borderRadius: 10,
                fontWeight: 600,
                fontSize: '0.95rem',
                backgroundColor: '#2563EB',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Quick Test Credentials
              </span>
              <Sparkles size={14} className="text-warning" />
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickFill('madalavaruntej05', 'Varun@05')}
                className="btn btn-sm btn-outline-primary flex-grow-1 text-start p-2"
                style={{ borderRadius: 8, fontSize: '0.78rem' }}
              >
                <div className="fw-bold">Varun (Admin)</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>madalavaruntej05</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="btn btn-sm btn-outline-secondary flex-grow-1 text-start p-2"
                style={{ borderRadius: 8, fontSize: '0.78rem' }}
              >
                <div className="fw-bold">Admin Demo</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>admin / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cashier', 'cashier123')}
                className="btn btn-sm btn-outline-success flex-grow-1 text-start p-2"
                style={{ borderRadius: 8, fontSize: '0.78rem' }}
              >
                <div className="fw-bold text-success">Cashier Demo</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>cashier / cashier123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
