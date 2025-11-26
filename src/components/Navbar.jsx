import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Menu, X, Phone, Mail, 
  MapPin, Wifi, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- BRAND CONFIGURATION ---
const COLORS = {
  primary: '#015B97',
  primaryDark: '#004a7c',
  accent: '#d0b216',
  accentHover: '#b89c0f',
  text: '#334155',
};

const FONT_FAMILY = `'Proxima Nova', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

// --- NAV ITEMS ---
const NAV_ITEMS = [
  { label: "Home", route: "/", id: "home" },
  { label: "About", route: "/about", id: "about" },
  { label: "Services", route: "/services", id: "services" },
  { label: "Blog", route: "/blog", id: "blog" },
  { label: "FAQs", route: "/faqs", id: "faqs" },
  { label: "Contact", route: "/contact", id: "contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header 
      className="fixed top-0 left-0 w-full z-[1000]" 
      style={{ fontFamily: FONT_FAMILY }}
    >
      {/* ================= TOP UTILITY BAR ================= */}
      <motion.div
        animate={{ height: scrolled ? 0 : 40, opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-[#015B97] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 xl:px-6 h-full flex justify-between items-center text-xs font-medium tracking-wide">
          <div className="flex items-center gap-6">
            <a href="tel:+254741874200" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
              <Phone size={14} /> <span>+254 741 874 200</span>
            </a>
            <a href="mailto:support@optimaswifi.co.ke" className="hidden sm:flex items-center gap-2 hover:text-[#d0b216] transition-colors">
              <Mail size={14} /> <span>support@optimaswifi.co.ke</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/admin/login" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
              <User size={14} /> <span>Admin Portal</span>
            </NavLink>
            <a href="/coverage" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
              <MapPin size={14} /> <span>Check Coverage</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* ================= MAIN NAVBAR ================= */}
      <div
        className={`relative transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md py-3 border-slate-200"
            : "bg-white py-4 border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 xl:px-6 flex items-center justify-between">
          
          {/* LOGO */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border"
              style={{ borderColor: COLORS.accent }}
            >
              <img src="/oppo.jpg" alt="Optimas" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 leading-none tracking-tight">OPTIMAS</span>
              <span className="text-[10px] font-bold text-[#d0b216] uppercase tracking-widest">WIFI</span>
            </div>
          </NavLink>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <div key={item.id} className="relative h-full flex items-center">
                <NavLink
                  to={item.route}
                  className={({ isActive }) =>
                    `text-sm font-semibold relative py-2 transition-colors ${
                      isActive 
                        ? "text-[#015B97]" 
                        : "text-slate-600 hover:text-[#015B97]"
                    }`
                  }
                >
                  {item.label}
                  {location.pathname === item.route && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#015B97]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </NavLink>
              </div>
            ))}
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden xl:flex">
            <NavLink
              to="/coverage"
              className="px-6 py-2.5 bg-[#d0b216] hover:bg-[#b89c0f] text-white text-sm font-bold rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Wifi size={16} /> Get Connected
            </NavLink>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsOpen(true)}
            className="xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1001] xl:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[1002] xl:hidden overflow-y-auto"
            >
              <div className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      <Wifi size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-900">OPTIMAS WIFI</span>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Nav Links */}
                <div className="flex-1 space-y-2">
                  {NAV_ITEMS.map((item) => (
                    <div key={item.id} className="border-b border-slate-100 pb-2 last:border-0">
                      <NavLink
                        to={item.route}
                        className="block p-3 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                      >
                        {item.label}
                      </NavLink>
                    </div>
                  ))}

                  {/* Admin Section */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <NavLink
                      to="/admin/login"
                      className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <User size={16} className="text-slate-400" /> Admin Portal
                    </NavLink>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <NavLink 
                    to="/coverage"
                    className="flex items-center justify-center w-full py-3.5 bg-[#d0b216] text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
                  >
                    Get Connected Now
                  </NavLink>

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href="tel:+254741874200"
                      className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Phone size={16} /> Call
                    </a>
                    <a 
                      href="/coverage"
                      className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <MapPin size={16} /> Coverage
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}