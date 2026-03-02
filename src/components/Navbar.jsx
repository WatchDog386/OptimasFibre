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

  // Font family matching the reference
  const mainFont = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };

  return (
    <header className="fixed top-0 left-0 w-full z-[1000]" style={mainFont}>
      
      {/* ================= TOP UTILITY BAR ================= */}
      <div className="bg-[#004080] text-white">
        <div className="max-w-7xl mx-auto px-4 xl:px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center text-[13px]">
          <div className="flex items-center gap-6 mb-2 sm:mb-0">
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

      {/* ================= MAIN NAVBAR ================= */}
      <div
        className={`relative transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-2" : "bg-white py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 xl:px-6 flex items-center justify-between">
          
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
          >
            <Menu size={22} />
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] xl:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[1002] xl:hidden overflow-y-auto shadow-2xl"
            >
              <div className="p-6 flex flex-col h-full">
                
                {/* Mobile Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-[#004080] leading-none">
                      OPTIMAS<span className="text-[#FF6B35]">FIBER</span>
                    </span>
                    <span className="text-[8px] font-semibold text-[#004080] tracking-[0.15em] uppercase mt-0.5">
                      The Best Internet
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                        flex items-center justify-between p-4 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? "bg-[#004080] text-white" 
                          : "text-gray-700 hover:bg-gray-50 hover:text-[#004080]"
                        }
                      `}
                    >
                      {item.label}
                      <ChevronRight size={16} className={isActive ? "text-white/60" : "text-gray-300"} />
                    </NavLink>
                  ))}
                  
                  <div className="my-4 h-px bg-gray-200" />
                  
                  <NavLink
                    to="/admin/login"
                    className="flex items-center gap-3 p-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={18} className="text-[#004080]" /> 
                    Admin Portal
                  </NavLink>
                </div>

                {/* Mobile Footer Actions */}
                <div className="mt-6 space-y-3">
                  <NavLink 
                    to="/coverage"
                    className="flex items-center justify-center w-full py-4 bg-[#FF6B35] text-white text-[13px] uppercase tracking-wide font-semibold rounded-full shadow-lg active:scale-[0.98] transition-transform"
                  >
                    Check Coverage
                  </NavLink>
                  
                  <a 
                    href="tel:+254741874200"
                    className="flex items-center justify-center gap-2 py-3 border-2 border-[#004080] rounded-full text-[13px] font-semibold text-[#004080] hover:bg-[#004080] hover:text-white transition-colors"
                  >
                    <Phone size={16} /> Call Support
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