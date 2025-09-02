import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, MessageCircle, Wifi,
  Send, ChevronRight
} from "lucide-react";
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const services = [
  { value: "installation", label: "Fibre Installation", icon: <Wifi className="w-5 h-5" /> },
  { value: "support", label: "Technical Support", icon: <MessageCircle className="w-5 h-5" /> },
  { value: "billing", label: "Billing Inquiry", icon: <Mail className="w-5 h-5" /> },
  { value: "coverage", label: "Coverage Check", icon: <MapPin className="w-5 h-5" /> },
  { value: "other", label: "Other", icon: <MessageCircle className="w-5 h-5" /> },
];

const Contact = () => {
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
    <div className="min-h-screen px-4 pt-24 pb-10 relative bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#182b5c] to-[#3b5998]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Contact Us
          </motion.h1>
          <motion.p 
            className="text-gray-600 max-w-xl mx-auto text-lg"
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
              className="p-6 rounded-xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-[#182b5c] to-[#3b5998] p-2 rounded-full">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Call Us</h3>
              </div>
              <div className="space-y-2 pl-11">
                <p className="text-gray-700 hover:text-[#182b5c] transition-colors">0726 818 938</p>
                <p className="text-gray-700 hover:text-[#182b5c] transition-colors">0724 169 963</p>
              </div>
            </motion.div>

            <motion.div 
              className="p-6 rounded-xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-[#182b5c] to-[#3b5998] p-2 rounded-full">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Email Us</h3>
              </div>
              <div className="space-y-2 pl-11">
                <p className="text-gray-700 hover:text-[#182b5c] transition-colors">info@optimafibre.com</p>
                <p className="text-gray-700 hover:text-[#182b5c] transition-colors">support@optimafibre.com</p>
              </div>
            </motion.div>

            <motion.div 
              className="p-6 rounded-xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-[#182b5c] to-[#3b5998] p-2 rounded-full">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Visit Us</h3>
              </div>
              <div className="space-y-2 pl-11">
                <p className="text-gray-700">Lucky Summer, Ruaraka</p>
                <p className="text-gray-700">Behind Naivas Supermarket</p>
                <motion.a 
                  href="#" 
                  className="text-[#182b5c] hover:text-[#3b5998] text-sm inline-flex items-center gap-1 mt-2 group"
                  whileHover={{ x: 3 }}
                >
                  View on map 
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <motion.a
                href="https://wa.me/254726818938"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-5 py-3.5 rounded-xl hover:shadow-lg transition-shadow text-sm font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </motion.a>

              <motion.div 
                className="flex gap-4 justify-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { icon: <FaFacebook className="w-5 h-5" />, href: "#", label: "Facebook" },
                  { icon: <FaTwitter className="w-5 h-5" />, href: "#", label: "Twitter" },
                  { icon: <FaInstagram className="w-5 h-5" />, href: "#", label: "Instagram" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="p-3 bg-gradient-to-r from-[#182b5c] to-[#3b5998] text-white rounded-xl hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.1, y: -3 }}
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
            className="p-7 rounded-xl bg-white border border-gray-100 shadow-lg space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#182b5c] to-[#3b5998] mb-2">
              Send us a message
            </h3>

            <div className="space-y-5">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#182b5c] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#182b5c] focus:border-transparent transition-all"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#182b5c] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#182b5c] focus:border-transparent transition-all appearance-none"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#182b5c] focus:border-transparent transition-all"
                  required
                />
              </div>

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-[#182b5c] to-[#3b5998] hover:from-[#3b5998] hover:to-[#182b5c] text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
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
          className="p-6 rounded-xl bg-white border border-gray-100 shadow-lg text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#3b5998]" />
            <h3 className="font-semibold text-lg">Business Hours</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-[#182b5c]">Mon - Fri</p>
              <p className="text-gray-700">8:00 AM - 5:00 PM</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-[#182b5c]">Saturday</p>
              <p className="text-gray-700">9:00 AM - 2:00 PM</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-[#182b5c]">Sunday</p>
              <p className="text-gray-700">Closed</p>
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
            className="inline-flex items-center gap-2 text-[#182b5c] hover:text-[#3b5998] font-medium group"
            whileHover={{ scale: 1.05 }}
          >
            <MapPin className="w-5 h-5" />
            Find us on Google Maps
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contact;