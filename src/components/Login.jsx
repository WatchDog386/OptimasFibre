import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Loader2, 
  CheckCircle, AlertCircle, User
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const BRAND = {
  PRIMARY: "#00356B", // Deep Blue
  ACCENT: "#D85C2C",  // The Orange/Rust color
  GREEN: "#86bc25",   // The Green accent
};

const Login = () => {
  // --- LOGIC: STATE (DO NOT TOUCH) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ type: '', msg: '' });
  
  const navigate = useNavigate();
  const API_BASE_URL = 'https://optimasfibre.onrender.com'; 

  // --- LOGIC: EFFECTS & HANDLERS (DO NOT TOUCH) ---
  const BG_IMAGE = "https://t4.ftcdn.net/jpg/03/57/34/39/360_F_357343965_u58BFcRrziBVMqgt6liwPHJKcIjHsPnc.jpg";

  useEffect(() => {
    // Check if already logged in and redirect to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    }
  }, [success, navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) navigate('/admin');
      else localStorage.removeItem('token');
    } catch (err) {
      localStorage.removeItem('token');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        setSuccess(true);
      } else {
        setError(data.message || 'Invalid credentials.');
        setLoading(false);
      }
    } catch (err) {
      setError('Server unreachable.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus({ type: 'loading', msg: 'Sending...' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setForgotStatus({ type: 'success', msg: 'Reset link sent.' });
        setTimeout(() => setShowForgotModal(false), 3000);
      } else {
        setForgotStatus({ type: 'error', msg: data.message || 'Failed to send.' });
      }
    } catch (err) {
      setForgotStatus({ type: 'error', msg: 'Network error.' });
    }
  };

  // --- UI RENDER ---
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('${BG_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"></div>

      {/* MAIN CARD CONTAINER */}
      <div className="relative bg-white rounded-[20px] shadow-2xl overflow-hidden w-full max-w-[900px] min-h-[550px] flex flex-col md:flex-row z-10">
        
        {/* --- LEFT SIDE: LOGIN FORM --- */}
        <div className="w-full md:w-[50%] p-8 sm:p-12 flex flex-col justify-center relative bg-white">
          <div className="max-w-[320px] w-full mx-auto">
            
            <h1 className="text-3xl font-bold text-center mb-8" style={{ color: BRAND.PRIMARY }}>
              Sign In
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#00356B] focus:ring-1 focus:ring-[#00356B] transition-all"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#00356B] focus:ring-1 focus:ring-[#00356B] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-[#00356B] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-50 text-red-600 text-xs p-2 rounded text-center flex items-center justify-center gap-2"
                  >
                    <AlertCircle size={14} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Button - Rust/Orange Color */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-bold uppercase tracking-wide text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
                style={{ backgroundColor: BRAND.ACCENT }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "LOGIN"}
              </button>
            </form>


          </div>
        </div>

        {/* --- RIGHT SIDE: DECORATIVE PANEL (Desktop) --- */}
        <div 
          className="hidden md:flex w-[50%] flex-col items-center justify-center p-8 text-center text-white relative"
          style={{ 
            backgroundColor: BRAND.PRIMARY,
            // These border radiuses create the specific curve shown in the image
            borderTopLeftRadius: '100px',
            borderBottomLeftRadius: '30px'
          }}
        >
          <div className="relative z-10 flex flex-col items-center">
            {/* User Icon Circle */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border-4" style={{ borderColor: BRAND.GREEN }}>
              <User size={32} color={BRAND.PRIMARY} />
            </div>

            {/* Admin Portal Title */}
            <h2 className="text-3xl font-light mb-2">
              <span style={{ color: 'white' }}>Optimas Wifi</span> <span style={{ fontWeight: 'bold', color: 'white' }}>Admin Portal</span>
            </h2>
            <p className="text-sm text-gray-300 mb-8 max-w-[250px]">
              Manage your content, invoices, receipts, and more.
            </p>

            {/* UPDATED BUTTON TO "Back Home" */}
            <button
              onClick={() => navigate('/')} 
              className="bg-white text-[#00356B] text-xs font-bold py-3 px-10 rounded-full shadow-lg hover:bg-gray-100 transition-colors uppercase tracking-wider"
            >
              Back Home
            </button>
          </div>
        </div>

        {/* SUCCESS OVERLAY */}
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Welcome Back!</h2>
              <p className="text-gray-500 text-sm mt-1">Redirecting you to dashboard...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold mb-2 text-center" style={{ color: BRAND.PRIMARY }}>Recovery</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">Enter your email to receive a reset link.</p>
                
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input 
                  type="email" 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-gray-50 border border-gray-200 text-sm focus:border-[#00356B] focus:ring-1 focus:ring-[#00356B] outline-none"
                  placeholder="admin@optimaswifi.co.ke"
                  required
                />

                {forgotStatus.msg && (
                  <div className={`text-xs p-3 rounded text-center font-medium ${
                    forgotStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {forgotStatus.msg}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(false)} 
                    className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 text-xs font-bold text-white rounded-full transition-colors hover:opacity-90 shadow"
                    style={{ backgroundColor: BRAND.ACCENT }}
                  >
                    SEND LINK
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;