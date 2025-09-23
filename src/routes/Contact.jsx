import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, MessageCircle, Wifi,
  Send, ChevronRight
} from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { ThemeContext } from "../contexts/ThemeContext";

const services = [
  { value: "installation", label: "Fibre Installation", icon: <Wifi className="w-4 h-4" /> },
  { value: "support", label: "Technical Support", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "billing", label: "Billing Inquiry", icon: <Mail className="w-4 h-4" /> },
  { value: "coverage", label: "Coverage Check", icon: <MapPin className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <MessageCircle className="w-4 h-4" /> },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const { darkMode } = useContext(ThemeContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message. We'll get back to you soon!");
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
  };

  return (
    <div className={`min-h-screen px-4 pt-20 pb-8 relative transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
    }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className={`text-2xl md:text-3xl font-semibold mb-3 ${
              darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Contact Us
          </motion.h1>
          <motion.p 
            className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-xl mx-auto text-sm`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Get in touch for inquiries, support, or to learn more about our fibre internet services
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <motion.div 
              className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#182b5c] p-2 rounded-full">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <h3 className={`font-medium text-base ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                }`}>Call Us</h3>
              </div>
              <div className="space-y-1 pl-11">
                <p className={`${darkMode ? 'text-gray-300 hover:text-[#d0b216]' : 'text-gray-700 hover:text-[#182b5c]'} transition-colors text-sm`}>074187422</p>
                <p className={`${darkMode ? 'text-gray-300 hover:text-[#d0b216]' : 'text-gray-700 hover:text-[#182b5c]'} transition-colors text-sm`}>0117151741</p>
              </div>
            </motion.div>

            <motion.div 
              className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#182b5c] p-2 rounded-full">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <h3 className={`font-medium text-base ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                }`}>Email Us</h3>
              </div>
              <div className="space-y-1 pl-11">
                <p className={`${darkMode ? 'text-gray-300 hover:text-[#d0b216]' : 'text-gray-700 hover:text-[#182b5c]'} transition-colors text-sm`}>info@optimafibre.co.ke</p>
                <p className={`${darkMode ? 'text-gray-300 hover:text-[#d0b216]' : 'text-gray-700 hover:text-[#182b5c]'} transition-colors text-sm`}>support@optimafibre.co.ke</p>
              </div>
            </motion.div>

            <motion.div 
              className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#182b5c] p-2 rounded-full">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h3 className={`font-medium text-base ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                }`}>Visit Us</h3>
              </div>
              <div className="space-y-1 pl-11">
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Kahawa West,Nairobi</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}></p>
                <motion.a 
                  href="#" 
                  className={`text-xs inline-flex items-center gap-1 mt-2 group ${
                    darkMode ? 'text-[#d0b216] hover:text-[#e0c226]' : 'text-[#182b5c] hover:text-[#3b5998]'
                  }`}
                  whileHover={{ x: 3 }}
                >
                  View on map 
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <motion.a
                href="https://wa.me/254741874200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-4 py-2.5 rounded-[1.25rem] hover:shadow-md transition-shadow text-xs font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </motion.a>

              <motion.div 
                className="flex gap-3 justify-center mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { icon: <FaFacebook className="w-4 h-4" />, href: "#", label: "Facebook" },
                  { icon: <FaTwitter className="w-4 h-4" />, href: "#", label: "Twitter" },
                  { icon: <FaInstagram className="w-4 h-4" />, href: "#", label: "Instagram" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="p-2.5 bg-[#182b5c] text-white rounded-xl hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            className={`p-5 rounded-xl shadow-md space-y-4 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={`text-xl font-semibold mb-1 ${
              darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
            }`}>
              Send us a message
            </h3>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className={`w-full px-3 py-2.5 rounded-xl transition-all text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-[#d0b216]' 
                      : 'border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-[#182b5c]'
                  } focus:outline-none focus:ring-1 focus:border-transparent`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`px-3 py-2.5 rounded-xl transition-all text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-[#d0b216]' 
                      : 'border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-[#182b5c]'
                  } focus:outline-none focus:ring-1 focus:border-transparent`}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={`px-3 py-2.5 rounded-xl transition-all text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-[#d0b216]' 
                      : 'border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-[#182b5c]'
                  } focus:outline-none focus:ring-1 focus:border-transparent`}
                  required
                />
              </div>

              <div>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 rounded-xl transition-all text-sm appearance-none ${
                    darkMode 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-[#d0b216]' 
                      : 'border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-[#182b5c]'
                  } focus:outline-none focus:ring-1 focus:border-transparent`}
                  required
                >
                  <option value="">Select service type</option>
                  {services.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="4"
                  className={`w-full px-3 py-2.5 rounded-xl transition-all text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-[#d0b216]' 
                      : 'border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-[#182b5c]'
                  } focus:outline-none focus:ring-1 focus:border-transparent`}
                  required
                />
              </div>

              <motion.button
                type="submit"
                className="w-full bg-[#182b5c] hover:bg-[#0f1f45] text-white font-medium py-2.5 px-4 rounded-[1.25rem] transition-all flex items-center justify-center gap-2 text-sm"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-4 h-4" />
                Send Message
              </motion.button>
            </div>
          </motion.form>
        </div>

        {/* Business Hours */}
        <motion.div 
          className={`p-5 rounded-xl shadow-md text-center mb-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#182b5c]" />
            <h3 className={`font-medium text-base ${
              darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
            }`}>Business Hours</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className={`p-2.5 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <p className={`font-medium ${
                darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
              }`}>Mon - Fri</p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>8:00 AM - 5:00 PM</p>
            </div>
            <div className={`p-2.5 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <p className={`font-medium ${
                darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
              }`}>Saturday</p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>9:00 AM - 2:00 PM</p>
            </div>
            <div className={`p-2.5 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <p className={`font-medium ${
                darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
              }`}>Sunday</p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Closed</p>
            </div>
          </div>
        </motion.div>

        {/* Location Link */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.a
            href="#"
            className={`inline-flex items-center gap-1 font-medium group text-sm ${
              darkMode ? 'text-[#d0b216] hover:text-[#e0c226]' : 'text-[#182b5c] hover:text-[#3b5998]'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <MapPin className="w-4 h-4" />
            Find us on Google Maps
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contact;