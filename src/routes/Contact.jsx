import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, Ticket, ArrowRight, CheckCircle, AlertCircle
} from "lucide-react";

// Optimas Brand Colors
const OPTIMAS_PRIMARY = '#015B97';
const OPTIMAS_ACCENT = '#d0b216';

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
    alert("Support ticket submitted successfully! We'll get back to you soon.");
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
    <div className="min-h-screen relative font-sans selection:bg-[#d0b216] selection:text-white bg-white text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* --- RIGHT SIDE BACKGROUND BLOCK (Desktop) --- */}
      {/* Updated to Optimas primary */}
      <div className="hidden lg:block absolute top-0 right-0 w-[45%] h-full z-0 bg-[#015B97]"></div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row min-h-screen">
          
          {/* --- LEFT COLUMN: INFO & CARDS --- */}
          <motion.div 
            className="w-full lg:w-[55%] py-12 lg:py-24 lg:pr-16 flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 🔥 Updated to BLACK text */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 tracking-tight text-black"
            >
              Contact Support
            </motion.h1>

            <div className="space-y-6">
              {[
                { 
                  title: "Call Support (Mon-Fri 9–5:30)", 
                  content: "+254 741 874 200", 
                  href: "tel:+254741874200",
                  Icon: Phone
                },
                { 
                  title: "Log a Support Ticket", 
                  content: "optimaswifi.co.ke", 
                  href: "https://optimaswifi.co.ke",
                  Icon: Ticket
                },
                { 
                  title: "Email Support", 
                  content: "support@optimaswifi.co.ke", 
                  href: "mailto:support@optimaswifi.co.ke",
                  Icon: Mail
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="p-8 rounded-sm shadow-sm border-l-4 border-l-[#d0b216] border-y border-r border-gray-100 bg-gray-50 transition-all duration-300 hover:shadow-md group"
                >
                  <h3 className="text-xl font-bold mb-2 text-black">{item.title}</h3>
                  <a 
                    href={item.href} 
                    className="flex items-center gap-2 font-bold text-lg text-[#015B97] group-hover:underline"
                  >
                    {item.content} <ArrowRight className="w-5 h-5 text-[#d0b216] transition-transform group-hover:translate-x-1" />
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: FORM --- */}
          <motion.div 
            className="w-full lg:w-[45%] py-12 lg:py-24 lg:pl-12 flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Form Card: White background */}
            <div className="p-8 md:p-10 rounded-sm shadow-2xl bg-white text-gray-900">
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-black">Experiencing an issue? We can help!</h2>
                <p className="text-sm leading-relaxed text-gray-700">
                  Our friendly support team is on hand to help you resolve any issues with your Optimas WiFi service.
                </p>
              </div>

              <form 
                name="contact" 
                method="POST" 
                data-netlify="true"
                onSubmit={handleSubmit} 
                className="space-y-5"
              >
                <input type="hidden" name="form-name" value="contact" />

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
                      className="w-full px-4 py-3 rounded-sm bg-gray-50 border-0 outline-none text-sm focus:ring-1 focus:ring-[#015B97]"
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
                      className="w-full px-4 py-3 rounded-sm bg-gray-50 border-0 outline-none text-sm focus:ring-1 focus:ring-[#015B97]"
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
                    className="w-full px-4 py-3 rounded-sm bg-gray-50 border-0 outline-none text-sm focus:ring-1 focus:ring-[#015B97]"
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
                      className="w-full px-4 py-3 rounded-sm bg-gray-50 border-0 outline-none text-sm focus:ring-1 focus:ring-[#015B97]"
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
                      className="w-full px-4 py-3 rounded-sm bg-gray-50 border-0 outline-none text-sm focus:ring-1 focus:ring-[#015B97]"
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
                    className="w-full px-4 py-3 rounded-sm bg-gray-50 border-0 outline-none text-sm resize-none focus:ring-1 focus:ring-[#015B97]"
                  ></textarea>
                </div>

                {/* Footer Info */}
                <div className="space-y-4 pt-2">
                  <p className="text-xs leading-relaxed text-gray-500">
                    Optimas WiFi will use your information to respond to your inquiry. You may unsubscribe at any time. See our privacy policy for details.
                  </p>
                  
                  {/* Fake reCAPTCHA */}
                  <div className="p-3 rounded border w-fit flex items-center gap-4 shadow-sm bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white"></div>
                      <span className="text-xs font-medium">I'm not a robot</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="captcha" className="w-6 opacity-50"/>
                      <span className="text-[8px] opacity-50">reCAPTCHA</span>
                    </div>
                  </div>

                  {/* 🔥 Submit Button: Yellow bg + blue text */}
                  <button 
                    type="submit"
                    className="px-10 py-4 font-bold rounded-sm transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider text-sm hover:shadow-xl active:scale-95 bg-yellow-400 hover:bg-yellow-500 text-[#015B97]"
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