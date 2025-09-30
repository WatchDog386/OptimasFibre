import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, Shield, LogIn } from "lucide-react";
import { throttle } from "lodash-es";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import "../index.css";

// Define RISA's core styles as constants for consistency
const RISA_STYLES = {
  primaryColor: '#015B97',
  button: {
    // Primary Button: White bg, blue border/text -> Inverts on hover
    primary: {
      base: 'px-4 py-2 bg-white text-[#015B97] border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm',
      hover: 'hover:bg-[#015B97] hover:text-white hover:border-[#015B97]',
    },
    // Secondary Button: Blue bg, white text -> Inverts on hover
    secondary: {
      base: 'px-4 py-2 bg-[#015B97] text-white border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm',
      hover: 'hover:bg-white hover:text-[#015B97] hover:border-white',
    },
    // Small Button (e.g., for theme toggle)
    small: {
      base: 'px-3 py-1.5 text-sm font-medium border rounded-[50px] transition-colors',
      light: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100',
      dark: 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700',
    }
  },
  typography: {
    // Nav Link styles (matching RISA's medium weight and size)
    navLink: 'text-sm md:text-base font-medium transition-all duration-300',
    // Logo styles
    logo: {
      container: 'flex items-center gap-2 md:gap-3',
      image: {
        base: 'h-10 w-10 md:h-12 md:w-12',
      },
      text: {
        main: 'text-lg md:text-xl font-bold leading-tight tracking-tight',
        highlight: 'text-[#d0b216]',
        base: 'text-[#182B5C]',
      },
    },
    mobileNavLink: 'block px-4 py-3 rounded-lg font-medium text-base',
  }
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const { darkMode, toggleDarkMode } = useTheme();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAdmin(!!token);
  }, [location]);

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

  const currentPath = location.pathname === "/" ? "home" : location.pathname.slice(1);

  const menuItems = useMemo(
    () => [
      { label: "Home", route: "/", id: "home" },
      { label: "About Us", route: "/about", id: "about" },
      { label: "Blog", route: "/blog", id: "blog" },
      { label: "WiFi Plans", route: "/wifi-plans", id: "wifi-plans" },
      { label: "Coverage", route: "/coverage", id: "coverage" },
    ],
    []
  );

  const NavItem = ({ item }) => {
    return (
      <div className="relative group">
        <NavLink
          to={item.route}
          className={({ isActive }) =>
            `${RISA_STYLES.typography.navLink} ${
              isActive || (item.id === "home" && currentPath === "home")
                ? "text-[#d0b216]"
                : darkMode 
                  ? "text-white hover:text-[#d0b216]" 
                  : "text-[#182B5C] hover:text-[#d0b216]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span>{item.label}</span>
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#d0b216] transition-all duration-300 ${
                  isActive || (item.id === "home" && currentPath === "home")
                    ? "w-full"
                    : "group-hover:w-full"
                }`}
              />
            </>
          )}
        </NavLink>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAdmin(false);
    navigate('/');
  };

  // Apply dark mode class to body when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-[999] px-4 transition-all duration-300 ${
        darkMode 
          ? "bg-gray-900 py-3" 
          : "bg-white py-3"
      } ${scrolled && "shadow-md"}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - Left aligned */}
        <NavLink to="/" className={`${RISA_STYLES.typography.logo.container} flex-shrink-0`}>
          <img
            src="/oppo.jpg"
            alt="Optimas Home Fiber Logo"
            className={`${RISA_STYLES.typography.logo.image.base} object-contain rounded-full`}
            style={{
              filter: "brightness(1.2) contrast(1.2)",
              border: "2px solid #d0b216",
              padding: "2px",
              background: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
            }}
          />
          <div className="flex flex-col">
            <span className={RISA_STYLES.typography.logo.text.main}>
              <span className={RISA_STYLES.typography.logo.text.highlight}>OPTIMAS</span>
              <span className={darkMode ? "text-white" : RISA_STYLES.typography.logo.text.base}> HOME</span>
              <span className={RISA_STYLES.typography.logo.text.highlight}> FIBER</span>
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation - Right aligned and closer together */}
        <div className="hidden lg:flex items-center gap-6">
          {menuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Theme Toggle + Login/Admin + Mobile Menu Button - Right aligned */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Login / Admin Dashboard Link */}
          {!isAdmin ? (
            <NavLink
              to="/admin/login"
              className={`${RISA_STYLES.button.primary.base} ${RISA_STYLES.button.primary.hover} hidden md:flex items-center gap-1.5`}
              aria-label="Login to Admin"
            >
              <LogIn className="h-4 w-4" />
              Login
            </NavLink>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/admin"
                className={`${RISA_STYLES.button.secondary.base} ${RISA_STYLES.button.secondary.hover} flex items-center gap-1.5`}
                aria-label="Admin Dashboard"
              >
                <Shield className="h-4 w-4" />
                Admin
              </NavLink>
              <button
                onClick={handleLogout}
                className={`${RISA_STYLES.button.primary.base} ${RISA_STYLES.button.primary.hover}`}
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`${RISA_STYLES.button.small.base} ${
              darkMode ? RISA_STYLES.button.small.dark : RISA_STYLES.button.small.light
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2.5 rounded-full transition-colors ${
              darkMode 
                ? "bg-gray-700 hover:bg-gray-600" 
                : "bg-[#182B5C] hover:bg-[#0f1c3f]"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
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
            className={`lg:hidden overflow-hidden mt-2 rounded-lg shadow-xl border ${
              darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-1 p-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"} last:border-b-0`}
                >
                  <NavLink
                    to={item.route}
                    className={({ isActive }) =>
                      `${RISA_STYLES.typography.mobileNavLink} ${
                        isActive
                          ? "bg-[#182B5C] text-white font-semibold"
                          : darkMode 
                            ? "text-white hover:bg-gray-800" 
                            : "text-[#182B5C] hover:bg-gray-100"
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </div>
              ))}

              {/* Mobile: Login or Admin Link */}
              <div className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"} last:border-b-0 py-1`}>
                {!isAdmin ? (
                  <NavLink
                    to="/admin/login"
                    className={`${RISA_STYLES.button.primary.base} ${RISA_STYLES.button.primary.hover} w-full flex justify-center items-center gap-2`}
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </NavLink>
                ) : (
                  <>
                    <NavLink
                      to="/admin"
                      className={`${RISA_STYLES.button.secondary.base} ${RISA_STYLES.button.secondary.hover} w-full mb-2 flex justify-center items-center gap-2`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className={`${RISA_STYLES.button.primary.base} ${RISA_STYLES.button.primary.hover} w-full flex justify-center items-center gap-2`}
                    >
                      <LogIn className="h-4 w-4 transform rotate-180" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}