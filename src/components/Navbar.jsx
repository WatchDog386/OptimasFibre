import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { throttle } from "lodash-es";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import "../index.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const { darkMode, toggleDarkMode } = useTheme();
  const fullText = "OPTIMAS HOME FIBRE";

  // Scroll handler
  const handleScroll = useCallback(
    throttle(() => setScrolled(window.scrollY > 50), 100),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Typewriter effect for logo text
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const cursorTimeout = setTimeout(() => {
        setShowCursor(false);
      }, 500);
      return () => clearTimeout(cursorTimeout);
    }
  }, [currentIndex]);

  const currentPath = location.pathname === "/" ? "home" : location.pathname.slice(1);

  const menuItems = useMemo(
    () => [
      { label: "Home", route: "/", id: "home" },
      { label: "About Us", route: "/about", id: "about" },
      { label: "Services", route: "/services", id: "services" },
      { label: "WiFi Plans", route: "/wifi-plans", id: "wifi-plans" },
      { label: "Coverage", route: "/coverage", id: "coverage" },
      { label: "FAQs", route: "/faqs", id: "faqs" },
      { label: "Contact", route: "/contact", id: "contact" },
    ],
    []
  );

  const NavItem = ({ item }) => {
    const commonClasses =
      "relative pb-1.5 px-3 font-medium transition-all duration-300 group flex items-center justify-center";

    return (
      <div className="relative group">
        <NavLink
          to={item.route}
          className={({ isActive }) =>
            `${commonClasses} ${
              isActive || (item.id === "home" && currentPath === "home")
                ? "text-[#d0b216] font-semibold"
                : "text-[#182B5C] dark:text-white hover:text-[#d0b216] dark:hover:text-[#d0b216]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.label}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#d0b216] transition-transform duration-300 ${
                  isActive || (item.id === "home" && currentPath === "home")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </>
          )}
        </NavLink>
      </div>
    );
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-[999] px-4 transition-all duration-300 ${
        scrolled
          ? darkMode 
            ? "bg-black shadow-md py-2" 
            : "bg-white shadow-md py-2"
          : darkMode 
            ? "bg-black py-3" 
            : "bg-white py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 transition-all duration-300 group">
          <div className="flex items-center justify-center rounded-full transition-shadow">
            <img
              src="/oppo.jpg"
              alt="Optimas Home Fibre Logo"
              className="h-20 w-20 object-contain rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold leading-tight">
              <span className="text-[#d0b216]">OPTIMAS</span>
              <span className="text-orange-500"> HOME</span>
              <span className="text-[#d0b216]"> FIBRE</span>
              {showCursor && (
                <span className="inline-block w-0.5 h-6 bg-[#d0b216] ml-1 animate-pulse"></span>
              )}
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
          <div className="flex items-center justify-between w-full max-w-2xl">
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Theme Toggle + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {/* Modern Golden Yellow Animated Toggle Switch */}
          <div className="flex items-center">
            <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="theme-toggle" 
                  className="sr-only" 
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <div className={`w-14 h-7 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full transition-colors duration-300`}></div>
                <motion.div 
                  className="absolute left-1 top-1 bg-gradient-to-r from-amber-300 to-yellow-500 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ x: darkMode ? 26 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: darkMode ? 180 : 0, scale: darkMode ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {darkMode ? (
                      <Moon className="h-3 w-3 text-gray-900" />
                    ) : (
                      <Sun className="h-3 w-3 text-amber-900" />
                    )}
                  </motion.div>
                </motion.div>
                {/* Golden glow effect when toggled */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  initial={false}
                  animate={{ 
                    boxShadow: darkMode 
                      ? "0 0 0 0 rgba(208, 178, 22, 0)" 
                      : "0 0 15px 3px rgba(208, 178, 22, 0.7)" 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </label>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-[#182B5C] dark:text-white" />
            ) : (
              <Menu className="h-6 w-6 text-[#182B5C] dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: {
                opacity: { duration: 0.2 },
                height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                opacity: { duration: 0.1 },
                height: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className={`lg:hidden overflow-hidden mt-3 rounded-lg shadow-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex flex-col gap-1 p-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}
                >
                  <NavLink
                    to={item.route}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg ${
                        isActive
                          ? "bg-[#182B5C] text-white font-semibold"
                          : `text-[#182B5C] dark:text-white hover:${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`
                      } transition-colors`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}