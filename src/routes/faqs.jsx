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
  Mail
} from "lucide-react";

// --- DATA: Why Choose Optimas (Visual) - Kept your content ---
const whyChooseData = [
  {
    title: "Blazing Fast Speeds 🚀",
    image: "https://c8.alamy.com/comp/2RD8AE7/super-fast-internet-connection-speedtest-bandwidth-network-technology-man-using-internet-high-speed-by-smartphone-and-laptop-computer-5g-quality-sp-2RD8AE7.jpg",
  },
  {
    title: "Reliable Connection 🔗",
    image: "https://kems.net/wp-content/uploads/2023/09/advantages-of-dedicated-internet-access-dia-for-your-business.jpeg",
  },
  {
    title: "Affordable Plans 💰",
    image: "https://gadgets-africa.com/wp-content/uploads/2020/05/Wireless-Router-for-Home.jpg",
  },
  {
    title: "24/7 Support ☎️",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE_bUnRvdSggNRAinqM6sQGTE_9JZknwTHQg&s",
  },
  {
    title: "Easy Setup",
    image: "https://www.cyber.gov.au/sites/default/files/2024-10/secure-wifi-router-1.jpg",
  }
];

// --- DATA: FAQs - Kept your content ---
const faqsData = {
  "Account Management": {
    icon: <User className="w-4 h-4 text-[#182b5c]" />,
    items: [
      {
        question: "How do I create a self-care account?",
        answer: (
          <div className="space-y-2">
            <p>To create your self-care account:</p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Visit our self-care portal at optimaswifi.co.ke</li>
              <li>Click on 'Get Started'</li>
              <li>Enter your details as prompted</li>
              <li>Create a password and verify your identity via SMS</li>
              <li>Complete your profile details</li>
            </ol>
            <div className="bg-blue-50 p-2 rounded border border-blue-200 text-xs">
              <p>Note: Your account number can be found on your invoice or by contacting customer care.</p>
            </div>
          </div>
        ),
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer: (
          <div className="space-y-2">
            <p>Password reset options:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Click 'Forgot Password' on the login page</li>
              <li>Enter your registered email or phone number</li>
              <li>Follow the OTP verification process</li>
              <li>Set a new strong password</li>
            </ul>
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-xs">
              <p>Security Tip: Use a combination of letters, numbers and special characters for your password.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I update my account information?",
        answer: (
          <div className="space-y-2">
            <p>To update your account details:</p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Log in to your self-care account</li>
              <li>Go to 'Profile Settings'</li>
              <li>Edit the information you want to change</li>
              <li>Save your changes</li>
            </ol>
            <div className="bg-green-50 p-2 rounded border border-green-200 text-xs">
              <p>Important: Some changes may require verification for security purposes.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  "Billing & Payments": {
    icon: <CreditCard className="w-4 h-4 text-[#182b5c]" />,
    items: [
      {
        question: "How can I view my current bill?",
        answer: (
          <div className="space-y-2">
            <p>View your bill through:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Self-care portal dashboard</li>
              <li>Email notifications (if subscribed)</li>
              <li>Mobile app under 'Billing' section</li>
            </ul>
            <div className="bg-purple-50 p-2 rounded border border-purple-200 text-xs">
              <p>Tip: Enable auto-notifications to receive bills directly to your email.</p>
            </div>
          </div>
        ),
      },
      {
        question: "What payment methods are available?",
        answer: (
          <div className="space-y-2">
            <p>We accept multiple payment options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded border text-xs">
                <h4 className="font-medium mb-1 text-xs">Online Payments</h4>
                <ul className="space-y-1 text-[10px] sm:text-xs">
                  <li>• M-Pesa  paybill:4136553</li>
                  <li>• Credit/Debit Cards</li>
                  <li>• Bank Transfer</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-2 rounded border text-xs">
                <h4 className="font-medium mb-1 text-xs">Offline Payments</h4>
                <ul className="space-y-1 text-[10px] sm:text-xs">
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
            <p>To enable auto-payments:</p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Log in to your self-care account</li>
              <li>Navigate to 'Payment Methods'</li>
              <li>Select 'Set Up Auto-Pay'</li>
              <li>Choose your preferred payment method</li>
              <li>Set payment threshold and confirm</li>
            </ol>
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-xs">
              <p>Note: You'll receive notifications before each auto-payment is processed.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  "Service Management": {
    icon: <Settings className="w-4 h-4 text-[#182b5c]" />,
    items: [
      {
        question: "How do I upgrade my internet package?",
        answer: (
          <div className="space-y-2">
            <p>Package upgrade options:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Through self-care portal under 'Packages'</li>
              <li>Via mobile app by selecting new package</li>
              <li>By contacting customer support</li>
            </ul>
            <div className="bg-blue-50 p-2 rounded border border-blue-200 text-xs">
              <p>Changes take effect immediately or at next billing cycle based on your selection.</p>
            </div>
          </div>
        ),
      },
      {
        question: "Can I temporarily suspend my service?",
        answer: (
          <div className="space-y-2">
            <p>Service suspension options:</p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Minimum suspension period: 7 days</li>
              <li>Maximum suspension period: 90 days</li>
              <li>Reduced monthly charges during suspension</li>
              <li>Reactivate anytime through self-care</li>
            </ol>
            <div className="bg-purple-50 p-2 rounded border border-purple-200 text-xs">
              <p>Note: Equipment must remain connected during suspension.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I report service issues?",
        answer: (
          <div className="space-y-2">
            <p>Service issue reporting channels:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-red-50 p-2 rounded border text-xs">
                <h4 className="font-medium mb-1 text-xs">Self-Service</h4>
                <ul className="space-y-1 text-[10px] sm:text-xs">
                  <li>• Online troubleshooting</li>
                  <li>• Service status check</li>
                  <li>• Ticket submission</li>
                </ul>
              </div>
              <div className="bg-green-50 p-2 rounded border text-xs">
                <h4 className="font-medium mb-1 text-xs">Support</h4>
                <ul className="space-y-1 text-[10px] sm:text-xs">
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
    icon: <HelpCircle className="w-4 h-4 text-[#182b5c]" />,
    items: [
      {
        question: "What should I do if my internet is down?",
        answer: (
          <div className="space-y-2">
            <p>First troubleshooting steps:</p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Check all cable connections</li>
              <li>Restart your router/modem</li>
              <li>Check for service alerts in your area</li>
              <li>Run speed test from self-care portal</li>
              <li>Submit trouble ticket if issue persists</li>
            </ol>
            <div className="bg-red-50 p-2 rounded border border-red-200 text-xs">
              <p>Emergency: Call 0726896562 for immediate assistance with outages.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I optimize my Wi-Fi connection?",
        answer: (
          <div className="space-y-2">
            <p>Wi-Fi optimization tips:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded border text-xs">
                <h4 className="font-medium mb-1 text-xs">Placement</h4>
                <ul className="space-y-1 text-[10px] sm:text-xs">
                  <li>• Central location</li>
                  <li>• Elevated position</li>
                  <li>• Away from interference</li>
                </ul>
              </div>
              <div className="bg-green-50 p-2 rounded border text-xs">
                <h4 className="font-medium mb-1 text-xs">Settings</h4>
                <ul className="space-y-1 text-[10px] sm:text-xs">
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
            <p>Device connection options:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Standard routers support 10-15 devices</li>
              <li>Upgrade to mesh system for larger homes</li>
              <li>Use wired connections for stationary devices</li>
              <li>Enable guest network for visitors</li>
            </ul>
            <div className="bg-purple-50 p-2 rounded border border-purple-200 text-xs">
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

  return (
    <section className="min-h-screen pt-24 md:pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white text-[#182b5c]">
      {/* Background Pattern - Simplified to match Vuma Fiber */}
      <div className="absolute inset-0 bg-[#f8f9fa]">
        <div className="absolute top-0 left-0 w-full h-full" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header - Updated to match Vuma Fiber style */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#182b5c]">
            Optimas Home Fiber - Self-Care Portal
          </h2>
          <p className="text-gray-600 text-base">
            Manage your account, services, and get support 24/7
          </p>
        </div>
        
        {/* --- Why Choose Optimas (Updated to match Vuma Fiber) --- */}
        <div className="mb-16">
          {/* Section Heading - Simplified */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#182b5c]">Why Choose Optimas?</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {whyChooseData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Image Container - Simplified */}
                <div className="w-full h-32 md:h-40 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Text Below - Simplified */}
                <h4 className="font-bold text-lg text-center text-[#182b5c] leading-tight">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
        
        {/* Category Tabs - Simplified to match Vuma Fiber */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(faqsData).map(([key, { icon }]) => (
            <button
              key={key}
              onClick={() => {
                setActiveCategory(key);
                setOpenIndex(null);
                setSearch("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
                activeCategory === key
                  ? 'bg-[#d0b216] text-white'
                  : 'text-[#182b5c] hover:bg-gray-100'
              }`}
            >
              <span className="text-white bg-[#182b5c] rounded-full p-1.5 w-6 h-6 flex items-center justify-center">
                {icon}
              </span>
              <span>{key}</span>
            </button>
          ))}
        </div>
        
        {/* Search Bar - Simplified */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeCategory} FAQs...`}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-gray-900 focus:ring-1 focus:ring-[#d0b216] focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            {search && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {/* FAQ List - Simplified */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredFaqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden bg-white border border-gray-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-4 text-left flex justify-between items-center"
              >
                <h3 className="text-base font-medium text-[#182b5c]">{faq.question}</h3>
                <span className={`text-[#d0b216] transform transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 border-t border-gray-200">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Support CTA - Simplified */}
        <div className="mt-12 p-6 rounded-xl bg-white border border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-3 text-[#182b5c] text-center">
            Need More Help?
          </h3>
          <p className="mb-4 text-gray-600 text-center text-base">
            Our support team is available 24/7 to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+254741874200"
              className="px-4 py-2.5 bg-[#182b5c] text-white border border-[#182b5c] font-medium rounded-full transition-all hover:bg-[#0f1c3d] flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Support: 0741874200
            </a>
            <a
              href="mailto:support@knoxvilletechnologies.com"
              className="px-4 py-2.5 bg-white text-[#182b5c] border border-[#182b5c] font-medium rounded-full transition-all hover:bg-[#f8f9fa] flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
