import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Send
} from "lucide-react";

// Optimas Brand Colors
const OPTIMAS_PRIMARY = '#015B97';
const OPTIMAS_ACCENT = '#d0b216';

// Custom SVG Icons to match the "Real" look
const CustomIcons = {
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#015B97]">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.51 1.51c-2.48-1.27-4.5-3.29-5.77-5.77l1.51-1.51c.24-.24.3-.58.24-1.01-.36-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.76 3 4.41 3 4.99c0 9.8 7.21 17.01 17.01 17.01.58 0 1.23-.65 1.23-1.19v-4.44c0-.54-.45-.99-.99-.99z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg viewBox="0 0 24 24" fill="#25D366" className="w-10 h-10">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 text-[#015B97]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Ticket: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#015B97]">
      <path d="M21 10h-2a2 2 0 0 1 0-4h2V4h-6v2a2 2 0 0 1-4 0V4H5v2a2 2 0 0 1 0 4H3v4h2a2 2 0 0 1 0 4h2v2h6v-2a2 2 0 0 1 4 0v2h6v-2h-2a2 2 0 0 1 0-4h2v-4z" />
    </svg>
  )
};

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log(formData);
    alert("Support ticket submitted successfully! We'll get back to you soon.");
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const contactCards = [
    {
      title: "Give us a call",
      subtitle: "We are here 24/7 for support",
      contact: "+254 741 874 200",
      href: "tel:+254741874200",
      icon: CustomIcons.Phone,
    },
    {
      title: "WhatsApp Us",
      subtitle: "Chat with our support team",
      contact: "0741 874 200",
      href: "https://wa.me/254741874200",
      icon: CustomIcons.WhatsApp,
    },
    {
      title: "Send Mail",
      subtitle: "Any questions you can email us",
      contact: "support@optimaswifi.co.ke",
      href: "mailto:support@optimaswifi.co.ke",
      icon: CustomIcons.Mail,
    },
    {
      title: "Ticket Support",
      subtitle: "Log a ticket online",
      contact: "optimaswifi.co.ke",
      href: "https://optimaswifi.co.ke",
      icon: CustomIcons.Ticket,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-gray-900 pb-16 relative">
      
      {/* --- TOP HEADER / BACKGROUND --- */}
      {/* Increased height to cover the new spacing */}
      <div className="bg-[#015B97] h-[450px] w-full absolute top-0 left-0 z-0"></div>

      {/* FIX: Increased padding-top (pt-32 md:pt-40) to push content 
         down below the fixed navbar.
      */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-6xl pt-32 md:pt-40">
        
        {/* --- SECTION 1: CONTACT CARDS --- */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contactCards.map((card, idx) => (
            <motion.div 
              key={idx}
              variants={cardVariants}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300 border-b-4 border-transparent hover:border-[#d0b216]"
            >
              <div className="mb-4">
                <card.icon />
              </div>
              {/* Shrunk title text */}
              <h3 className="text-[#015B97] font-bold text-base mb-1">{card.title}</h3>
              {/* Shrunk subtitle text */}
              <p className="text-gray-500 text-xs mb-3 leading-relaxed">{card.subtitle}</p>
              <a 
                href={card.href} 
                className="text-[#015B97] font-bold text-sm hover:text-[#d0b216] transition-colors mt-auto"
              >
                {card.contact}
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* --- SECTION 2: TEXT & FORM SPLIT --- */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Left Side: Text Content */}
          <motion.div 
            className="w-full lg:w-1/3 pt-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Reduced heading size */}
            <h2 className="text-3xl md:text-4xl font-bold text-[#015B97] mb-4">
              Get in touch
            </h2>
            {/* Reduced body text size */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Ready to connect? Whether you need faster internet or support, 
              Optimas WiFi's team is here to help with reliable fiber solutions.
            </p>
            
            {/* Compact Office Location Info */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 flex items-start gap-3">
               <MapPin className="w-5 h-5 text-[#d0b216] shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-bold text-[#015B97] text-sm mb-1">Our Office</h4>
                 <p className="text-xs text-gray-500 leading-snug">
                   Visit our office for WiFi Solutions.<br/>
                   Nairobi, Kenya
                 </p>
               </div>
            </div>
          </motion.div>

          {/* Right Side: The Form */}
          <motion.div 
            className="w-full lg:w-2/3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Row 1: Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#015B97] font-semibold text-xs uppercase tracking-wide">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm focus:border-[#015B97] focus:ring-1 focus:ring-[#015B97] outline-none transition-all placeholder:text-gray-300"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#015B97] font-semibold text-xs uppercase tracking-wide">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm focus:border-[#015B97] focus:ring-1 focus:ring-[#015B97] outline-none transition-all placeholder:text-gray-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Row 2: Company & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#015B97] font-semibold text-xs uppercase tracking-wide">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm focus:border-[#015B97] focus:ring-1 focus:ring-[#015B97] outline-none transition-all placeholder:text-gray-300"
                      placeholder="Business Ltd"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#015B97] font-semibold text-xs uppercase tracking-wide">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm focus:border-[#015B97] focus:ring-1 focus:ring-[#015B97] outline-none transition-all placeholder:text-gray-300"
                      placeholder="+254..."
                    />
                  </div>
                </div>

                {/* Row 3: Email */}
                <div className="space-y-1.5">
                  <label className="text-[#015B97] font-semibold text-xs uppercase tracking-wide">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm focus:border-[#015B97] focus:ring-1 focus:ring-[#015B97] outline-none transition-all placeholder:text-gray-300"
                    placeholder="jane@example.com"
                  />
                </div>

                {/* Row 4: Message */}
                <div className="space-y-1.5">
                  <label className="text-[#015B97] font-semibold text-xs uppercase tracking-wide">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm focus:border-[#015B97] focus:ring-1 focus:ring-[#015B97] outline-none transition-all resize-none placeholder:text-gray-300"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-[#015B97] text-white font-bold text-sm rounded-full hover:bg-[#01497a] hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
                  >
                    Submit Ticket <Send className="w-3.5 h-3.5" />
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