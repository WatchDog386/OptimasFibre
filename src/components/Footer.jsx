import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaMoon, 
  FaSun,
} from "react-icons/fa";

export default function Footer() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className={`relative pt-10 px-6 transition-all duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-[#182B5C] text-white"
      }`}
    >
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? (
          <FaSun className="text-yellow-300 hover:scale-110 transition text-xl" />
        ) : (
          <FaMoon className="text-[#d0b216] hover:scale-110 transition text-xl" />
        )}
      </div>

      {/* Footer content from About page */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Optimas Fibre</h3>
            <p className="text-gray-300 mb-4">
              Leading the future of internet connectivity with cutting-edge fibre solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Portfolio</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Fibre Internet</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Network Design</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Installation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Maintenance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d0b216] transition-colors">Consultation</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 w-full rounded-l focus:outline-none text-gray-800"
              />
              <button 
                type="submit" 
                className="bg-[#d0b216] hover:bg-[#b89b14] px-4 py-2 rounded-r text-white font-semibold transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Optimas Fibre. All rights reserved.</p>
        </div>
      </div>

      {/* Wave animation */}
      <div className="overflow-hidden h-16 relative">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill={darkMode ? "#1a202c" : "#0f1c3f"}
            fillOpacity="1"
            d="M0,96L30,106.7C60,117,120,139,180,133.3C240,128,300,96,360,90.7C420,85,480,107,540,117.3C600,128,660,128,720,122.7C780,117,840,107,900,117.3C960,128,1020,160,1080,181.3C1140,203,1200,213,1260,197.3C1320,181,1380,139,1410,117.3L1440,96L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
          ></path>
        </svg>
      </div>
    </motion.footer>
  );
}