import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const BRAND = { PRIMARY: '#00356B', ACCENT: '#D85C2C' };

// Opened from the link in the password-reset email: /admin/reset-password?token=...
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus({ type: 'error', msg: 'Password must be at least 8 characters.' });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: 'error', msg: 'The two passwords do not match.' });
      return;
    }

    setStatus({ type: 'loading', msg: 'Saving...' });
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not reset password.');

      setStatus({ type: 'success', msg: 'Password changed. Redirecting to login...' });
      setTimeout(() => navigate('/admin/login', { replace: true }), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Server unreachable.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND.PRIMARY }}>Choose a new password</h1>

        {!token ? (
          <p className="text-gray-600">
            This reset link is incomplete. Request a new one from the{' '}
            <Link to="/admin/login" className="underline" style={{ color: BRAND.ACCENT }}>login page</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                autoComplete="new-password"
                className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
              required
            />

            {status.msg && (
              <div className={`flex items-center gap-2 text-sm ${status.type === 'error' ? 'text-red-600' : status.type === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                {status.type === 'error' && <AlertCircle size={16} />}
                {status.type === 'success' && <CheckCircle size={16} />}
                {status.type === 'loading' && <Loader2 size={16} className="animate-spin" />}
                <span>{status.msg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status.type === 'loading' || status.type === 'success'}
              className="w-full text-white font-semibold rounded-lg py-3 disabled:opacity-60"
              style={{ backgroundColor: BRAND.PRIMARY }}
            >
              Save new password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
