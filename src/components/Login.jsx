import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Facebook, Twitter, Instagram, Youtube, 
  Eye, EyeOff, Check, ArrowRight, Loader2, 
  Home, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ type: '', msg: '' });
  
  const navigate = useNavigate();
  const API_BASE_URL = 'https://optimasfibre.onrender.com'; 

  // Background Image (Mountain Sunset similar to reference)
  const BG_IMAGE = "https://images.unsplash.com/photo-1491466424936-e304919aada7?q=80&w=2069&auto=format&fit=crop";

  // --- AUTH LOGIC ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) verifyToken(token);
  }, []);

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
        navigate('/admin');
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Server unreachable.');
    } finally {
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

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans"
      style={{ 
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-0"></div>

      {/* Home Button (Top Left) */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
      >
        <Home size={16} /> Back Home
      </button>

      <div className="container mx-auto px-6 relative z-10 w-full max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center min-h-[80vh] gap-12">
          
          {/* --- LEFT SIDE: WELCOME TEXT --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 text-white space-y-6"
          >
            <div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Welcome <br /> Back
              </h1>
            </div>
            
            <p className="text-white/80 text-sm md:text-base max-w-md leading-relaxed">
              It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using our portal is seamless management.
            </p>

            <div className="flex gap-4 pt-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black backdrop-blur-sm flex items-center justify-center transition-all duration-300 text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT SIDE: LOGIN FORM --- */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-[400px] text-white"
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">Sign in</h2>
            </div>

            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded mb-4 text-sm flex items-center gap-2"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-gray-900 px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#d0b216] transition-all"
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-medium ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#d0b216] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 border flex items-center justify-center cursor-pointer transition-colors ${rememberMe ? 'bg-[#d0b216] border-[#d0b216]' : 'bg-transparent border-white'}`}
                >
                  {rememberMe && <Check size={12} className="text-black" />}
                </div>
                <label onClick={() => setRememberMe(!rememberMe)} className="text-sm cursor-pointer select-none">
                  Remember Me
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-[#d0b216] hover:bg-[#b89c0f] text-[#182b5c] font-bold rounded-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign in now'}
              </button>

              <div className="pt-4">
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Lost your password?
                </button>
              </div>

            </form>

            <div className="mt-12 text-xs text-white/60 leading-relaxed">
              By clicking on "Sign in now" you agree to our <br/>
              <a href="#" className="underline hover:text-white">Terms of Service</a> | <a href="#" className="underline hover:text-white">Privacy Policy</a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL (Dark Glass) --- */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md p-8 rounded-lg bg-[#182b5c] text-white shadow-2xl border border-white/10"
            >
               <h3 className="text-2xl font-bold mb-2">Password Recovery</h3>
               <p className="text-white/60 text-sm mb-6">Enter your email to receive reset instructions.</p>
               
               <form onSubmit={handleForgotPassword} className="space-y-4">
                 <div>
                   <label className="text-xs font-bold uppercase tracking-wider block mb-2 text-white/60">Email Address</label>
                   <input 
                      type="email" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-sm bg-black/30 border border-white/10 text-white focus:border-[#d0b216] outline-none transition-colors"
                      placeholder="admin@optimas.com"
                      required
                   />
                 </div>

                 {forgotStatus.msg && (
                   <div className={`text-xs p-3 rounded text-center font-medium ${
                     forgotStatus.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
                   }`}>
                     {forgotStatus.msg}
                   </div>
                 )}

                 <div className="flex gap-3 pt-2">
                   <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 py-3 text-sm font-bold hover:bg-white/10 rounded-sm transition-colors">CANCEL</button>
                   <button type="submit" className="flex-1 py-3 bg-[#d0b216] text-[#182b5c] font-bold text-sm hover:bg-[#b89c0f] rounded-sm transition-colors shadow-lg">SEND LINK</button>
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