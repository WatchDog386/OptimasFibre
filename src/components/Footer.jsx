import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; 
import { MapPin, Phone, Mail, ArrowUp, Lock } from "lucide-react";

// Consistent styling matching your MainContent
const FOOTER_STYLES = {
  primaryColor: '#015B97',
  button: {
    primary: {
      base: 'px-5 py-2 bg-white text-[#015B97] border border-white font-bold rounded-full transition-all duration-300 shadow-md flex items-center gap-2 text-xs uppercase tracking-widest',
      hover: 'hover:bg-[#015B97] hover:text-white hover:border-[#015B97] hover:shadow-lg',
    },
    secondary: {
      base: 'px-5 py-2 bg-transparent text-white border border-white/30 font-bold rounded-full transition-all duration-300 flex items-center gap-2 text-xs uppercase tracking-widest',
      hover: 'hover:bg-white hover:text-[#015B97] hover:border-white',
    },
  },
  typography: {
    heading: 'text-lg font-black uppercase tracking-wider mb-4',
    link: 'text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block cursor-pointer font-medium',
  },
};

export default function Footer() {
  // Using specific colors to match the Hero Section (Blue-950 vibe)
  const colors = {
    bg: '#020617', // Slate-950/Black blend
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8', // Slate-400
    border: '#1e293b', // Slate-800
    iconColor: '#3b82f6', // Blue-500
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
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative pt-16 pb-8 px-4 md:px-6 z-40 border-t border-slate-800"
      style={{ backgroundColor: colors.bg, fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* 1. Company Info */}
          <div className="space-y-4">
            <h3 className="font-black text-2xl text-white tracking-tighter">
              OPTIMAS<span className="text-blue-500">FIBER</span>
            </h3>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: colors.textSecondary }}>
              Empowering homes and businesses across Nairobi with lightning-fast, reliable, and affordable fiber optic connectivity.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className={FOOTER_STYLES.typography.heading} style={{ color: colors.textPrimary }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className={FOOTER_STYLES.typography.link}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Services */}
          <div>
            <h3 className={FOOTER_STYLES.typography.heading} style={{ color: colors.textPrimary }}>
              Services
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((service, idx) => (
                <li key={idx}>
                  <Link to={service.path} className={FOOTER_STYLES.typography.link}>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h3 className={FOOTER_STYLES.typography.heading} style={{ color: colors.textPrimary }}>
              Get in Touch
            </h3>
            <div className="space-y-4 text-sm" style={{ color: colors.textSecondary }}>
              <p className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: colors.iconColor }} />
                <span>Kahawa West, Nairobi, Kenya</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" style={{ color: colors.iconColor }} />
                <span>+254 741 874 200</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" style={{ color: colors.iconColor }} />
                <span>support@optimaswifi.co.ke</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t mt-12 pt-8" style={{ borderColor: colors.border }}>
          <p className="text-center md:text-left mb-4 md:mb-0 text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Optimas Systems. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4 items-center">
            {/* Admin Login */}
            <Link
              to="/admin/login"
              className={`${FOOTER_STYLES.button.secondary.base} ${FOOTER_STYLES.button.secondary.hover}`}
              style={{ textDecoration: 'none' }}
            >
              <Lock size={14} /> Admin
            </Link>

            {/* Back to Top */}
            <motion.button
              onClick={scrollToTop}
              className={`${FOOTER_STYLES.button.primary.base} ${FOOTER_STYLES.button.primary.hover}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Top <ArrowUp size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}