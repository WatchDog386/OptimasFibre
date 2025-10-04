import React, { useState, useEffect, useContext } from "react";
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
import { ThemeContext } from "../contexts/ThemeContext";

// Define RISA's core styles as constants for consistency
const RISA_STYLES = {
  primaryColor: '#015B97',
  button: {
    // Primary Button: White bg, blue border/text -> Inverts on hover
    primary: {
      base: 'px-4 py-2 bg-white text-[#015B97] border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm',
      hover: 'hover:bg-[#015B97] hover:text-white hover:border-[#015B97]',
    },
    // Secondary Button: Blue bg, white text -> Inverts on hover
    secondary: {
      base: 'px-4 py-2 bg-[#015B97] text-white border border-[#015B97] font-bold rounded-[50px] transition-all duration-150 ease-in-out text-sm',
      hover: 'hover:bg-white hover:text-[#015B97] hover:border-white',
    },
    // Small Button (e.g., for tabs)
    small: {
      base: 'px-3 py-1.5 text-sm font-medium border rounded-[50px] transition-colors',
      active: 'bg-[#182B5C] text-white shadow-md',
      light: 'text-gray-600 hover:text-[#182B5C] hover:bg-gray-50',
      dark: 'text-gray-400 hover:text-[#d0b216] hover:bg-gray-800',
    }
  },
  typography: {
    // Base text styles
    body: 'text-base',
    // Headings
    h1: 'text-3xl md:text-4xl font-bold',
    h2: 'text-2xl md:text-3xl font-bold',
    h3: 'text-xl md:text-2xl font-bold',
    // Card and FAQ text
    cardTitle: 'text-base md:text-lg font-medium',
    cardText: 'text-xs md:text-sm',
    // Special text
    highlight: {
      yellow: 'text-[#d0b216]',
      blue: 'text-[#182B5C]',
    },
  }
};

