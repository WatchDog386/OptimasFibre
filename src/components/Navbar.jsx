import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, Phone, Mail,
 User, 
  Wifi, ChevronRight, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", route: "/", id: "home" },
  { label: "About", route: "/about", id: "about", dropdown: [
    { label: "About Us", route: "/about" },
    { label: "Services", route: "/services" },
    { label: "Blog", route: "/blog" },
    { label: "Careers", route: "/vacancies" },
  ]},
  { label: "Our Network", route: "/network", id: "network" },
  { label: "Contact Us", route: "/contact", id: "contact" },
];

const MobileNavItems = [
  { label: "Home", route: "/", id: "home" },
  { label: "About Us", route: "/about", id: "about" },
  { label: "Services", route: "/services", id: "services" },
  { label: "Our Network", route: "/network", id: "network" },
  { label: "Blog", route: "/blog", id: "blog" },
  { label: "Careers", route: "/vacancies", id: "careers" },
  { label: "Contact Us", route: "/contact", id: "contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full z-[1000] bg-[#F2F7F6] font-sans">
      
      {/* --- TOP UTILITY BAR --- */}
      <div className="hidden sm:block bg-[#004080] text-white py-3 text-[13px]">
        <div className="max-w-6xl mx-auto px-2.5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:+254741874200" className="hidden sm:flex items-center gap-1.5 hover:text-[#FF6B35]">
              <Phone size={14} /> +254 741 874 200
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="https://wa.me/254741874200" className="flex items-center gap-1.5 hover:text-[#FF6B35]">
              <Wifi size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* --- MAIN NAVBAR --- */}
      <div className="bg-[#F2F7F6] py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-2.5 flex items-center justify-between gap-8 lg:gap-14">
          
          <NavLink to="/" className="flex items-center flex-shrink-0">
             <img src="/logo.png" alt="OptimasFiber Logo" className="h-10 md:h-12 w-auto" />
          </NavLink>

          <nav className="hidden xl:flex items-center gap-8">
            {NAV_ITEMS.map((item) =>
              item.dropdown ? (
                <div key={item.id} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-1 text-[14px] md:text-[16px] font-bold tracking-wide transition-colors ${
                      location.pathname.startsWith("/about") || location.pathname === "/services" || location.pathname === "/blog" || location.pathname === "/vacancies"
                        ? "text-[#004080]" : "text-gray-700 hover:text-[#004080]"
                    }`}
                  >
                    {item.label} <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        {item.dropdown.map((sub) => (
                          <NavLink
                            key={sub.label}
                            to={sub.route}
                            onClick={() => setDropdownOpen(false)}
                            className={({ isActive }) =>
                              `block px-5 py-2.5 text-[14px] font-semibold transition-colors ${
                                isActive ? "text-[#004080] bg-blue-50" : "text-gray-700 hover:text-[#004080] hover:bg-gray-50"
                              }`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={item.id}
                  to={item.route}
                  className={({ isActive }) => 
                    `text-[14px] md:text-[16px] font-bold tracking-wide transition-colors ${
                      isActive ? "text-[#004080]" : "text-gray-700 hover:text-[#004080]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="hidden xl:flex">
            <NavLink
              to="/coverage"
              className="px-6 py-3 bg-[#2CA118] text-white text-[12px] md:text-[13px] uppercase font-bold shadow-lg hover:bg-[#238a13] transition-all"
            >
              Book An Installation
            </NavLink>
          </div>

          <button onClick={() => setIsOpen(true)} className="xl:hidden p-2 text-[#004080]">
            <Menu size={24} />
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
                    <img src="/logo.png" alt="OptimasFiber Logo" className="h-8 w-auto" />
                    <span className="text-[6px] sm:text-[7px] md:text-[8px] font-semibold text-[#004080] tracking-[0.15em] uppercase mt-0.5">
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
                  {MobileNavItems.map((item) => (
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