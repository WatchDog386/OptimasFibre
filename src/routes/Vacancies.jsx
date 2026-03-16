import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaMapMarkerAlt, FaCalendarAlt, FaEnvelope, FaUpload, FaCheckCircle, FaSpinner, FaPaperPlane, FaUser, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Vacancies() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMailtoSubmit = (e) => {
    e.preventDefault();
    
    // Construct the email body
    const subject = `Job Application: Customer Care Support - ${formData.name}`;
    const body = `Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

Cover Letter / Message:
${formData.message}

--------------------------------------------------
*** PLEASE REMEMBER TO ATTACH YOUR CV/DOCUMENTS (PDF) TO THIS EMAIL BEFORE SENDING ***
--------------------------------------------------`;

    // Create the mailto link
    const mailtoLink = `mailto:vaccancies@optimaswifi.co.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open the default mail client
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 pt-24 font-sans">
      <Helmet>
        <title>Careers & Vacancies | Optimas Fiber</title>
        <meta name="description" content="Join the Optimas Fiber team. We are hiring Customer Care Support and more." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#00356B] mb-4">Join Our Team</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are always looking for talented individuals to join our growing company. Check out our latest opening!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Job Details Panel - Direct Image Display */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-0 lg:col-span-5 bg-white/50 rounded-sm"
          >
            <div className="w-full mx-auto shadow-2xl rounded-sm overflow-hidden border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
               {/* Displaying PDF seamlessly without a dark container. Using an object/embed suited for visual display */}
               <embed 
                  src="/JOb%20openning%20cc.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                  type="application/pdf"
                  className="w-full h-[700px] object-contain bg-white"
                  style={{ pointerEvents: 'auto' }}
                />
            </div>
            <div className="mt-8 text-center pb-4">
               <a 
                href="/JOb%20openning%20cc.pdf" 
                download
                className="inline-flex items-center px-8 py-3 bg-[#00356B] text-white rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-[#002244] transition-colors shadow-md"
              >
                <span>Download Job Poster</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </a>
            </div>
          </motion.div>

          {/* Application Form mapped to Mailto */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-sm shadow-xl overflow-hidden flex flex-col border border-gray-200 lg:col-span-7 relative"
          >
            <div className="bg-[#00356B] p-8 sm:p-10 relative overflow-hidden">
              {/* Decorative Background Icon styling similar to the reference */}
              <FaEnvelope className="absolute -right-8 -top-8 text-[160px] text-white opacity-5 transform rotate-12 pointer-events-none" />
              
              <div className="relative z-10">
                <span className="inline-block bg-[#D85C2C] text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 mb-4 rounded-sm shadow-sm">
                  Apply Today
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 drop-shadow-sm tracking-tight" style={{ color: 'white' }}>
                  Submit Application
                </h2>
                <p className="text-blue-100/90 text-sm sm:text-base font-medium max-w-md">
                  Fill in your professional details below to quickly compose your email application.
                </p>
              </div>
            </div>
            
            <div className="p-8 sm:p-10">
                <form onSubmit={handleMailtoSubmit} className="space-y-8">
                  
                  <div className="bg-blue-50/80 border-l-4 border-[#00356B] p-5 mb-2 rounded-r-sm">
                    <div className="flex">
                      <div className="flex-shrink-0 mt-0.5">
                        <FaEnvelope className="h-5 w-5 text-[#00356B]" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-blue-900 leading-relaxed">
                          Clicking <strong>Send Application</strong> will open your email app (Gmail, Outlook) automatically. <br/>
                          <strong className="text-red-600 mt-1 block">Don't forget to attach your CV (PDF) before you hit send!</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 hover:text-[#00356B] transition-colors">Full Name <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-gray-400 group-focus-within:text-[#00356B]">
                          <FaUser />
                        </div>
                        <input 
                          type="text" 
                          name="name" 
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-12 w-full px-4 py-3.5 border-2 border-gray-200 rounded-none shadow-sm focus:ring-0 focus:border-[#00356B] outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-400 group text-base"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 hover:text-[#00356B] transition-colors">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-gray-400">
                          <FaPhone className="transform rotate-90" />
                        </div>
                        <input 
                          type="tel" 
                          name="phone" 
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-12 w-full px-4 py-3.5 border-2 border-gray-200 rounded-none shadow-sm focus:ring-0 focus:border-[#00356B] outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-400 text-base"
                          placeholder="e.g. 07XX XXX XXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 hover:text-[#00356B] transition-colors">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-gray-400">
                        <FaEnvelope />
                      </div>
                      <input 
                        type="email" 
                        name="email" 
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-12 w-full px-4 py-3.5 border-2 border-gray-200 rounded-none shadow-sm focus:ring-0 focus:border-[#00356B] outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-400 text-base"
                        placeholder="e.g. johndoe@example.com"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 hover:text-[#00356B] transition-colors">Cover Letter / Message (Optional)</label>
                    <textarea 
                      name="message" 
                      rows="6"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full p-5 border-2 border-gray-200 rounded-none shadow-sm focus:ring-0 focus:border-[#00356B] outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white resize-none text-gray-900 placeholder-gray-400 text-base leading-relaxed"
                      placeholder="Tell us briefly why you are a great fit for this role..."
                    ></textarea>
                  </div>

                  <div className="pt-6 pb-2">
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-sm shadow-xl text-lg font-bold text-white bg-[#D85C2C] hover:bg-[#b84c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D85C2C] transition-all transform hover:-translate-y-0.5 tracking-wide uppercase"
                    >
                      <FaPaperPlane className="mr-3" />
                      Compose Email Application
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                      Opens your default mail client with <span className="font-bold text-[#00356B]">vaccancies@optimaswifi.co.ke</span>
                    </p>
                  </div>
                </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}