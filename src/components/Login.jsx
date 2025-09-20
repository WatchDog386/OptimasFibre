import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Shield, Server, Database, Cpu, Home, Wifi, Sun, Moon, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Load saved theme preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
  }, []);

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token is still valid
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate('/admin');
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Token verification error:', err);
      localStorage.removeItem('token');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and refresh token if available
        localStorage.setItem('token', data.token);
        
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        navigate('/admin');
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Token refresh function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data.token;
      } else {
        // Refresh token failed, clear storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      return null;
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(data.message || 'Password reset instructions have been sent to your email address.');
        setForgotEmail('');
        setTimeout(() => setShowForgotModal(false), 3000);
      } else {
        setForgotError(data.message || 'Failed to send password reset instructions. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotError('Network error. Please check your connection and try again.');
    }
  };

  // Dynamic color tokens
  const colors = {
    bgGradient: darkMode 
      ? 'from-gray-900 to-blue-900' 
      : 'from-blue-50 to-blue-100',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: darkMode ? 'text-white' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    inputBorder: darkMode ? 'border-gray-700' : 'border-gray-300',
    inputFocus: darkMode ? 'focus:ring-blue-400' : 'focus:ring-blue-500',
    buttonPrimary: darkMode 
      ? 'from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950' 
      : 'from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900',
    statusBg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50',
    statusText: darkMode ? 'text-blue-300' : 'text-blue-800',
    modalBg: darkMode ? 'bg-gray-800' : 'bg-white',
    modalHeader: darkMode ? 'from-blue-800 to-blue-900' : 'from-blue-600 to-blue-800',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${colors.bgGradient} transition-colors duration-300`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Back to Home + Dark Mode Toggle */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[1.25rem] font-medium transition-all duration-300 shadow-md text-sm ${
            darkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-white/90 hover:bg-white text-blue-900'
          }`}
        >
          <Home size={16} />
          Back to Home
        </button>

        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full transition-colors ${
            darkMode 
              ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
              : 'bg-white/90 text-gray-700 hover:bg-white'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className={`max-w-5xl w-full flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-xl z-10 border ${darkMode ? 'border-blue-700/50' : 'border-blue-700 border-opacity-30'}`}>
        {/* Left Section */}
        <div className={`bg-gradient-to-br from-blue-950 to-blue-800 text-white p-6 md:p-8 flex flex-col items-center justify-center md:w-2/5 relative overflow-hidden ${darkMode ? 'from-gray-900 to-blue-950' : ''}`}>
          <div className="absolute inset-0 bg-blue-900 opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>

          <div className="relative z-10 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-white p-3 flex items-center justify-center shadow-xl border-4 border-blue-300">
                <img
                  src="/oppo.jpg"
                  alt="Optimas Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzljYTBiZCI+T3B0aW1hczwvdGV4dD48L3N2Zz4=';
                    e.target.onerror = null;
                  }}
                />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">Optimas</h1>
            <p className="text-base md:text-lg opacity-90 mb-4">Enterprise Admin Portal</p>
            <p className="text-xs opacity-80 mb-6">Secure access to management systems and controls</p>

            <div className="flex justify-center space-x-4 md:space-x-6 mt-8">
              {[
                { icon: <Server className="h-5 w-5" />, label: "Server Management" },
                { icon: <Database className="h-5 w-5" />, label: "Database Access" },
                { icon: <Cpu className="h-5 w-5" />, label: "System Controls" },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="bg-blue-700 bg-opacity-30 rounded-xl p-2 inline-flex mb-1">
                    {item.icon}
                  </div>
                  <p className="text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className={`${colors.cardBg} p-6 md:p-8 md:w-3/5 flex flex-col justify-center transition-colors duration-300`}>
          <div className="mb-6">
            <h2 className={`text-xl md:text-2xl font-bold ${colors.textPrimary} mb-2`}>Admin Login</h2>
            <p className={`${colors.textSecondary} text-sm`}>Enter your credentials to access the control panel</p>
          </div>

          {error && (
            <div className={`mb-4 p-3 rounded-xl text-xs flex items-start transition-colors duration-300 ${
              darkMode 
                ? 'bg-red-900/30 border border-red-800 text-red-300' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className={`p-1.5 rounded-full mr-2 ${
                darkMode ? 'bg-red-800/50' : 'bg-red-100'
              }`}>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <div className="font-medium">Authentication Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-semibold ${colors.textPrimary} mb-1`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent transition-all duration-200 ${colors.inputBorder} ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                  } text-sm`}
                  placeholder="Enter admin email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-semibold ${colors.textPrimary} mb-1`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent transition-all duration-200 ${colors.inputBorder} ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                  } text-sm`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className={`h-4 w-4 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
                  ) : (
                    <Eye className={`h-4 w-4 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 focus:ring-blue-500 rounded ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-blue-400' : 'border-gray-300 text-blue-600'
                  }`}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-xs ${colors.textPrimary}`}>
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className={`text-xs font-medium ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${colors.buttonPrimary} text-white py-3 px-4 rounded-[1.25rem] font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 text-sm`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  SIGNING IN...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  SIGN IN TO DASHBOARD
                </span>
              )}
            </button>
          </form>

          {/* System Status */}
          <div className={`mt-8 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`${colors.statusBg} p-3 rounded-lg`}>
              <h3 className={`text-xs font-semibold ${colors.statusText} mb-1 flex items-center`}>
                <Wifi className="mr-2 h-3 w-3" />
                System Status
              </h3>
              <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`${colors.modalBg} rounded-xl shadow-xl max-w-md w-full overflow-hidden border ${darkMode ? 'border-blue-800/50' : 'border-blue-100'} animate-scaleIn`}>
            <div className={`bg-gradient-to-r ${colors.modalHeader} text-white p-4 flex justify-between items-center`}>
              <h3 className="text-lg font-bold">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-white text-xl hover:text-blue-200 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="p-4">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>
                Enter your admin email address and we'll send you instructions to reset your password.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="forgot-email"
                  className={`block text-sm font-semibold ${colors.textPrimary} mb-1`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent ${colors.inputBorder} ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                    } text-sm`}
                    placeholder="admin@optimas.com"
                    required
                  />
                </div>
                {forgotError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {forgotError}
                  </p>
                )}
                {forgotSuccess && (
                  <p className="text-green-600 text-xs mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {forgotSuccess}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                    darkMode 
                      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-3 py-1.5 bg-gradient-to-r ${colors.buttonPrimary} text-white rounded-lg font-medium shadow-md transition-all text-xs`}
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Replaced <style jsx> with <style> */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
        .bg-grid-pattern {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .from-blue-950 { background-color: #0a1228; }
      `}</style>
    </div>
  );
};

export default Login;