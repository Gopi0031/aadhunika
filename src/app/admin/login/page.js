'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import './login.css';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      formData.email === 'admin@hospital.com' &&
      formData.password === 'admin123'
    ) {
      toast.success('✅ Login successful!');
      setTimeout(() => router.push('/admin/dashboard'), 1000);
    } else {
      toast.error('❌ Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🏥 Admin Login</h1>
        <p className="login-subtitle">
          Demo: admin@hospital.com / admin123
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? '🔄 Logging in...' : '🚀 Enter Dashboard'}
          </button>
        </form>

        <div className="login-footer">
          Forgot password? <a href="#">Reset</a>
        </div>
      </div>
    </div>
  );
}
