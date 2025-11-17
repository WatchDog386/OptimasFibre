// Redesigned Navbar Matching Provided Layout Style (Top Contact Bar + Social Icons + Main Navbar Card) without WiFi Plans
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { throttle } from "lodash-es";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import "../index.css";

const RISA_STYLES = {
  primaryColor: '#015B97',
  button: {
    small: {
      base: 'px-3 py-1.5 text-sm font-medium border rounded-full transition-colors',
      light: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100',
      dark: 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700',
    }
  },
  typography: {
    navLink: 'text-sm md:text-base font-medium transition-all duration-300',
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
  const location = useLocation();
  const navRef = useRef(null);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleScroll = useCallback(
    throttle(() => setScrolled(window.scrollY > 50), 100),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const currentPath = location.pathname === "/" ? "home" : location.pathname.slice(1);

  const menuItems = useMemo(
    () => [
      { label: "Home", route: "/", id: "home" },
      { label: "About Us", route: "/about", id: "about" },
      { label: "Blog", route: "/blog", id: "blog" },
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

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-[999] px-4 transition-all duration-300 ${
        darkMode ? "bg-gray-900 py-3" : "bg-white py-3"
      } ${scrolled && "shadow-md"}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
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

        <div className="hidden lg:flex items-center gap-8">
          {menuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={toggleDarkMode}
            className={`${RISA_STYLES.button.small.base} ${
              darkMode ? RISA_STYLES.button.small.dark : RISA_STYLES.button.small.light
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            className={`lg:hidden p-2.5 rounded-full transition-colors ${
              darkMode 
                ? "bg-gray-700 hover:bg-gray-600" 
                : "bg-[#182B5C] hover:bg-[#0f1c3f]"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
