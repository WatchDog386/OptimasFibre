import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; 

// Consistent styling
const RISA_STYLES = {
  primaryColor: '#015B97',
  button: {
    primary: {
      base: 'px-4 py-2 bg-white text-[#015B97] border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm cursor-pointer',
      hover: 'hover:bg-[#015B97] hover:text-white hover:border-[#015B97]',
    },
    secondary: {
      base: 'px-4 py-2 bg-[#015B97] text-white border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm cursor-pointer',
      hover: 'hover:bg-white hover:text-[#015B97] hover:border-white',
    },
  },
  typography: {
    h3: 'text-xl font-bold',
    link: 'text-sm font-medium transition-colors cursor-pointer',
  },
};

export default function Footer({ darkMode = false }) {
  const colors = {
    bg: darkMode ? '#111827' : '#182B5C',
    textPrimary: darkMode ? '#f9fafb' : '#ffffff',
    textSecondary: darkMode ? '#d1d5db' : '#9ca3af',
    border: '#374151',
    linkHover: darkMode ? '#fbbf24' : '#d0b216',
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Coverage', path: '/coverage' },
    { name: 'Contact', path: '/contact' }
  ];

  const serviceLinks = [
    { name: 'High-Speed WiFi', path: '/services' },
    { name: 'Network Installation', path: '/services' },
    { name: 'Business Solutions', path: '/services' },
    { name: '24/7 Support', path: '/contact' },
    { name: 'Maintenance', path: '/services' }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="relative pt-12 pb-8 px-4 md:px-6 transition-colors duration-300"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className={`${RISA_STYLES.typography.h3} mb-2`} style={{ color: colors.textPrimary }}>
              Optimas WiFi
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
              Providing fast, reliable, and affordable WiFi solutions across Nairobi and Kenya.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className={`${RISA_STYLES.typography.h3} mb-2`} style={{ color: colors.textPrimary }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className={`${RISA_STYLES.typography.link} block hover:translate-x-1 transition-transform`}
                    style={{ color: colors.textSecondary }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.linkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className={`${RISA_STYLES.typography.h3} mb-2`} style={{ color: colors.textPrimary }}>
              Services
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((service, idx) => (
                <li key={idx}>
                  <Link
                    to={service.path}
                    className={`${RISA_STYLES.typography.link} block hover:translate-x-1 transition-transform`}
                    style={{ color: colors.textSecondary }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.linkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className={`${RISA_STYLES.typography.h3} mb-2`} style={{ color: colors.textPrimary }}>
              Contact Us
            </h3>
            <div className="space-y-3 text-sm" style={{ color: colors.textSecondary }}>
              <p className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Kahawa West, Nairobi, Kenya</span>
              </p>
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>+254 741 874 200</span>
              </p>
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {/* ✅ CORRECTED EMAIL BELOW ✅ */}
                <span>support@optimaswifi.co.ke</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t mt-10 pt-6" style={{ borderColor: colors.border }}>
          <p className="text-center md:text-left mb-4 md:mb-0 text-xs md:text-sm" style={{ color: colors.textSecondary }}>
            &copy; {new Date().getFullYear()} Optimas WiFi. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:justify-end items-center">
            <Link
              to="/admin/login"
              className={`${RISA_STYLES.button.secondary.base} ${RISA_STYLES.button.secondary.hover} inline-flex items-center`}
              style={{ textDecoration: 'none' }}
            >
              Admin Login
            </Link>

            <motion.button
              onClick={scrollToTop}
              className={`${RISA_STYLES.button.primary.base} ${RISA_STYLES.button.primary.hover} hidden md:inline-flex items-center`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ↑ Back to Top
            </motion.button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}