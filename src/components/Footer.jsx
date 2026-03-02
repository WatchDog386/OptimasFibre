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
      <footer className="relative w-full bg-white text-black border-t border-gray-200 overflow-hidden font-sans">
        
        {/* 1. Background Wave Pattern - Optional, keeping it subtle or removing if Vuma is plain white */}
        {/* Keeping subtle decoration but ensuring it doesn't darken the white bg too much */}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:h-32 flex flex-col md:flex-row items-center justify-between">
          
          {/* Spacer for centering logic on desktop */}
          <div className="hidden md:block w-12"></div>

          {/* Center Content: Links & Copyright (Socials Removed) */}
          <div className="flex flex-col items-center justify-center space-y-4 w-full md:w-auto">
            
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base font-medium tracking-wide">
              {links.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`transition-colors duration-200 hover:text-[#d0b216] ${
                    link.isActive ? "border-b-2 border-[#182b5c] pb-0.5 text-[#182b5c]" : "text-gray-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-500 font-light tracking-wide mt-2">
              Copyright © {new Date().getFullYear()} Vuma Fiber LTD
            </p>
          </div>

          {/* Right Side: Back to Top Button */}
          <div className="mt-6 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full border border-gray-300 text-gray-400 hover:bg-[#182b5c] hover:text-white hover:border-[#182b5c] transition-colors duration-300"
              aria-label="Back to top"
            >
              <ArrowUp size={20} />
            </motion.button>
          </div>

        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254741874200" // Replace with actual number
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform duration-300 shadow-xl rounded-full"
        aria-label="Chat on WhatsApp"
      >
        <div className="bg-[#25D366] p-3 rounded-full flex items-center justify-center">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="white" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382C17.119 14.205 15.396 13.36 15.074 13.243C14.753 13.125 14.518 13.067 14.284 13.418C14.05 13.77 13.376 14.562 13.171 14.796C12.966 15.031 12.762 15.061 12.41 14.884C12.058 14.708 10.926 14.338 9.584 13.143C8.529 12.203 7.817 11.044 7.612 10.692C7.407 10.341 7.59 10.151 7.766 9.976C7.925 9.817 8.119 9.562 8.295 9.357C8.471 9.152 8.529 8.976 8.647 8.742C8.764 8.507 8.705 8.302 8.617 8.126C8.529 7.95 7.826 6.221 7.533 5.518C7.24 4.845 6.947 4.933 6.742 4.933C6.566 4.933 6.361 4.933 6.156 4.933C5.951 4.933 5.629 5.01 5.365 5.297C5.101 5.584 4.339 6.298 4.339 7.751C4.339 9.204 5.423 10.611 5.57 10.816C5.717 11.021 7.71 14.032 10.702 15.352C11.414 15.666 11.971 15.852 12.405 15.989C13.09 16.206 13.725 16.176 14.234 16.101C14.801 16.017 15.974 15.392 16.218 14.708C16.463 14.024 16.463 13.438 16.394 13.321C16.326 13.204 16.121 13.145 15.769 12.969V12.969ZM12.005 21.676C10.36 21.676 8.777 21.265 7.371 20.471L7.049 20.28L3.549 21.197L4.484 17.785L4.27 17.444C3.391 16.046 2.932 14.435 2.932 12.793C2.932 7.79 7.001 3.722 12.005 3.722C14.428 3.722 16.706 4.666 18.419 6.38C20.133 8.093 21.077 10.371 21.077 12.793C21.077 17.806 17.008 21.676 12.005 21.676Z" />
          </svg>
        </div>
      </a>
    </>
  );
}