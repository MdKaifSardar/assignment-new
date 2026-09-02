import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Store, UserPlus } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client side pre-check to give instant feedback for PDF validation rules
    if (name.length < 20 || name.length > 60) {
      setError(`Name must be between 20 and 60 characters (current: ${name.length} chars)`);
      return;
    }
    if (address.length > 400) {
      setError(`Address cannot exceed 400 characters`);
      return;
    }
    if (password.length < 8 || password.length > 16) {
      setError(`Password must be between 8 and 16 characters`);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError(`Password must contain at least one uppercase letter`);
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError(`Password must contain at least one special character`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        address,
        password,
      });

      const { token, user } = response.data;
      login(token, user);
      navigate('/stores');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="brand-icon" style={{ margin: '0 auto 0.75rem auto' }}>
            <Store size={28} />
          </div>
          <h1>Create Account</h1>
          <p>Register as a Normal User to explore and rate stores</p>
        </div>

        {error && (
          <div
            className="card"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.78rem', color: name.length < 20 ? '#f59e0b' : '#10b981' }}>
                {name.length}/60 chars (min 20)
              </span>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alexander Johnathon Montgomery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="helper-text">Must be between 20 and 60 characters long.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Full street address, city, country..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={400}
              required
            />
            <p className="helper-text">Maximum 400 characters.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="e.g. UserPass123!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="helper-text">
              8-16 characters, 1 uppercase letter, 1 special character.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Registering...' : 'Sign Up'}</span>
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
