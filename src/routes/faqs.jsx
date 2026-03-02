import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CreditCard,
  Settings,
  HelpCircle,
  Search,
  X,
  ChevronDown,
  Phone,
  Mail
} from "lucide-react";

// --- DATA: Why Choose Optimas (Visual) ---
const whyChooseData = [
  {
    title: "Blazing Fast Speeds 🚀",
    image: "https://c8.alamy.com/comp/2RD8AE7/super-fast-internet-connection-speedtest-bandwidth-network-technology-man-using-internet-high-speed-by-smartphone-and-laptop-computer-5g-quality-sp-2RD8AE7.jpg",
  },
  {
    title: "Reliable & Stable Connection 🔗",
    image: "https://kems.net/wp-content/uploads/2023/09/advantages-of-dedicated-internet-access-dia-for-your-business.jpeg",
  },
  {
    title: "Affordable & Flexible Plans 💰",
    image: "https://gadgets-africa.com/wp-content/uploads/2020/05/Wireless-Router-for-Home.jpg",
  },
  {
    title: "Exceptional Customer Support ☎️",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE_bUnRvdSggNRAinqM6sQGTE_9JZknwTHQg&s",
  },
  {
    title: "Wide Coverage & Easy Setup",
    image: "https://www.cyber.gov.au/sites/default/files/2024-10/secure-wifi-router-1.jpg",
  }
];

