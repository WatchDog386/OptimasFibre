import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Menu, X, Phone, Mail, 
  Wifi, User, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Font family matching the reference
  const mainFont = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };

  return (
    <header className="fixed top-0 left-0 w-full z-[1000]" style={mainFont}>
      
      {/* ================= TOP UTILITY BAR ================= */}
      <div className="bg-[#004080] text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-6">
          {/* Mobile: Compact single row layout */}
          <div className="flex md:hidden items-center justify-between py-2 text-[11px]">
            <a href="tel:+254741874200" className="flex items-center gap-1.5 hover:text-gray-200 transition-colors">
              <Phone size={12} className="flex-shrink-0" /> 
              <span>+254 741 874 200</span>
            </a>
            <div className="h-3 w-px bg-white/30 mx-2" />
            <NavLink 
              to="/admin/login" 
              className="flex items-center gap-1.5 hover:text-gray-200 transition-colors whitespace-nowrap"
            >
              <User size={12} className="flex-shrink-0" /> 
              <span>Admin</span>
            </NavLink>
          </div>
          
          {/* Desktop: Full layout */}
          <div className="hidden md:flex items-center justify-between py-2.5 text-[13px]">
            <div className="flex items-center gap-6">
              <a href="tel:+254741874200" className="flex items-center gap-2 hover:text-gray-200 transition-colors">
                <Phone size={14} /> 
                <span>+254 741 874 200</span>
              </a>
              <a href="mailto:support@optimasfiber.co.ke" className="flex items-center gap-2 hover:text-gray-200 transition-colors">
                <Mail size={14} /> 
                <span>support@optimasfiber.co.ke</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <NavLink 
                to="/admin/login" 
                className="flex items-center gap-1.5 hover:text-gray-200 transition-colors"
              >
                <User size={14} /> 
                <span>Admin Portal</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN NAVBAR ================= */}
      <div
        className={`relative transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-2" : "bg-white py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-6 flex items-center justify-between">
          
          {/* BRAND LOGO - Reduced font size */}
          <NavLink to="/" className="flex items-center group">
            <div className="flex flex-col justify-center">
              <span className="text-lg md:text-xl font-bold text-[#004080] leading-none tracking-tight">
                OPTIMAS<span className="text-[#FF6B35]">FIBER</span>
              </span>
              <span className="text-[8px] md:text-[9px] font-semibold text-[#004080] tracking-[0.15em] leading-none mt-0.5 uppercase">
                The Best Internet
              </span>
            </div>
          </NavLink>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <NavLink
                  key={item.id}
                  to={item.route}
                  className={`text-[13px] font-medium transition-colors ${
                    isActive ? "text-[#004080] font-semibold" : "text-gray-700 hover:text-[#004080]"
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* DESKTOP CTA - Smaller */}
          <div className="hidden xl:flex items-center">
            <NavLink
              to="/coverage"
              className="px-6 py-2.5 bg-[#FF6B35] text-white text-[12px] tracking-wide uppercase font-semibold rounded-full transition-all shadow-md hover:bg-[#e55a2b] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
            >
              Check Coverage <Wifi size={14} strokeWidth={2.5} />
            </NavLink>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsOpen(true)}
            className="xl:hidden p-2 text-[#004080] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] xl:hidden"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[1002] xl:hidden shadow-2xl flex flex-col"
              style={{ position: 'fixed' }}
            >
              {/* Mobile Header */}
              <div className="flex-shrink-0 p-4 sm:p-5 border-b border-gray-100 bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-lg sm:text-xl font-bold text-[#004080] leading-none">
                      OPTIMAS<span className="text-[#FF6B35]">FIBER</span>
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-semibold text-[#004080] tracking-[0.15em] uppercase mt-0.5">
                      The Best Internet
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.route}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `
                        flex items-center justify-between p-3 sm:p-3.5 rounded-xl text-sm font-medium transition-all
                        ${isActive 
                          ? "bg-gradient-to-r from-[#004080] to-[#0056a8] text-white shadow-md" 
                          : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        }
                      `}
                    >
                      {item.label}
                      <ChevronRight size={16} className="opacity-50" />
                    </NavLink>
                  ))}
                </div>
                
                {/* Divider */}
                <div className="my-4 h-px bg-gray-200" />
                
                {/* Admin Portal Link */}
                <NavLink
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#004080]/10 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-[#004080]" />
                  </div>
                  <span>Admin Portal</span>
                </NavLink>
                
                {/* Contact Info */}
                <div className="mt-4 p-3 sm:p-4 rounded-xl bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Us</p>
                  <a 
                    href="tel:+254741874200"
                    className="flex items-center gap-3 text-sm text-gray-700 mb-2 hover:text-[#004080] transition-colors"
                  >
                    <Phone size={14} className="text-[#004080] flex-shrink-0" /> 
                    <span>+254 741 874 200</span>
                  </a>
                  <a 
                    href="mailto:support@optimasfiber.co.ke"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#004080] transition-colors"
                  >
                    <Mail size={14} className="text-[#004080] flex-shrink-0" /> 
                    <span className="truncate">support@optimasfiber.co.ke</span>
                  </a>
                </div>
              </div>

              {/* Mobile Footer Actions - Fixed at bottom */}
              <div className="flex-shrink-0 p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3">
                <NavLink 
                  to="/coverage"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#ff8555] text-white text-[13px] uppercase tracking-wide font-semibold rounded-full shadow-lg active:scale-[0.98] transition-transform"
                >
                  <Wifi size={16} />
                  Check Coverage
                </NavLink>
                
                <a 
                  href="tel:+254741874200"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#004080] rounded-full text-[13px] font-semibold text-[#004080] hover:bg-[#004080] hover:text-white active:scale-[0.98] transition-all"
                >
                  <Phone size={16} /> Call Support
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}