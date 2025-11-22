import React, { useState, useContext, createContext } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, Ticket, ArrowRight, CheckCircle, AlertCircle
} from "lucide-react";

// --- MOCK CONTEXT ---
const ThemeContext = createContext({ darkMode: false });

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    email: "",
    message: "",
  });
  
  // Mock theme usage
  const [darkModeState] = useState(false);
  const { darkMode: contextDarkMode } = useContext(ThemeContext);
  const darkMode = contextDarkMode !== undefined ? contextDarkMode : darkModeState;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Support ticket logged successfully.");
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className={`min-h-screen relative font-sans selection:bg-[#d0b216] selection:text-white ${
      darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'
    }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* --- RIGHT SIDE BACKGROUND BLOCK (Desktop) --- */}
      {/* This creates the split colored background effect */}
      <div className={`hidden lg:block absolute top-0 right-0 w-[45%] h-full z-0 ${
        darkMode ? 'bg-[#0a1220]' : 'bg-[#182b5c]'
      }`}></div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row min-h-screen">
          
          {/* --- LEFT COLUMN: INFO & CARDS --- */}
          <motion.div 
            className="w-full lg:w-[55%] py-12 lg:py-24 lg:pr-16 flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              variants={itemVariants}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-12 tracking-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Contact Support
            </motion.h1>

            <div className="space-y-6">
              {/* Card 1: Phone */}
              <motion.div 
                variants={itemVariants}
                className={`p-8 rounded-sm shadow-sm border-l-4 transition-all duration-300 hover:shadow-md group ${
                  darkMode 
                    ? 'bg-gray-900 border-l-[#d0b216] border-y border-r border-gray-800' 
                    : 'bg-gray-50 border-l-[#d0b216] border-y border-r border-gray-100'
                }`}
              >
                <h3 className="text-xl font-bold mb-2">Call Support (Mon-Fri 9-5:30)</h3>
                <a href="tel:+254741874200" className={`flex items-center gap-2 font-bold text-lg group-hover:underline ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]' // Using Navy text on light mode like reference uses Red
                }`}>
                  +254 741 874 200 <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-[#d0b216]' : 'text-[#d0b216]'}`} />
                </a>
              </motion.div>

              {/* Card 2: Ticket */}
              <motion.div 
                variants={itemVariants}
                className={`p-8 rounded-sm shadow-sm border-l-4 transition-all duration-300 hover:shadow-md group ${
                  darkMode 
                    ? 'bg-gray-900 border-l-[#d0b216] border-y border-r border-gray-800' 
                    : 'bg-gray-50 border-l-[#d0b216] border-y border-r border-gray-100'
                }`}
              >
                <h3 className="text-xl font-bold mb-2">Log a Support Ticket</h3>
                <a href="#" className={`flex items-center gap-2 font-bold text-lg group-hover:underline ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                }`}>
                  support.optimas.co.ke <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-[#d0b216]' : 'text-[#d0b216]'}`} />
                </a>
              </motion.div>

              {/* Card 3: Email */}
              <motion.div 
                variants={itemVariants}
                className={`p-8 rounded-sm shadow-sm border-l-4 transition-all duration-300 hover:shadow-md group ${
                  darkMode 
                    ? 'bg-gray-900 border-l-[#d0b216] border-y border-r border-gray-800' 
                    : 'bg-gray-50 border-l-[#d0b216] border-y border-r border-gray-100'
                }`}
              >
                <h3 className="text-xl font-bold mb-2">Email Support</h3>
                <a href="mailto:hotdesk@optimas.co.ke" className={`flex items-center gap-2 font-bold text-lg group-hover:underline ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                }`}>
                  hotdesk@optimas.co.ke <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-[#d0b216]' : 'text-[#d0b216]'}`} />
                </a>
              </motion.div>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: FORM --- */}
          {/* This sits ON TOP of the dark background on desktop */}
          <motion.div 
            className="w-full lg:w-[45%] py-12 lg:py-24 lg:pl-12 flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className={`p-8 md:p-10 rounded-sm shadow-2xl relative ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Experiencing an issue? We can help!</h2>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Our friendly support team is on hand to help you resolve any issues you may be experiencing with your system.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex gap-1">
                      First name <span className="text-[#d0b216]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-sm border-0 outline-none transition-all text-sm ${
                        darkMode 
                          ? 'bg-gray-700 focus:ring-1 focus:ring-[#d0b216]' 
                          : 'bg-gray-50 focus:ring-1 focus:ring-[#182b5c]'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex gap-1">
                      Last name <span className="text-[#d0b216]">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-sm border-0 outline-none transition-all text-sm ${
                        darkMode 
                          ? 'bg-gray-700 focus:ring-1 focus:ring-[#d0b216]' 
                          : 'bg-gray-50 focus:ring-1 focus:ring-[#182b5c]'
                      }`}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex gap-1">
                    Company name <span className="text-[#d0b216]">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-sm border-0 outline-none transition-all text-sm ${
                      darkMode 
                        ? 'bg-gray-700 focus:ring-1 focus:ring-[#d0b216]' 
                        : 'bg-gray-50 focus:ring-1 focus:ring-[#182b5c]'
                    }`}
                  />
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phone number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-sm border-0 outline-none transition-all text-sm ${
                        darkMode 
                          ? 'bg-gray-700 focus:ring-1 focus:ring-[#d0b216]' 
                          : 'bg-gray-50 focus:ring-1 focus:ring-[#182b5c]'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex gap-1">
                      Email <span className="text-[#d0b216]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-sm border-0 outline-none transition-all text-sm ${
                        darkMode 
                          ? 'bg-gray-700 focus:ring-1 focus:ring-[#d0b216]' 
                          : 'bg-gray-50 focus:ring-1 focus:ring-[#182b5c]'
                      }`}
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full px-4 py-3 rounded-sm border-0 outline-none transition-all text-sm resize-none ${
                      darkMode 
                        ? 'bg-gray-700 focus:ring-1 focus:ring-[#d0b216]' 
                        : 'bg-gray-50 focus:ring-1 focus:ring-[#182b5c]'
                    }`}
                  ></textarea>
                </div>

                {/* Footer Info */}
                <div className="space-y-4 pt-2">
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Optimas will use your information to communicate any future events and services. You may unsubscribe at any time. For further details please review our privacy policy.
                  </p>
                  
                  {/* Fake ReCaptcha */}
                  <div className={`p-3 rounded border w-fit flex items-center gap-4 shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white"></div>
                        <span className="text-xs font-medium">I'm not a robot</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="captcha" className="w-6 opacity-50"/>
                        <span className="text-[8px] opacity-50">reCAPTCHA</span>
                     </div>
                  </div>

                  <button 
                    type="submit"
                    className={`px-10 py-4 font-bold rounded-sm transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider text-sm hover:shadow-xl active:scale-95 ${
                      darkMode 
                        ? 'bg-[#d0b216] hover:bg-[#b89c0f] text-gray-900' 
                        : 'bg-[#182b5c] hover:bg-[#0f1f45] text-white' // Red replaced with Navy
                    }`}
                  >
                    Submit <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;