const faqsData = {
  "Account Management": {
    icon: <User className="w-5 h-5 text-[#d0b216]" />,
    items: [
      {
        question: "How do I create a self-care account?",
        answer: (
          <div className="space-y-3">
            <p>To create your self-care account:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm">
              <li>Visit our self-care portal at knoxvilletechnologies.com</li>
              <li>Click on 'Get Started'</li>
              <li>Enter your details as prompted</li>
              <li>Create a password and verify your identity via SMS</li>
              <li>Complete your profile details</li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-700 text-xs md:text-sm">
              <p>Note: Your account number can be found on your invoice or by contacting customer care.</p>
            </div>
          </div>
        ),
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer: (
          <div className="space-y-3">
            <p>Password reset options:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li>Click 'Forgot Password' on the login page</li>
              <li>Enter your registered email or phone number</li>
              <li>Follow the OTP verification process</li>
              <li>Set a new strong password</li>
            </ul>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded border border-yellow-200 dark:border-yellow-700 text-xs md:text-sm">
              <p>Security Tip: Use a combination of letters, numbers and special characters for your password.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I update my account information?",
        answer: (
          <div className="space-y-3">
            <p>To update your account details:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm">
              <li>Log in to your self-care account</li>
              <li>Go to 'Profile Settings'</li>
              <li>Edit the information you want to change</li>
              <li>Save your changes</li>
            </ol>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-700 text-xs md:text-sm">
              <p>Important: Some changes may require verification for security purposes.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  "Billing & Payments": {
    icon: <CreditCard className="w-5 h-5 text-[#d0b216]" />,
    items: [
      {
        question: "How can I view my current bill?",
        answer: (
          <div className="space-y-3">
            <p>View your bill through:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li>Self-care portal dashboard</li>
              <li>Email notifications (if subscribed)</li>
              <li>Mobile app under 'Billing' section</li>
            </ul>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded border border-purple-200 dark:border-purple-700 text-xs md:text-sm">
              <p>Tip: Enable auto-notifications to receive bills directly to your email.</p>
            </div>
          </div>
        ),
      },
      {
        question: "What payment methods are available?",
        answer: (
          <div className="space-y-3">
            <p>We accept multiple payment options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border text-xs">
                <h4 className="font-medium mb-2 text-xs">Online Payments</h4>
                <ul className="space-y-1 text-xs">
                  <li>• M-Pesa  paybill:4136553</li>
                  <li>• Credit/Debit Cards</li>
                  <li>• Bank Transfer</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border text-xs">
                <h4 className="font-medium mb-2 text-xs">Offline Payments</h4>
                <ul className="space-y-1 text-xs">
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
          <div className="space-y-3">
            <p>To enable auto-payments:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm">
              <li>Log in to your self-care account</li>
              <li>Navigate to 'Payment Methods'</li>
              <li>Select 'Set Up Auto-Pay'</li>
              <li>Choose your preferred payment method</li>
              <li>Set payment threshold and confirm</li>
            </ol>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded border border-yellow-200 dark:border-yellow-700 text-xs md:text-sm">
              <p>Note: You'll receive notifications before each auto-payment is processed.</p>
            </div>
          </div>
        ),
      },
    ],
  },
  "Service Management": {
    icon: <Settings className="w-5 h-5 text-[#d0b216]" />,
    items: [
      {
        question: "How do I upgrade my internet package?",
        answer: (
          <div className="space-y-3">
            <p>Package upgrade options:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li>Through self-care portal under 'Packages'</li>
              <li>Via mobile app by selecting new package</li>
              <li>By contacting customer support</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-700 text-xs md:text-sm">
              <p>Changes take effect immediately or at next billing cycle based on your selection.</p>
            </div>
          </div>
        ),
      },
      {
        question: "Can I temporarily suspend my service?",
        answer: (
          <div className="space-y-3">
            <p>Service suspension options:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm">
              <li>Minimum suspension period: 7 days</li>
              <li>Maximum suspension period: 90 days</li>
              <li>Reduced monthly charges during suspension</li>
              <li>Reactivate anytime through self-care</li>
            </ol>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded border border-purple-200 dark:border-purple-700 text-xs md:text-sm">
              <p>Note: Equipment must remain connected during suspension.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I report service issues?",
        answer: (
          <div className="space-y-3">
            <p>Service issue reporting channels:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded border text-xs">
                <h4 className="font-medium mb-2 text-xs">Self-Service</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Online troubleshooting</li>
                  <li>• Service status check</li>
                  <li>• Ticket submission</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border text-xs">
                <h4 className="font-medium mb-2 text-xs">Support</h4>
                <ul className="space-y-1 text-xs">
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
    icon: <HelpCircle className="w-5 h-5 text-[#d0b216]" />,
    items: [
      {
        question: "What should I do if my internet is down?",
        answer: (
          <div className="space-y-3">
            <p>First troubleshooting steps:</p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm">
              <li>Check all cable connections</li>
              <li>Restart your router/modem</li>
              <li>Check for service alerts in your area</li>
              <li>Run speed test from self-care portal</li>
              <li>Submit trouble ticket if issue persists</li>
            </ol>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-700 text-xs md:text-sm">
              <p>Emergency: Call 0726896562 for immediate assistance with outages.</p>
            </div>
          </div>
        ),
      },
      {
        question: "How do I optimize my Wi-Fi connection?",
        answer: (
          <div className="space-y-3">
            <p>Wi-Fi optimization tips:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border text-xs">
                <h4 className="font-medium mb-2 text-xs">Placement</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Central location</li>
                  <li>• Elevated position</li>
                  <li>• Away from interference</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border text-xs">
                <h4 className="font-medium mb-2 text-xs">Settings</h4>
                <ul className="space-y-1 text-xs">
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
          <div className="space-y-3">
            <p>Device connection options:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li>Standard routers support 10-15 devices</li>
              <li>Upgrade to mesh system for larger homes</li>
              <li>Use wired connections for stationary devices</li>
              <li>Enable guest network for visitors</li>
            </ul>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded border border-purple-200 dark:border-purple-700 text-xs md:text-sm">
              <p>Tip: Monitor connected devices through self-care portal.</p>
            </div>
          </div>
        ),
      },
    ],
  },
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideUp = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const rotate = {
  hidden: { rotate: -180, opacity: 0 },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function Faqs() {
  const [activeCategory, setActiveCategory] = useState("Account Management");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredFaqs = faqsData[activeCategory].items.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.section 
      className={`min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 left-0 w-full h-full ${
          darkMode ? 'bg-gray-900' : 'bg-[#182b5c]'
        }`}>
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#d0b216] opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-[#d0b216] opacity-10"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [180, 270, 180],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <motion.h2 
            className={`${RISA_STYLES.typography.h2} mb-2 ${RISA_STYLES.typography.highlight.yellow}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Optimas Fibre - Self-Care Portal
          </motion.h2>
          <motion.p 
            className={darkMode ? 'text-gray-300 text-sm md:text-base' : 'text-gray-600 text-sm md:text-base'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Manage your account, services, and get support 24/7
          </motion.p>
          <motion.div 
            className="w-24 h-1 bg-[#d0b216] mx-auto mt-4"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(faqsData).map(([key, { icon }]) => (
            <motion.button
              key={key}
              onClick={() => {
                setActiveCategory(key);
                setOpenIndex(null);
                setSearch("");
              }}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-[50px] ${
                activeCategory === key
                  ? RISA_STYLES.button.small.active
                  : darkMode
                    ? RISA_STYLES.button.small.dark
                    : RISA_STYLES.button.small.light
              }`}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{ rotate: activeCategory === key ? 360 : 0 }}
                transition={{ duration: 0.4 }}
              >
                {icon}
              </motion.span>
              <span>{key}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="max-w-xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className={`relative ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-300'
          } rounded-[50px]`}>
            <motion.div
              animate={{ rotate: search ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              } w-5 h-5`} />
            </motion.div>
            <input
              type="text"
              placeholder={`Search ${activeCategory} FAQs...`}
              className={`w-full pl-10 pr-4 py-2 rounded-[50px] text-sm ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-[#d0b216]' 
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#182b5c]'
              } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => setSearch("")}
              >
                ×
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div 
          className="grid md:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeCategory}
        >
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${
                  darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
                whileHover={{ y: -5 }}
              >
                <motion.button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-4 text-left flex justify-between items-center"
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className={`${RISA_STYLES.typography.cardTitle} pr-4 ${
                    darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                  }`}>{faq.question}</h3>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    className="text-[#d0b216] flex-shrink-0"
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: 1, 
                        height: "auto",
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.4, delay: 0.1 }
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.2 }
                        }
                      }}
                      className={`px-4 pb-4 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      } text-xs md:text-sm overflow-hidden`}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Support CTA */}
        <motion.div 
          className={`mt-12 p-6 rounded-xl text-center ${
            darkMode ? 'bg-gray-800' : 'bg-[#182b5c]'
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ 
            y: -5,
            transition: { duration: 0.2 }
          }}
        >
          <motion.h3 
            className={`${RISA_STYLES.typography.h3} mb-4 text-white`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Need More Help?
          </motion.h3>
          <motion.p 
            className="mb-6 opacity-90 text-white text-sm md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.9 }}
          >
            Our support team is available 24/7 to assist you
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a 
              href="tel:+254726896562" 
              className={`${RISA_STYLES.button.secondary.base} ${RISA_STYLES.button.secondary.hover} flex items-center justify-center gap-2`}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-4 h-4" />
              Call Support: 0741874200
            </motion.a>
            <motion.a 
              href="mailto:support@knoxvilletechnologies.com" 
              className={`${RISA_STYLES.button.primary.base} ${RISA_STYLES.button.primary.hover} flex items-center justify-center gap-2`}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-4 h-4" />
              Email Us
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}