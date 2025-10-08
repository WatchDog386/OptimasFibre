import React from "react";
import { motion } from "framer-motion";

// Define RISA's core styles as constants for consistency
const RISA_STYLES = {
  primaryColor: '#015B97',
  button: {
    primary: {
      base: 'px-4 py-2 bg-white text-[#015B97] border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm',
      hover: 'hover:bg-[#015B97] hover:text-white hover:border-[#015B97]',
    },
    secondary: {
      base: 'px-4 py-2 bg-[#015B97] text-white border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm',
      hover: 'hover:bg-white hover:text-[#015B97] hover:border-white',
    },
    small: {
      base: 'px-3 py-1.5 text-sm font-medium border rounded-[50px] transition-colors',
      active: 'bg-[#182B5C] text-white shadow-md',
      light: 'text-gray-600 hover:text-[#182B5C] hover:bg-gray-50',
      dark: 'text-gray-400 hover:text-[#d0b216] hover:bg-gray-800',
    },
  },
  typography: {
    body: 'text-base',
    h3: 'text-xl font-bold',
    link: 'text-sm font-medium transition-colors',
    highlight: {
      yellow: 'text-[#d0b216]',
      blue: 'text-[#182B5C]',
    },
  },
};

export default function Footer({ darkMode = false }) {
  const colors = {
    bg: darkMode ? '#111827' : '#182B5C',
    textPrimary: darkMode ? '#f9fafb' : '#ffffff',
    textSecondary: darkMode ? '#d1d5db' : '#9ca3af',
    textHover: darkMode ? '#fbbf24' : '#d0b216',
    border: '#374151',
    linkHover: darkMode ? '#fbbf24' : '#d0b216',
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              Optimas fiber
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
              Empowering digital connectivity across Kenya with reliable network solutions.
            </p>
            <div className="flex space-x-4 pt-2">
              {[
                { name: 'Facebook', path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
                { name: 'Twitter', path: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
                { name: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label={social.name}
                  className="transition-transform duration-200 hover:scale-110"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.linkHover}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path}></path>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className={`${RISA_STYLES.typography.h3} mb-2`} style={{ color: colors.textPrimary }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Services', 'Coverage', 'Contact'].map((link, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className={`${RISA_STYLES.typography.link} block hover:translate-x-1 transition-transform`}
                    style={{ color: colors.textSecondary }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.linkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                  >
                    {link}
                  </a>
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
              {['Internet Solutions', 'Network Design', 'Installation', 'Maintenance', 'Consultation'].map((service, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className={`${RISA_STYLES.typography.link} block hover:translate-x-1 transition-transform`}
                    style={{ color: colors.textSecondary }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.linkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                  >
                    {service}
                  </a>
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
                <span>kahawa west,Nairobi, Kenya</span>
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
                <span>info@optimasfiber.co.ke</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t mt-10 pt-6" style={{ borderColor: colors.border }}>
          <p className="text-center md:text-left mb-4 md:mb-0 text-xs md:text-sm" style={{ color: colors.textSecondary }}>
            &copy; {new Date().getFullYear()} Optimas fiber. All rights reserved.
          </p>

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
    </motion.footer>
  );
}
