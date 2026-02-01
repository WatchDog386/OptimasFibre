import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Menu, X, Phone, Mail, 
  MapPin, Wifi, User, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- OPTIMAS STYLE CONSTANTS ---
const OPTIMAS_BLUE = "#182b5c"; 
const VUMA_DARK = "#2d2d2d";

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
    <header className="fixed top-0 left-0 w-full z-[1000] font-['Nunito']">
      
      {/* ================= TOP UTILITY BAR (Services Blue Theme) ================= */}
      <motion.div
        animate={{ height: scrolled ? 0 : 42, opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-[#182b5c] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 xl:px-6 h-full flex justify-between items-center text-[13px] font-bold tracking-wide">
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline opacity-80">Welcome to Optimas Fiber</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="tel:+254741874200" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
              <Phone size={14} fill="currentColor" /> <span>+254 741 874 200</span>
            </a>
            <NavLink to="/admin/login" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
              <User size={14} fill="currentColor" /> <span>My Account</span>
            </NavLink>
          </div>
        </div>
      </motion.div>

      {/* ================= MAIN NAVBAR ================= */}
      <div
        className={`relative transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
            : "bg-white py-5 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 xl:px-6 flex items-center justify-between">
          
          {/* BRAND ON LEFT SIDE - TEXT ONLY */}
          <NavLink to="/" className="hidden xl:flex items-center group">
            {/* TEXT BRANDING */}
            <div className="flex flex-col justify-center gap-0.5">
              {/* OPTIMAS TEXT - Purple with black outline effect */}
              <span className="text-3xl font-black text-purple-600 leading-none tracking-tight" style={{textShadow: '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black'}}>
                Optimas
              </span>
              {/* TAGLINE - Blue Italic */}
              <span className="text-xs font-bold text-blue-600 italic tracking-wide leading-none">
                The Best internet
              </span>
            </div>
          </NavLink>

          {/* DESKTOP NAVIGATION (Rounded Pills) */}
          <nav className="hidden xl:flex items-center bg-gray-50 px-2 py-1.5 rounded-full border border-gray-100">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <NavLink
                  key={item.id}
                  to={item.route}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-[#182b5c] text-white shadow-md transform scale-105" 
                      : "text-gray-600 hover:text-[#182b5c] hover:bg-white"
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* DESKTOP CTA (Check Coverage Style) */}
          <div className="hidden xl:flex items-center gap-4">
            <NavLink
              to="/coverage"
              className="group relative overflow-hidden px-8 py-3 bg-[#182b5c] text-white text-sm font-extrabold rounded-full transition-all shadow-[0_4px_14px_0_rgba(24,43,92,0.39)] hover:shadow-[0_6px_20px_rgba(24,43,92,0.23)] hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                CHECK COVERAGE <Wifi size={16} strokeWidth={3} />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </NavLink>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsOpen(true)}
            className="xl:hidden p-2 text-[#182b5c] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER (Right Side) ================= */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#2d2d2d]/80 backdrop-blur-sm z-[1001] xl:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[1002] xl:hidden overflow-y-auto font-['Nunito']"
            >
              <div className="p-6 flex flex-col h-full">
                
                {/* Mobile Header - Upgraded to match Desktop */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#182b5c] tracking-tighter leading-none">OPTIMAS</span>
                      <span className="text-[10px] font-extrabold text-[#182b5c] uppercase tracking-[0.2em] mt-1">HOME FIBER</span>
                    </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-[#182b5c] hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Mobile Nav Links */}
                <div className="flex-1 space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.route}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `
                        flex items-center justify-between p-4 rounded-2xl text-base font-bold transition-all
                        ${isActive 
                          ? "bg-[#182b5c] text-white shadow-lg shadow-blue-200" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#182b5c]"
                        }
                      `}
                    >
                      {item.label}
                      {location.pathname !== item.route && <ChevronRight size={16} className="text-gray-300" />}
                    </NavLink>
                  ))}
                  
                  <div className="my-4 h-px bg-gray-100" />
                  
                  <NavLink
                    to="/admin/login"
                    className="flex items-center gap-3 p-4 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <User size={18} className="text-[#182b5c]" /> Admin Portal
                  </NavLink>
                </div>

                {/* Mobile Footer Actions */}
                <div className="mt-6 space-y-4">
                  <NavLink 
                    to="/coverage"
                    className="flex items-center justify-center w-full py-4 bg-[#182b5c] text-white font-extrabold rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-all"
                  >
                    Check Coverage
                  </NavLink>
                  
                  <a 
                    href="tel:+254741874200"
                    className="flex items-center justify-center gap-2 py-4 border-2 border-gray-100 rounded-full text-sm font-bold text-gray-600 hover:border-[#182b5c] hover:text-[#182b5c] transition-colors"
                  >
                    <Phone size={18} /> Call Support
                  </a>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}