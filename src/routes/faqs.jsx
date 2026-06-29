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
  Mail,
  ArrowRight,
  Zap,
  ShieldCheck,
  Banknote,
  Headset
} from "lucide-react";

// --- DATA: Why Choose Optimas (Updated to match design) ---
const whyChooseData = [
  {
    title: "Free Installation",
    description: "Enjoy stress-free and quick setup at no extra cost to get you connected instantly.",
    icon: <Zap className="w-5 h-5" />,
    highlighted: false,
  },
  {
    title: "Blazing Fast",
    description: "Experience ultra-high speeds designed for seamless streaming, gaming, and working.",
    icon: <ShieldCheck className="w-5 h-5" />,
    highlighted: true, // Matches the red highlighted card in the design
  },
  {
    title: "Unique Flexible",
    description: "Choose from a variety of packages tailored perfectly to fit your household needs.",
    icon: <Banknote className="w-5 h-5" />,
    highlighted: false,
  },
  {
    title: "24/7 Support",
    description: "Our dedicated technical team is always on standby to resolve any issues rapidly.",
    icon: <Headset className="w-5 h-5" />,
    highlighted: false,
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
            <div className="bg-[#004080]/10 p-3 rounded-lg border border-[#004080]/20 text-xs text-[#004080] font-semibold mt-3">
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
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg border border-[#FF6B35]/20 text-xs text-[#C54D23] font-semibold mt-3">
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
            <div className="bg-[#004080]/10 p-3 rounded-lg border border-[#004080]/20 text-xs text-[#004080] font-semibold mt-3">
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
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg border border-[#FF6B35]/20 text-xs text-[#C54D23] font-semibold mt-3">
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
                <h4 className="font-bold mb-2 text-xs text-[#004080] tracking-wide">Online Payments</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• M-Pesa paybill: 4136553</li>
                  <li>• Credit/Debit Cards</li>
                  <li>• Bank Transfer</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#004080] tracking-wide">Offline Payments</h4>
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
            <div className="bg-[#004080]/10 p-3 rounded-lg border border-[#004080]/20 text-xs text-[#004080] font-semibold mt-3">
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
            <div className="bg-[#004080]/10 p-3 rounded-lg border border-[#004080]/20 text-xs text-[#004080] font-semibold mt-3">
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
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg border border-[#FF6B35]/20 text-xs text-[#C54D23] font-semibold mt-3">
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
                <h4 className="font-bold mb-2 text-xs text-[#FF6B35] tracking-wide">Self-Service</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• Online troubleshooting</li>
                  <li>• Service status check</li>
                  <li>• Ticket submission</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#004080] tracking-wide">Support</h4>
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
            <div className="bg-[#FF6B35]/10 p-3 rounded-lg border border-[#FF6B35]/20 text-xs text-[#C54D23] font-bold mt-3">
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
                <h4 className="font-bold mb-2 text-xs text-[#004080] tracking-wide">Placement</h4>
                <ul className="space-y-1 text-xs text-gray-600 font-medium">
                  <li>• Central location</li>
                  <li>• Elevated position</li>
                  <li>• Away from interference</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2 text-xs text-[#FF6B35] tracking-wide">Settings</h4>
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
            <div className="bg-[#004080]/10 p-3 rounded-lg border border-[#004080]/20 text-xs text-[#004080] font-medium mt-3">
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
          <p className="text-[#004080] text-[11px] font-bold lowercase tracking-[0.08em] mb-2">self-care portal</p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-[#004080] tracking-tight lowercase">
            self-care portal & faqs
          </h2>
          <p className="text-gray-600 font-bold text-sm md:text-base max-w-2xl mx-auto">
            Manage your account, services, and get support 24/7 seamlessly.
          </p>
        </div>

        {/* --- RE-DESIGNED: Explore The Network (Matches UI Image) --- */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#22c55e] font-bold text-[11px] tracking-[0.08em] lowercase mb-3">
                <span className="w-2 h-2 bg-[#22c55e] rounded-full"></span>
                network
              </div>
              <h2 className="text-3xl md:text-[42px] font-extrabold text-[#1A1A24] leading-tight tracking-tight lowercase">
                explore the magic <br className="hidden md:block" /> of the <span className="text-[#22c55e]">network</span>
              </h2>
            </div>
            
            <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-8 py-3.5 rounded-full font-bold text-[11px] lowercase tracking-[0.08em] flex items-center gap-2 transition-all shadow-md shadow-red-500/20">
              discover <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseData.map((item, index) => (
              <div 
                key={index} 
                className={`
                  px-6 pt-8 pb-8 transition-all duration-300
                  ${item.highlighted 
                    ? "bg-[#ef4444] text-white shadow-xl shadow-red-500/20 scale-105 z-10" 
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 hover:shadow-md"
                  }
                `}
              >
                {/* Icon Container */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 border ${
                  item.highlighted 
                    ? "bg-white/10 border-white/20 text-white" 
                    : "bg-gray-50 border-gray-100 text-gray-600"
                }`}>
                  {item.icon}
                </div>

                <h4 className="font-extrabold text-[17px] mb-3 lowercase">{item.title}</h4>
                <p className={`text-sm leading-relaxed ${item.highlighted ? "text-red-50" : "text-gray-500"}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQS */}
        <div className="mb-24 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#004080] text-[11px] font-bold lowercase tracking-[0.08em] mb-2">support</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#004080] tracking-tight lowercase">
              frequently asked questions
            </h2>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-shrink-0 lg:w-[320px]">
              <img 
                src="/faq.png" 
                alt="FAQ" 
                className="w-full max-w-[280px] lg:max-w-[320px] h-auto object-contain"
              />
            </div>
            <div className="flex-1 w-full space-y-4">
              {[
                { q: "How do I create a self-care account?", a: "Visit our self-care portal at optimaswifi.co.ke and click on 'Sign Up'. Enter your account details and follow the prompts to create your account." },
                { q: "What payment methods do you accept?", a: "We accept M-Pesa, Airtel Money, bank transfers, and card payments through our self-care portal." },
                { q: "How long does installation take?", a: "Installation typically takes about 1 hour and can be scheduled for the next day in most areas." },
                { q: "Is there a contract commitment?", a: "No, we offer flexible month-to-month plans with no long-term contracts. You can cancel anytime." },
              ].map((faq, i) => (
                <details key={i} className="group bg-gray-50 rounded-xl p-5 cursor-pointer border border-gray-100 hover:border-[#004080]/20 transition-colors">
                  <summary className="text-gray-800 font-bold text-base list-none flex justify-between items-center">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="max-w-6xl mx-auto px-2.5 md:px-8 grid md:grid-cols-2 gap-6 pb-16">
          <div className="bg-[#E8F0FE] p-8 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10 w-2/3">
              <p className="text-[#004080] text-[11px] font-bold lowercase tracking-[0.08em] mb-1">residential</p>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2 lowercase tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>home fiber</h3>
              <p className="text-gray-500 text-[0.8125rem] mb-6 max-w-[200px] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>Uncapped speeds from 8 Mbps. free installation, no contracts.</p>
              <button className="bg-[#004080] hover:bg-[#003366] text-white px-5 py-2.5 rounded-full text-[0.8125rem] font-bold lowercase tracking-[0.08em] transition-colors" style={{ fontFamily: "'Nunito', sans-serif" }}>
                view packages
              </button>
            </div>
            <div className="absolute right-0 bottom-0">
               <img src="/browse.png" alt="Browse" className="w-32 h-40 object-contain" />
            </div>
          </div>

          <div className="bg-[#FFF3EB] p-8 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10 w-2/3">
              <p className="text-[#FF6B35] text-[11px] font-bold lowercase tracking-[0.08em] mb-1">business</p>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2 lowercase tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>business fiber</h3>
              <p className="text-gray-500 text-[0.8125rem] mb-6 max-w-[220px] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>Dedicated speeds, priority support, and sla-backed connectivity.</p>
              <button className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-5 py-2.5 text-[0.8125rem] font-bold lowercase tracking-[0.08em] transition-colors" style={{ fontFamily: "'Nunito', sans-serif" }}>
                get started
              </button>
            </div>
            <div className="absolute right-0 bottom-0">
               <img src="/availble.png" alt="Available" className="w-32 h-40 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}