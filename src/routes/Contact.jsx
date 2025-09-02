import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, MessageCircle, Wifi
} from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaSun, FaMoon } from "react-icons/fa";

const services = [
  { value: "installation", label: "Fibre Installation", icon: <Wifi className="w-5 h-5" /> },
  { value: "support", label: "Technical Support", icon: <MessageCircle className="w-5 h-5" /> },
  { value: "billing", label: "Billing Inquiry", icon: <Mail className="w-5 h-5" /> },
  { value: "coverage", label: "Coverage Check", icon: <MapPin className="w-5 h-5" /> },
  { value: "other", label: "Other", icon: <MessageCircle className="w-5 h-5" /> },
];

const Contact = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

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
    <div className={`min-h-screen px-4 pt-24 pb-10 relative transition-all duration-500 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
    }`}>
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? (
          <FaSun className="text-yellow-300 hover:scale-110 transition text-xl" />
        ) : (
          <FaMoon className="text-[#182b5c] hover:scale-110 transition text-xl" />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-3 text-[#182b5c]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Contact Us
          </motion.h1>
          <motion.p 
            className="text-gray-600 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Get in touch for inquiries, support, or to learn more about our fibre internet services
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div 
              className={`p-5 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#d0b216] p-2 rounded-full">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold">Call Us</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm">0726 818 938</p>
                <p className="text-sm">0724 169 963</p>
              </div>
            </motion.div>

            <motion.div 
              className={`p-5 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#d0b216] p-2 rounded-full">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold">Email Us</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm">info@optimafibre.com</p>
                <p className="text-sm">support@optimafibre.com</p>
              </div>
            </motion.div>

            <motion.div 
              className={`p-5 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#d0b216] p-2 rounded-full">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold">Visit Us</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm">Lucky Summer, Ruaraka</p>
                <p className="text-sm">Behind Naivas Supermarket</p>
                <a 
                  href="#" 
                  className="text-[#182b5c] hover:text-[#d0b216] text-sm inline-block mt-2"
                >
                  View on map →
                </a>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <motion.a
                href="https://wa.me/254726818938"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-lg hover:bg-[#128C7E] transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </motion.a>

              <div className="flex gap-3 justify-center mt-4">
                {[
                  { icon: <FaFacebook />, href: "#", label: "Facebook" },
                  { icon: <FaTwitter />, href: "#", label: "Twitter" },
                  { icon: <FaInstagram />, href: "#", label: "Instagram" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="p-2 bg-[#182b5c] text-white rounded-full hover:bg-[#d0b216] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            className={`p-6 rounded-lg border space-y-5 ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-[#182b5c] mb-2">Send us a message</h3>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#182b5c] focus:border-transparent ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#182b5c] focus:border-transparent ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={`px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#182b5c] focus:border-transparent ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>

              <div>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#182b5c] focus:border-transparent ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
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
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#182b5c] focus:border-transparent ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>

              <motion.button
                type="submit"
                className="w-full bg-[#182b5c] hover:bg-[#d0b216] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>
            </div>
          </motion.form>
        </div>

        {/* Business Hours */}
        <motion.div 
          className={`p-5 rounded-lg border text-center mb-8 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#d0b216]" />
            <h3 className="font-semibold">Business Hours</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Mon - Fri</p>
              <p>8:00 AM - 5:00 PM</p>
            </div>
            <div>
              <p className="font-medium">Saturday</p>
              <p>9:00 AM - 2:00 PM</p>
            </div>
            <div>
              <p className="font-medium">Sunday</p>
              <p>Closed</p>
            </div>
          </div>
        </motion.div>

        {/* Location Link */}
        <div className="text-center">
          <motion.a
            href="#"
            className="inline-flex items-center gap-2 text-[#182b5c] hover:text-[#d0b216] font-medium"
            whileHover={{ scale: 1.05 }}
          >
            <MapPin className="w-4 h-4" />
            Find us on Google Maps
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;