// --- DATA: FAQs ---
const faqsData = {
  "Account Management": {
    icon: <User className="w-4 h-4" />,
    items: [
      {
        question: "How do I create a self-care account?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">To create your self-care account:</p>
            <ol className="list-decimal pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Visit our self-care portal at optimaswifi.co.ke</li>
              <li>Click on 'Get Started'</li>
              <li>Enter your details as prompted</li>
              <li>Create a password and verify your identity via SMS</li>
              <li>Complete your profile details</li>
            </ol>
            {/* Using precise Vuma Blue tint */}
            <div className="bg-[#2562AE]/10 p-3 rounded-lg border border-[#2562AE]/20 text-xs text-[#2562AE] font-semibold mt-3">
              <p>Note: Your account number can be found on your invoice or by contacting customer care.</p>
            </div>
          </div>
        ),
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">Password reset options:</p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Click 'Forgot Password' on the login page</li>
              <li>Enter your registered email or phone number</li>
              <li>Follow the OTP verification process</li>
              <li>Set a new strong password</li>
            </ul>
            <div className="bg-[#FFA000]/10 p-3 rounded-lg border border-[#FFA000]/20 text-xs text-[#B37000] font-semibold mt-3">
              <p>Security Tip: Use a combination of letters, numbers and special characters for your password.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I update my account information?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">To update your account details:</p>
            <ol className="list-decimal pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Log in to your self-care account</li>
              <li>Go to 'Profile Settings'</li>
              <li>Edit the information you want to change</li>
              <li>Save your changes</li>
            </ol>
            <div className="bg-[#3EA369]/10 p-3 rounded-lg border border-[#3EA369]/20 text-xs text-[#2A7549] font-semibold mt-3">
              <p>Important: Some changes may require verification for security purposes.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  "Billing & Payments": {
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      {
        question: "How can I view my current bill?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">View your bill through:</p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Self-care portal dashboard</li>
              <li>Email notifications (if subscribed)</li>
              <li>Mobile app under 'Billing' section</li>
            </ul>
            <div className="bg-[#7F38A8]/10 p-3 rounded-lg border border-[#7F38A8]/20 text-xs text-[#5C297A] font-semibold mt-3">
              <p>Tip: Enable auto-notifications to receive bills directly to your email.</p>
            </div>
          </div>
        ),
      },
      {
        question: "What payment methods are available?",
        answer: (
          <div className="space-y-3">
            <p className="text-gray-600">We accept multiple payment options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#2562AE] uppercase tracking-wider">Online Payments</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• M-Pesa paybill: 4136553</li>
                  <li>• Credit/Debit Cards</li>
                  <li>• Bank Transfer</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#2562AE] uppercase tracking-wider">Offline Payments</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• Optimas Payment Centers</li>
                  <li>• Authorized Agents</li>
                  <li>• Bank Deposit</li>
                </ul>
              </div>
            </div>
          </div>
        ),
      },
      {
        question: "How do I set up auto-pay?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">To enable auto-payments:</p>
            <ol className="list-decimal pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Log in to your self-care account</li>
              <li>Navigate to 'Payment Methods'</li>
              <li>Select 'Set Up Auto-Pay'</li>
              <li>Choose your preferred payment method</li>
              <li>Set payment threshold and confirm</li>
            </ol>
            <div className="bg-[#FFA000]/10 p-3 rounded-lg border border-[#FFA000]/20 text-xs text-[#B37000] font-semibold mt-3">
              <p>Note: You'll receive notifications before each auto-payment is processed.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  "Service Management": {
    icon: <Settings className="w-4 h-4" />,
    items: [
      {
        question: "How do I upgrade my internet package?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">Package upgrade options:</p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Through self-care portal under 'Packages'</li>
              <li>Via mobile app by selecting new package</li>
              <li>By contacting customer support</li>
            </ul>
            <div className="bg-[#2562AE]/10 p-3 rounded-lg border border-[#2562AE]/20 text-xs text-[#2562AE] font-semibold mt-3">
              <p>Changes take effect immediately or at next billing cycle based on your selection.</p>
            </div>
          </div>
        ),
      },
      {
        question: "Can I temporarily suspend my service?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">Service suspension options:</p>
            <ol className="list-decimal pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Minimum suspension period: 7 days</li>
              <li>Maximum suspension period: 90 days</li>
              <li>Reduced monthly charges during suspension</li>
              <li>Reactivate anytime through self-care</li>
            </ol>
            <div className="bg-[#7F38A8]/10 p-3 rounded-lg border border-[#7F38A8]/20 text-xs text-[#5C297A] font-semibold mt-3">
              <p>Note: Equipment must remain connected during suspension.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I report service issues?",
        answer: (
          <div className="space-y-3">
            <p className="text-gray-600">Service issue reporting channels:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#DD126B] uppercase tracking-wider">Self-Service</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• Online troubleshooting</li>
                  <li>• Service status check</li>
                  <li>• Ticket submission</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#0D71BA] uppercase tracking-wider">Support</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• Live chat (24/7)</li>
                  <li>• Phone support</li>
                  <li>• Technician dispatch</li>
                </ul>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  "Technical Support": {
    icon: <HelpCircle className="w-4 h-4" />,
    items: [
      {
        question: "What should I do if my internet is down?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">First troubleshooting steps:</p>
            <ol className="list-decimal pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Check all cable connections</li>
              <li>Restart your router/modem</li>
              <li>Check for service alerts in your area</li>
              <li>Run speed test from self-care portal</li>
              <li>Submit trouble ticket if issue persists</li>
            </ol>
            <div className="bg-[#EB4956]/10 p-3 rounded-lg border border-[#EB4956]/20 text-xs text-[#C2303D] font-bold mt-3">
              <p>Emergency: Call 0741874200 for immediate assistance with outages.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I optimize my Wi-Fi connection?",
        answer: (
          <div className="space-y-3">
            <p className="text-gray-600">Wi-Fi optimization tips:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#0D71BA] uppercase tracking-wider">Placement</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• Central location</li>
                  <li>• Elevated position</li>
                  <li>• Away from interference</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#3EA369] uppercase tracking-wider">Settings</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• 5GHz for speed</li>
                  <li>• 2.4GHz for range</li>
                  <li>• Channel optimization</li>
                </ul>
              </div>
            </div>
          </div>
        ),
      },
      {
        question: "How do I connect multiple devices?",
        answer: (
          <div className="space-y-2">
            <p className="text-gray-600">Device connection options:</p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600 font-medium">
              <li>Standard routers support 10-15 devices</li>
              <li>Upgrade to mesh system for larger homes</li>
              <li>Use wired connections for stationary devices</li>
              <li>Enable guest network for visitors</li>
            </ul>
            <div className="bg-[#8141FF]/10 p-3 rounded-lg border border-[#8141FF]/20 text-xs text-[#5B21D4] font-medium mt-3">
              <p>Tip: Monitor connected devices through self-care portal.</p>
            </div>
          </div>
        ),
      },
    ],
  },
};

export default function Faqs() {
  const [activeCategory, setActiveCategory] = useState("Account Management");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  
  const filteredFaqs = faqsData[activeCategory].items.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  const inter = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  return (
    <section className="min-h-screen pt-20 md:pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative bg-[#F8F9FA]" style={inter}>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* --- Header Section for Self Care --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-[#004080] tracking-tight uppercase">
            Self-Care Portal & FAQs
          </h2>
          <p className="text-gray-600 font-bold text-sm md:text-base max-w-2xl mx-auto">
            Manage your account, services, and get support 24/7 seamlessly.
          </p>
        </div>

        {/* --- Why Choose Optimas (Color Matched) --- */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h3 className="text-xl md:text-2xl font-black text-[#004080] tracking-tight uppercase">
              Why Choose Optimas Fiber?
            </h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 px-2">
            {whyChooseData.map((item, index) => (
              <div key={index} className="flex flex-col items-center w-[128px] md:w-[148px]">
                <div className="w-full h-[84px] md:h-[98px] mb-2 overflow-hidden rounded-[6px] shadow-sm border border-gray-200 bg-white">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Exact dark text hex */}
                <h4 className="font-bold text-[10px] md:text-[11px] text-center text-[#1A1A24] leading-tight px-1">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
        
        {/* FAQ Tabs (Vuma Pill Buttons) */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {Object.entries(faqsData).map(([key, { icon }]) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key);
                  setOpenIndex(null);
                  setSearch("");
                }}
                className={`px-5 py-2.5 text-[12px] font-black uppercase tracking-wide rounded-md border transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#004080] text-white border-[#004080] shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#004080] border-gray-200'
                }`}
              >
                <span className={`rounded-sm p-1.5 w-7 h-7 flex items-center justify-center ${isActive ? 'bg-white/20 text-white' : 'bg-[#F3F5F8] text-[#004080]'}`}>
                  {icon}
                </span>
                <span>{key}</span>
              </button>
            )
          })}
        </div>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative shadow-sm">
            <input
              type="text"
              placeholder={`Search ${activeCategory} FAQs...`}
              className="w-full pl-12 pr-10 py-3.5 rounded-md border border-gray-200 bg-white text-sm font-semibold text-[#1A1A24] focus:ring-2 focus:ring-[#004080]/20 focus:border-[#004080] focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {search && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] bg-gray-100 rounded-sm p-1 transition-colors"
                onClick={() => setSearch("")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* FAQ Accordion List */}
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {filteredFaqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-md overflow-hidden bg-white border transition-all duration-300 ${isOpen ? 'border-[#004080] shadow-md' : 'border-gray-200 shadow-sm hover:border-gray-300'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex justify-between items-center bg-white"
                >
                  <h3 className={`text-[14px] pr-4 font-extrabold uppercase tracking-wide transition-colors ${isOpen ? 'text-[#004080]' : 'text-[#1A1A24]'}`}>
                    {faq.question}
                  </h3>
                  <span className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#FF6B35]' : 'text-gray-400'}`}>
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 border-t border-gray-50 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
        
        {/* Support CTA Box (Exact Hero Gradient from MainContent) */}
        <div className="mt-16 p-8 md:p-12 rounded-xl bg-gradient-to-r from-[#004080] via-[#0D71BA] to-[#116BC7] shadow-xl max-w-4xl mx-auto relative overflow-hidden">
          
          <div className="relative z-10 text-center">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 text-white">
              Need More Help?
            </h3>
            <p className="mb-8 text-white/90 text-sm md:text-[15px] font-semibold max-w-lg mx-auto">
              Our support team is available 24/7 to assist you with any inquiries or technical difficulties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+254741874200"
                className="px-8 py-3.5 bg-[#FF6B35] text-white font-black rounded-md transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest"
              >
                <Phone className="w-4 h-4" />
                Call Support
              </a>
              <a
                href="mailto:support@ecomnetwork.com"
                className="px-8 py-3.5 bg-white text-[#004080] font-black rounded-md transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest border border-white/70"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}