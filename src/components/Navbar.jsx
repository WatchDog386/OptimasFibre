import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Menu, X, Phone, Mail, 
  MapPin, Wifi, ArrowRight, User, Globe, Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONFIGURATION ---
const COLORS = {
  primary: '#015B97',
  primaryDark: '#004a7c',
  accent: '#d0b216',
  accentHover: '#b89c0f',
};

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

  // --- TOP UTILITY BAR ---
  const TopUtilityBar = () => (
    <div className="hidden xl:flex justify-between items-center py-2 px-6 text-xs uppercase tracking-wider font-bold text-white transition-all duration-300 z-[1001] relative"
         style={{ backgroundColor: COLORS.primary }}>
      <div className="flex items-center gap-6">
        <a href="tel:+254741874200" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
          <Phone size={12} fill="currentColor" /> +254 741 874 200
        </a>
        <a href="mailto:support@optimaswifi.co.ke" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
          <Mail size={12} /> support@optimaswifi.co.ke
        </a>
      </div>
      <div className="flex items-center gap-4">
        <NavLink to="/admin/login" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
          <User size={12} /> Admin portal
        </NavLink>
        <span className="opacity-30">|</span>
        <a href="/coverage" className="flex items-center gap-2 hover:text-[#d0b216] transition-colors">
          <MapPin size={12} /> Check Coverage
        </a>
      </div>
    </div>
  );

  const DesktopNavItem = ({ label, route }) => {
    const isActive = location.pathname === route;
    
    return (
      <div className="relative h-full flex items-center">
        <NavLink
          to={route}
          className={`relative z-10 flex items-center gap-1 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200 rounded-md group
            ${isActive ? "text-[#015B97]" : "text-gray-600 hover:text-[#015B97]"}`}
        >
          {label}
          
          {/* Hover Underline Animation */}
          <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#015B97] transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
        </NavLink>
      </div>
    );
  };

  return (
    <>
      {/* --- UTILITY BAR --- */}
      <motion.div 
        animate={{ height: scrolled ? 0 : 'auto', opacity: scrolled ? 0 : 1 }} 
        className="overflow-hidden bg-[#015B97]"
      >
        <TopUtilityBar />
      </motion.div>
      
      {/* --- MAIN NAVBAR --- */}
      <nav
        className={`
          sticky top-0 z-[1000] w-full transition-all duration-300 border-b
          ${scrolled 
            ? "bg-white/90 backdrop-blur-md shadow-sm border-gray-200 py-2" 
            : "bg-white border-transparent py-3"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* BRANDING */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className={`relative rounded-full overflow-hidden border p-0.5 transition-all duration-300 ${scrolled ? 'w-9 h-9' : 'w-11 h-11'}`}
                 style={{ borderColor: COLORS.accent }}>
              <img src="/oppo.jpg" alt="Logo" className="h-full w-full object-cover rounded-full" />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`font-black tracking-tighter transition-all ${scrolled ? 'text-xl' : 'text-2xl'}`} style={{ color: COLORS.primary }}>
                OPTIMAS
              </span>
              <div className="flex items-center gap-1">
                <span className="h-0.5 w-3 bg-[#d0b216] rounded-full"></span>
                <span className="text-[10px] font-bold tracking-widest text-[#d0b216]">WIFI</span>
              </div>
            </div>
          </NavLink>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden xl:flex items-center gap-2">
            <DesktopNavItem label="Home" route="/" />
            <DesktopNavItem label="About" route="/about" />
            <DesktopNavItem label="Services" route="/services" />
            <DesktopNavItem label="Blog" route="/blog" />
            <DesktopNavItem label="FAQs" route="/faqs" />
            <DesktopNavItem label="Contact" route="/contact" />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex">
              <NavLink
                to="/coverage"
                className="relative overflow-hidden px-6 py-2.5 rounded-sm font-bold text-white shadow-md transform transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2 group text-sm uppercase tracking-widest"
                style={{ backgroundColor: COLORS.accent }}
              >
                <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                <span>Get Connected</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </NavLink>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 rounded-md text-[#015B97] hover:bg-blue-50 transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1002] xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-xs bg-white z-[1003] shadow-2xl xl:hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-base font-black uppercase tracking-widest text-[#015B97]">Menu</span>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-white border border-gray-200 rounded-md text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <NavLink to="/" className="flex items-center gap-3 p-3 rounded-lg text-base font-bold text-gray-800 hover:bg-blue-50 hover:text-[#015B97] transition-colors">Home</NavLink>
                <NavLink to="/about" className="flex items-center gap-3 p-3 rounded-lg text-base font-bold text-gray-800 hover:bg-blue-50 hover:text-[#015B97] transition-colors">About Us</NavLink>
                <NavLink to="/services" className="flex items-center gap-3 p-3 rounded-lg text-base font-bold text-gray-800 hover:bg-blue-50 hover:text-[#015B97] transition-colors">Services</NavLink>
                <NavLink to="/blog" className="flex items-center gap-3 p-3 rounded-lg text-base font-bold text-gray-800 hover:bg-blue-50 hover:text-[#015B97] transition-colors">Blog</NavLink>
                <NavLink to="/faqs" className="flex items-center gap-3 p-3 rounded-lg text-base font-bold text-gray-800 hover:bg-blue-50 hover:text-[#015B97] transition-colors">FAQs</NavLink>
                <NavLink to="/contact" className="flex items-center gap-3 p-3 rounded-lg text-base font-bold text-gray-800 hover:bg-blue-50 hover:text-[#015B97] transition-colors">Contact</NavLink>
                
                <div className="pt-4 mt-4 border-t border-gray-100">
                   <NavLink to="/admin/login" className="flex items-center gap-3 p-3 rounded-lg text-sm font-bold text-gray-500 hover:text-[#015B97] transition-colors">
                      <User size={16} /> Admin Portal
                   </NavLink>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <NavLink
                  to="/coverage"
                  className="flex w-full justify-center items-center gap-2 py-4 rounded-md text-white text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <Wifi size={18} />
                  Get Connected
                </NavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}