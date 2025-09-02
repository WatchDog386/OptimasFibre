import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { throttle } from "lodash-es";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

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

  const menuItems = useMemo(() => [
    { label: "Home", route: "/", id: "home" },
    { label: "About Us", route: "/about", id: "about" },
    { label: "Services", route: "/services", id: "services" },
    { label: "WiFi Plans", route: "/wifi-plans", id: "wifi-plans" },
    { label: "Coverage", route: "/coverage", id: "coverage" },
    { label: "FAQs", route: "/faqs", id: "faqs" },
    { label: "Contact", route: "/contact", id: "contact" }
  ], []);

  const NavItem = ({ item }) => {
    const commonClasses = "relative pb-1.5 px-1 font-medium transition-all duration-300 group flex items-center justify-center";

    return (
      <div className="relative group">
        <NavLink
          to={item.route}
          className={({ isActive }) =>
            `${commonClasses} ${
              isActive || (item.id === "home" && currentPath === "home")
                ? "text-[#182b5c]"
                : "text-gray-700 hover:text-[#182b5c]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.label}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#182b5c] transition-transform duration-300 ${
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
      className={`fixed top-0 left-0 w-full z-[999] px-4 py-3 transition-all duration-500 bg-white shadow-sm`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NavLink 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold tracking-tight transition-all duration-300"
        >
          <img 
            src="/oppo.jpg" 
            alt="Optima Fibre Logo" 
            className="h-12 w-auto object-contain filter brightness-105 contrast-110"
            style={{ imageRendering: "crisp-edges" }}
          />
        </NavLink>

        <div className="hidden md:flex items-center justify-center flex-1 mx-8">
          <div className="flex items-center justify-between w-full max-w-2xl">
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: {
                opacity: { duration: 0.2 },
                height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              }
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                opacity: { duration: 0.1 },
                height: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
            }}
            className="md:hidden overflow-hidden bg-white mt-3 rounded-lg shadow-md"
          >
            <div className="flex flex-col gap-4 pb-4 pt-4">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <NavLink
                    to={item.route}
                    className={({ isActive }) =>
                      `block px-4 py-2 ${
                        isActive
                          ? "text-[#182b5c] font-medium"
                          : "text-gray-700 hover:text-[#182b5c]"
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