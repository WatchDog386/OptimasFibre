import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Send,
  Phone,
  MessageCircle,
  Mail,
  Headphones,
} from "lucide-react";

const BRAND = {
  navy: "#2C3E6B",
  orange: "#FF6B35",
  light: "#F8F9FA",
  white: "#FFFFFF",
  dark: "#1A1A24",
};

const contactCards = [
  {
    title: "Call Us",
    subtitle: "Mon-Fri from 8am to 6pm",
    contact: "+254 741 874 200",
    href: "tel:+254741874200",
    icon: Phone,
  },
  {
    title: "WhatsApp",
    subtitle: "Chat with our support",
    contact: "0741 874 200",
    href: "https://wa.me/254741874200",
    icon: MessageCircle,
  },
  {
    title: "Email Us",
    subtitle: "support@optimaswifi.co.ke",
    contact: "support@optimaswifi.co.ke",
    href: "mailto:support@optimaswifi.co.ke",
    icon: Mail,
  },
  {
    title: "Support",
    subtitle: "24/7 help center",
    contact: "optimaswifi.co.ke",
    href: "https://optimaswifi.co.ke",
    icon: Headphones,
  },
];

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
    console.log(formData);
    alert("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 relative">
      {/* Hero Header */}
      <div className="bg-[#2C3E6B] pt-28 md:pt-36 pb-16 md:pb-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#FF6B35] text-[11px] font-bold lowercase tracking-[0.08em] mb-3">
              get in touch
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-xl leading-relaxed">
              Have a question or need help? Reach out and our team will get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
        {/* Decorative curve */}
        <div className="absolute bottom-0 left-0 w-full leading-[0]">
          <svg viewBox="0 0 1440 60" className="w-full h-[40px] md:h-[60px]">
            <path fill="#F8F9FA" d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </div>

      {/* Contact Cards - horizontal row */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4 md:-mt-8 relative z-20">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {contactCards.map((card, idx) => (
            <a
              key={idx}
              href={card.href}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-md border border-gray-100 flex flex-col items-start hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#2C3E6B]/5 flex items-center justify-center text-[#2C3E6B] mb-3 group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
                <card.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="font-extrabold text-[#2C3E6B] text-xs md:text-sm mb-1">
                {card.title}
              </h3>
              <p className="text-gray-400 text-[10px] md:text-xs mb-2 leading-snug">
                {card.subtitle}
              </p>
              <span className="text-[#FF6B35] font-bold text-xs md:text-sm group-hover:text-[#e55a2b] transition-colors">
                {card.contact}
              </span>
            </a>
          ))}
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-10 md:mt-14 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left Info */}
          <motion.div
            className="w-full lg:w-5/12"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#2C3E6B] mb-4">
              Let's talk about everything.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2C3E6B] text-sm mb-1">Our Office</h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Nairobi, Kenya<br />
                  Westlands, Biashara Street
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Form Card */}
          <motion.div
            className="w-full lg:w-7/12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#2C3E6B] font-bold text-[10px] uppercase tracking-[0.06em]">
                      First Name <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:border-[#2C3E6B] focus:bg-white focus:outline-none transition-colors font-medium"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#2C3E6B] font-bold text-[10px] uppercase tracking-[0.06em]">
                      Last Name <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:border-[#2C3E6B] focus:bg-white focus:outline-none transition-colors font-medium"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#2C3E6B] font-bold text-[10px] uppercase tracking-[0.06em]">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:border-[#2C3E6B] focus:bg-white focus:outline-none transition-colors font-medium"
                      placeholder="Business Ltd"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#2C3E6B] font-bold text-[10px] uppercase tracking-[0.06em]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:border-[#2C3E6B] focus:bg-white focus:outline-none transition-colors font-medium"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#2C3E6B] font-bold text-[10px] uppercase tracking-[0.06em]">
                    Email Address <span className="text-[#FF6B35]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:border-[#2C3E6B] focus:bg-white focus:outline-none transition-colors font-medium"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#2C3E6B] font-bold text-[10px] uppercase tracking-[0.06em]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:border-[#2C3E6B] focus:bg-white focus:outline-none transition-colors resize-none font-medium"
                    placeholder="How can we help you today?"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 px-8 py-3.5 bg-[#FF6B35] text-white font-extrabold text-xs uppercase tracking-[0.08em] rounded-full hover:bg-[#e55a2b] hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 shadow-md"
                >
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
