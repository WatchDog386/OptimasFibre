import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CreditCard,
  Settings,
  HelpCircle,
  Search,
  ChevronDown,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight
} from "lucide-react";

// --- DATA: FAQ CONTENT ---
const faqsData = {
  "Account": {
    icon: <User className="w-5 h-5" />,
    items: [
      {
        question: "How do I create a self-care account?",
        answer: (
          <div className="space-y-3">
            <p>To create your self-care account:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm font-medium text-gray-600">
              <li>Visit our self-care portal at <span className="text-blue-600 font-bold">optimaswifi.co.ke</span></li>
              <li>Click on <span className="font-bold text-blue-950">'Get Started'</span></li>
              <li>Enter your details as prompted</li>
              <li>Create a password and verify your identity via SMS</li>
            </ol>
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600 text-xs md:text-sm">
              <p className="text-blue-900 font-bold">Note: Your account number is on your invoice.</p>
            </div>
          </div>
        ),
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer: (
          <div className="space-y-3">
            <p>Password reset options:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm font-medium text-gray-600">
              <li>Click 'Forgot Password' on the login page</li>
              <li>Enter your registered email or phone number</li>
              <li>Follow the OTP verification process</li>
            </ul>
            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500 text-xs md:text-sm">
              <p className="text-yellow-800 font-bold">Tip: Use a mix of numbers and symbols for security.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I update my account information?",
        answer: (
          <div className="space-y-3">
            <p>To update your account details:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm font-medium text-gray-600">
              <li>Log in to your self-care account</li>
              <li>Go to 'Profile Settings'</li>
              <li>Edit the information you want to change</li>
            </ol>
          </div>
        ),
      },
    ],
  },
  "Billing": {
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        question: "How can I view my current bill?",
        answer: (
          <div className="space-y-3">
            <p>View your bill through:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm font-medium text-gray-600">
              <li>Self-care portal dashboard</li>
              <li>Email notifications (if subscribed)</li>
              <li>Mobile app under 'Billing' section</li>
            </ul>
          </div>
        ),
      },
      {
        question: "What payment methods are available?",
        answer: (
          <div className="space-y-3">
            <p>We accept multiple payment options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-black text-blue-950 mb-2 text-xs uppercase tracking-wide">Online Payments</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"/> M-Pesa paybill: 4136553</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Credit/Debit Cards</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-black text-blue-950 mb-2 text-xs uppercase tracking-wide">Offline Payments</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-500 rounded-full"/> Optimas Payment Centers</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-500 rounded-full"/> Authorized Agents</li>
                </ul>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  "Service": {
    icon: <Settings className="w-5 h-5" />,
    items: [
      {
        question: "How do I upgrade my internet package?",
        answer: (
          <div className="space-y-3">
            <p>Package upgrade options:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm font-medium text-gray-600">
              <li>Through self-care portal under 'Packages'</li>
              <li>Via mobile app by selecting new package</li>
              <li>By contacting customer support</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600 text-xs md:text-sm">
              <p className="text-blue-900 font-bold">Changes take effect immediately upon payment.</p>
            </div>
          </div>
        ),
      },
      {
        question: "Can I temporarily suspend my service?",
        answer: (
          <div className="space-y-3">
            <p>Service suspension options:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm font-medium text-gray-600">
              <li>Minimum suspension period: 7 days</li>
              <li>Maximum suspension period: 90 days</li>
              <li>Reactivate anytime through self-care</li>
            </ol>
          </div>
        ),
      },
    ],
  },
  "Tech Help": {
    icon: <HelpCircle className="w-5 h-5" />,
    items: [
      {
        question: "What should I do if my internet is down?",
        answer: (
          <div className="space-y-3">
            <p>First troubleshooting steps:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm font-medium text-gray-600">
              <li>Check all cable connections</li>
              <li>Restart your router/modem (Wait 30s)</li>
              <li>Run speed test from self-care portal</li>
            </ol>
            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500 text-xs md:text-sm">
              <p className="text-red-900 font-bold">Emergency: Call 0726896562 for outages.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I optimize my Wi-Fi connection?",
        answer: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-2 text-xs uppercase">Placement</h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• Central location</li>
                  <li>• Elevated position</li>
                  <li>• Away from walls</li>
                </ul>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2 text-xs uppercase">Settings</h4>
                <ul className="space-y-1 text-xs text-green-800">
                  <li>• Use 5GHz for speed</li>
                  <li>• Use 2.4GHz for range</li>
                </ul>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
};

// --- COMPONENT ---

export default function Faqs() {
  const [activeCategory, setActiveCategory] = useState("Account");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredFaqs = faqsData[activeCategory].items.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.section 
      className="min-h-screen bg-slate-50 font-sans pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* ================= HEADER SECTION (HERO STYLE) ================= */}
      <div className="relative w-full bg-blue-950 pt-32 pb-24 overflow-hidden px-6 text-center">
        
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-yellow-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            {/* Tagline */}
            <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-3">
                Knowledge Base
            </p>

            {/* Main Title */}
            <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 text-white tracking-tighter">
                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">help you?</span>
            </h1>

            {/* Subtitle Highlight */}
            <div className="inline-block bg-yellow-400 px-4 py-1 -skew-x-12 mb-8">
                <h2 className="text-sm md:text-base font-black text-blue-950 tracking-wide uppercase skew-x-12">
                   Answers to your common questions
                </h2>
            </div>

            {/* Search Bar - Hero Style */}
            <div className="w-full max-w-xl relative group">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-full flex items-center p-2 shadow-2xl">
                    <div className="pl-4 text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder={`Search ${activeCategory} FAQs...`}
                      className="w-full px-4 py-2 text-sm md:text-base bg-transparent border-none focus:ring-0 text-blue-950 font-medium placeholder-gray-400 outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="pr-4 text-gray-400 hover:text-red-500"><X size={18}/></button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* ================= CONTENT SECTION ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Object.entries(faqsData).map(([key, { icon }]) => (
            <motion.button
              key={key}
              onClick={() => {
                setActiveCategory(key);
                setOpenIndex(null);
                setSearch("");
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider shadow-lg transition-all duration-300 ${
                activeCategory === key
                  ? "bg-yellow-500 text-blue-950 ring-4 ring-yellow-500/20"
                  : "bg-white text-gray-400 hover:text-blue-950 hover:bg-gray-50"
              }`}
            >
              <span className={activeCategory === key ? "text-blue-950" : "text-gray-400"}>{icon}</span>
              {key}
            </motion.button>
          ))}
        </div>

        {/* FAQ Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-4"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
                    openIndex === i 
                    ? "border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.15)]" 
                    : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-5 text-left flex justify-between items-start gap-4"
                >
                  <h3 className={`font-bold text-sm md:text-base transition-colors ${
                      openIndex === i ? "text-blue-950" : "text-gray-700 group-hover:text-blue-900"
                  }`}>
                      {faq.question}
                  </h3>
                  <div className={`mt-1 p-1 rounded-full transition-all duration-300 ${
                      openIndex === i ? "bg-yellow-400 rotate-180 text-blue-950" : "bg-gray-100 text-gray-400"
                  }`}>
                    <ChevronDown size={16} strokeWidth={3} />
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 text-gray-500 text-sm leading-relaxed border-t border-gray-50 mt-2 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredFaqs.length === 0 && (
             <div className="text-center py-12 text-gray-400">
                 <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p className="text-sm font-bold uppercase tracking-widest">No answers found</p>
             </div>
        )}

        {/* ================= SUPPORT CTA ================= */}
        <motion.div 
          className="mt-16 bg-blue-950 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-900/50 rounded-full px-4 py-1.5 border border-blue-800 mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Live Support Online</span>
                </div>

                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
                    Still Need Help?
                </h3>
                <p className="text-blue-200 text-sm md:text-base max-w-lg mx-auto mb-8 font-light">
                    Can't find what you're looking for? Our dedicated support team is available 24/7 to resolve your connectivity issues.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a 
                        href="tel:+254726896562" 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 transition-colors"
                    >
                        <Phone size={18} />
                        Call Support
                    </motion.a>
                    
                    <motion.a 
                        href="mailto:support@knoxvilletechnologies.com" 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-transparent border-2 border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-colors"
                    >
                        <Mail size={18} />
                        Email Us
                    </motion.a>
                </div>
            </div>
        </motion.div>

      </div>
    </motion.section>
  );
}