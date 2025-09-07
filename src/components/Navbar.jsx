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
  const fullText = "OPTIMAS HOME FIBER";

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
      "relative pb-1.5 px-2 font-medium transition-all duration-300 group flex items-center justify-center";

    return (
      <div className="relative group">
        <NavLink
          to={item.route}
          className={({ isActive }) =>
            `${commonClasses} ${
              isActive || (item.id === "home" && currentPath === "home")
                ? "text-[#d0b216] font-semibold"
                : "text-[#182B5C] dark:text-[#182B5C] hover:text-[#d0b216] dark:hover:text-[#d0b216]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="text-sm lg:text-base">{item.label}</span>
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
            ? "bg-white shadow-md py-2" 
            : "bg-white shadow-md py-2"
          : darkMode 
            ? "bg-white py-3" 
            : "bg-white py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 transition-all duration-300 group">
          <div className="flex items-center justify-center rounded-full transition-shadow logo-container">
            <img
              src="/oppo.jpg"
              alt="Optimas Home Fiber Logo"
              className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-full logo-image"
              style={{
                filter: "brightness(1.2) contrast(1.2)",
                border: "2px solid #d0b216",
                padding: "4px",
                background: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold leading-tight">
              <span className="text-[#d0b216]">OPTIMAS</span>
              <span className="text-[#182B5C]"> HOME</span>
              <span className="text-[#d0b216]"> FIBER</span>
              {showCursor && (
                <span className="inline-block w-0.5 h-4 md:h-6 bg-[#d0b216] ml-1 animate-pulse"></span>
              )}
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-4 2xl:mx-8">
          <div className="flex items-center justify-between w-full max-w-2xl">
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Theme Toggle + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {/* Improved Theme Toggle with Sun/Moon Icons */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-[#d0b216]" />
            ) : (
              <Moon className="h-5 w-5 text-[#182B5C]" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg bg-[#182B5C] hover:bg-[#0f1c3f] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
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
            className="lg:hidden overflow-hidden mt-3 rounded-lg shadow-xl border border-gray-200 bg-white"
          >
            <div className="flex flex-col gap-1 p-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <NavLink
                    to={item.route}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg ${
                        isActive
                          ? "bg-[#182B5C] text-white font-semibold"
                          : "text-[#182B5C] hover:bg-gray-100"
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