import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; 
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Simplified links
  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Our Coverage', path: '/coverage' },
    { name: 'Contact', path: '/contact', isActive: true }
  ];

  return (
    <>
      <footer className="relative w-full bg-[#004080] text-white overflow-hidden font-sans">
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:h-32 flex flex-col md:flex-row items-center justify-between">
          
          {/* Spacer for centering logic on desktop */}
          <div className="hidden md:block w-12"></div>

          {/* Center Content: Links & Copyright */}
          <div className="flex flex-col items-center justify-center space-y-4 w-full md:w-auto">
            
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base font-medium tracking-wide">
              {links.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`transition-colors duration-200 hover:text-[#FF6B35] ${
                    link.isActive ? "border-b-2 border-white pb-0.5 text-white" : "text-white/80"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-white/70 font-light tracking-wide mt-2">
              Copyright © {new Date().getFullYear()} Optimas Fiber LTD
            </p>
          </div>

          {/* Right Side: Back to Top Button */}
          <div className="mt-6 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full border border-white/30 text-white/70 hover:bg-white hover:text-[#004080] hover:border-white transition-colors duration-300"
              aria-label="Back to top"
            >
              <ArrowUp size={20} />
            </motion.button>
          </div>

        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/254741874200"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat on WhatsApp"
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="white" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.05 4.91A9.816 9.816 0 0012.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 012.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z"/>
        </svg>
      </motion.a>
    </>
  );
}