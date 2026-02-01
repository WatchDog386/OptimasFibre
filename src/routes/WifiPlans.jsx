// WifiPlans.jsx — UPDATED VERSION WITH PROPER WHATSAPP INTEGRATION
import React, { useState, useEffect, useRef, useContext } from "react";
import { CheckCircle, X, Wifi, Star, Phone, Mail, MapPin, Zap, Smartphone, Download, Send, MessageCircle, AlertCircle, Eye } from "lucide-react";
import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

// Animal name mappings (English to Swahili)
const animalNames = {
  "Jumbo": "Ndovu",
  "Buffalo": "Nyati", 
  "Ndovu": "Ndovu",
  "Gazzelle": "Swala",
  "Tiger": "Tiger",
  "Chui": "Chui",
};

// Image URLs for each animal
const animalImages = {
  "Jumbo": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Buffalo": "https://images.unsplash.com/photo-1567336273898-ebbe52c60b84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Ndovu": "https://images.unsplash.com/photo-1574870111867-089858c9a176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Gazzelle": "https://images.unsplash.com/photo-1550358864-518f202c02ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Tiger": "https://images.unsplash.com/photo-1550358864-518f202c02ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Chui": "https://images.unsplash.com/photo-1518706833061-eccd1f7d5e52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
};

// Button Styles
const BUTTON_STYLES = {
  primary: {
    base: 'py-3 px-8 rounded-full transition-colors duration-300 font-medium text-base',
    dark: 'bg-primary hover:bg-slate-700 text-white',
    light: 'bg-primary hover:bg-slate-700 text-white',
  },
  secondary: {
    base: 'py-3 px-8 rounded-full transition-colors duration-300 font-medium text-base',
    dark: 'border border-gray-400 text-gray-700 hover:border-primary hover:text-primary',
    light: 'border border-primary text-primary hover:bg-primary hover:text-white',
  },
  small: {
    base: 'py-2 px-6 rounded-full font-medium transition-all text-sm',
    light: 'bg-primary hover:bg-slate-700 text-white',
    dark: 'bg-primary hover:bg-slate-700 text-white',
  }
};

// DomeCard Component
const DomeCard = ({ plan, color, index, onSelect, darkMode }) => {
  const colorMap = {
    blue: {
      bg: "linear-gradient(135deg, #303a4d 0%, #1e293b 100%)", // Primary Blue
      button: BUTTON_STYLES.small.light,
    },
    red: {
      bg: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
      button: "bg-white/20 hover:bg-white/30 text-white",
    },
    goldenYellow: {
      bg: "linear-gradient(135deg, #00d084 0%, #059669 100%)", // Converted to Vuma Green (Accent)
      button: "bg-white/20 hover:bg-white/30 text-white",
    },
    goldenGreen: {
      bg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      button: "bg-white/20 hover:bg-white/30 text-white",
    },
    purple: {
      bg: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      button: "bg-white/20 hover:bg-white/30 text-white",
    },
    pink: {
      bg: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
      button: "bg-white/20 hover:bg-white/30 text-white",
    }
  };
  
  const currentColor = colorMap[color];
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.1 } });
    }
  }, [controls, inView, index]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative h-full flex flex-col group border border-gray-100 bg-white`}
      whileHover={{ y: -5 }}
    >
      {plan.popular && (
        <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 text-xs font-bold rounded-full z-10 flex items-center shadow-md">
          <Star size={12} className="mr-1 fill-current" />
          Popular
        </div>
      )}
      
      {/* Image Top Section */}
      <div className="h-40 relative overflow-hidden">
        <img 
          src={animalImages[plan.name]}
          alt={plan.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
          <div className="text-white">
            <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wifi size={14} className="mr-1" />
                <span className="text-sm opacity-90">{plan.speed}</span>
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                {animalNames[plan.name]}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-4 flex-grow">
          <ul className="mb-4 space-y-2">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center">
                <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                <span className="text-white text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-4 pb-4 px-4">
          <div className="text-center mb-3">
            <span className="text-xl font-bold text-white">Ksh {plan.price}</span>
            <span className="text-white opacity-80 text-sm"> /month</span>
          </div>
          <motion.button
            onClick={() => onSelect(plan)}
            className={`${BUTTON_STYLES.small.base} ${currentColor.button} w-full`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            BOOK NOW
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// MobileHotspotCard Component
const MobileHotspotCard = ({ plan, color, index, onSelect, darkMode }) => {
  const colorMap = {
    teal: {
      bg: darkMode ? "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)" : "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
      button: darkMode ? BUTTON_STYLES.small.dark : BUTTON_STYLES.small.light,
    },
    amber: {
      bg: darkMode ? "linear-gradient(135deg, #b45309 0%, #d97706 100%)" : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    violet: {
      bg: darkMode ? "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      button: "bg-violet-600 hover:bg-violet-700 text-white",
    },
    rose: {
      bg: darkMode ? "linear-gradient(135deg, #be123c 0%, #e11d48 100%)" : "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
      button: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    emerald: {
      bg: darkMode ? "linear-gradient(135deg, #047857 0%, #059669 100%)" : "linear-gradient(135deg, #059669 0%, #047857 100%)",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    blue: {
      bg: darkMode ? "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)" : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    }
  };
  
  const currentColor = colorMap[color];
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.1 } });
    }
  }, [controls, inView, index]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative h-full flex flex-col group ${
        darkMode ? 'border border-gray-700' : 'border border-gray-200'
      }`}
      whileHover={{ y: -5 }}
    >
      {plan.popular && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 text-xs font-bold rounded-full z-10 flex items-center shadow-md">
          <Star size={12} className="mr-1 fill-current" />
          Popular
        </div>
      )}
      
      {/* Header */}
      <div className="h-20 relative overflow-hidden" style={{ background: currentColor.bg }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-3">
          <div className="text-white w-full">
            <h3 className="text-base font-semibold mb-1">{plan.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone size={12} className="mr-1" />
                <span className="text-xs opacity-90">{plan.devices}</span>
              </div>
              <span className="text-xs font-bold">{plan.duration}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-4 flex-grow">
          <div className="text-center mb-3">
            <span className="text-lg font-bold text-white">Ksh {plan.price}</span>
          </div>
          <ul className="space-y-2">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center">
                <CheckCircle className="w-3 h-3 text-white mr-2 flex-shrink-0" />
                <span className="text-white text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pb-3 px-3">
          <motion.button
            onClick={() => onSelect(plan)}
            className={`${BUTTON_STYLES.small.base} ${currentColor.button} w-full text-sm`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            BUY NOW
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Processing Animation Component
const ProcessingAnimation = ({ darkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl shadow-xl w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-8 text-center`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
        />
        <h3 className="text-xl font-semibold mb-2">Processing Your Order</h3>
        <p className="text-sm opacity-75 mb-4">Please wait while we create your invoice...</p>
        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-blue-600 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Success Popup Component
const SuccessPopup = ({ onClose, onViewInvoice, darkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`rounded-xl shadow-xl w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>
          
          <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Order Submitted Successfully!
          </h3>
          
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Thank you for your order! Your invoice has been created successfully.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>What happens next?</strong><br />
              1. Review your invoice details<br />
              2. Send it to our team via WhatsApp<br />
              3. We'll contact you to schedule installation
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center ${
                darkMode 
                  ? 'bg-[#182b5c] text-white hover:bg-[#0f1f45]' 
                  : 'bg-[#182b5c] text-white hover:bg-[#0f1f45]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewInvoice}
            >
              <Eye size={18} className="mr-2" />
              Review Invoice
            </motion.button>
            
            <motion.button
              className={`w-full py-3 px-4 rounded-xl font-medium border transition-colors ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:border-gray-400' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Invoice Preview Component - UPDATED WITH PROPER WHATSAPP MESSAGE
const InvoicePreview = ({ invoiceData, onClose, darkMode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendWhatsApp = () => {
    if (!invoiceData) return;
    
    // Create comprehensive WhatsApp message with all invoice details
    const message = `🌐 *OPTIMAS FIBER - INTERNET CONNECTION REQUEST* 🌐

*📋 INVOICE DETAILS*
📄 Invoice Number: ${invoiceData.invoiceNumber}
📅 Invoice Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString()}
📅 Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}
🔰 Status: ${invoiceData.status || 'Pending'}

*👤 CUSTOMER INFORMATION*
👤 Full Name: ${invoiceData.customerName}
📧 Email Address: ${invoiceData.customerEmail}
📞 Phone Number: ${invoiceData.customerPhone}
📍 Location: ${invoiceData.customerLocation}

*📦 SELECTED PLAN DETAILS*
🎯 Plan Name: ${invoiceData.planName}
⚡ Internet Speed: ${invoiceData.planSpeed}
💰 Monthly Price: Ksh ${invoiceData.planPrice?.toLocaleString()}
🔧 Connection Type: ${invoiceData.connectionType}
📅 Billing Cycle: Monthly

*⭐ PLAN FEATURES INCLUDED*
${invoiceData.features && invoiceData.features.map(feature => `✅ ${feature}`).join('%0A')}

*💰 PAYMENT SUMMARY*
💵 Total Amount: Ksh ${invoiceData.planPrice?.toLocaleString()}
🔄 Billing: Monthly
📝 Payment Terms: Due upon receipt

*💳 PAYMENT INSTRUCTIONS*
🏦 *Bank Transfer:*
   Bank: Equity Bank
   Account Name: Optimas Fiber Ltd
   Account Number: 1234567890
   Branch: Nairobi Main

📱 *Mobile Money:*
   Paybill: 123456
   Account Number: ${invoiceData.invoiceNumber}

*🚀 CONNECTION REQUEST*
I would like to proceed with the ${invoiceData.planName} plan installation. Please contact me to schedule the installation at my location.

*📞 CONTACT INFORMATION*
Phone: ${invoiceData.customerPhone}
Email: ${invoiceData.customerEmail}
Location: ${invoiceData.customerLocation}

I'm looking forward to getting connected with Optimas Fiber! Please confirm receipt and provide installation timeline.

Thank you!
---
Optimas Fiber - High-Speed Internet Solutions
+254 741 874 200 | support@optimasfiber.co.ke`;
    
    const whatsappUrl = `https://wa.me/254741874200?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    const cleanStr = price.toString().replace(/,/g, '');
    const num = parseInt(cleanStr, 10);
    return isNaN(num) ? price : num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-t-xl border-b`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg mr-4 ${darkMode ? 'bg-[#182b5c]' : 'bg-[#182b5c]'}`}>
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#182b5c]">OPTIMAS FIBER</h1>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High-Speed Internet Solutions</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-[#d0b216] mb-2">INVOICE</h2>
              <div className={`px-3 py-1 rounded-lg ${darkMode ? 'bg-[#182b5c]' : 'bg-[#182b5c]'} text-white`}>
                <p className="font-semibold">#{invoiceData.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Client & Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'} border-b pb-2`}>Bill To</h3>
              <div className="space-y-2">
                <p className="font-semibold">{invoiceData.customerName}</p>
                <p>{invoiceData.customerEmail}</p>
                <p>{invoiceData.customerPhone}</p>
                <p>{invoiceData.customerLocation}</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'} border-b pb-2`}>Invoice Details</h3>
              <div className="space-y-2">
                <p><strong>Invoice Date:</strong> {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                }`}>
                  <CheckCircle size={14} className="mr-1" />
                  {invoiceData.status || 'Pending'}
                </div>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="mb-8">
            <div className={`rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'} overflow-hidden`}>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 font-semibold border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                Service Details
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">{invoiceData.planName} Internet Plan</p>
                    <p className="text-sm opacity-75">Monthly Subscription • {invoiceData.connectionType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">Ksh {formatPrice(invoiceData.planPrice)}</p>
                    <p className="text-sm opacity-75">Speed: {invoiceData.planSpeed}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className={`text-right p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} max-w-xs w-full`}>
              <div className={`text-2xl font-bold mb-2 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>
                Total: Ksh {formatPrice(invoiceData.planPrice)}
              </div>
              <p className="text-sm opacity-75">Per month • Exclusive of taxes</p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'} border-b pb-2`}>Features Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {invoiceData.features && invoiceData.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} mb-8`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>Payment Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Bank Transfer:</strong></p>
                <div className="text-sm space-y-1 mt-2">
                  <p>Bank: Equity Bank</p>
                  <p>Account Name: Optimas Fiber Ltd</p>
                  <p>Account Number: 1234567890</p>
                  <p>Branch: Nairobi Main</p>
                </div>
              </div>
              <div>
                <p><strong>Mobile Money:</strong></p>
                <div className="text-sm space-y-1 mt-2">
                  <p>Paybill: 123456</p>
                  <p>Account: {invoiceData.invoiceNumber}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <motion.button
              className={`flex items-center px-6 py-3 rounded-full transition-colors ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendWhatsApp}
            >
              <MessageCircle size={18} className="mr-2" />
              Send via WhatsApp
            </motion.button>
            
            <motion.button
              className={`flex items-center px-6 py-3 rounded-full border transition-colors ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:border-[#d0b216] hover:text-[#d0b216]' 
                  : 'border-[#182b5c] text-[#182b5c] hover:bg-[#182b5c] hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
            >
              <Download size={18} className="mr-2" />
              Print Invoice
            </motion.button>
            
            <motion.button
              className={`flex items-center px-6 py-3 rounded-full border transition-colors ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500' 
                  : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              <X size={18} className="mr-2" />
              Close
            </motion.button>
          </div>

          <div className={`text-center mt-8 pt-6 border-t ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
            <p>Thank you for choosing Optimas Fiber!</p>
            <p>For any queries, contact us at: support@optimasfiber.co.ke | +254 741 874 200</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main WifiPlans Component
const WifiPlans = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  // Mobile Hotspot Plans
  const mobilePlans = [
    { 
      id: 1, 
      name: "2 Hours", 
      price: "15", 
      duration: "2hrs", 
      devices: "1 Device", 
      features: ["Fast browsing", "Social media access", "Email checking"], 
      popular: false, 
      link: "http://wifi.optimassys.co.ke/index.php?_route=main" 
    },
    { 
      id: 2, 
      name: "12 Hours", 
      price: "30", 
      duration: "12hrs", 
      devices: "1 Device", 
      features: ["Extended browsing", "Streaming music", "Social media"], 
      popular: false, 
      link: "http://wifi.optimassys.co.ke/index.php?_route=main" 
    },
    { 
      id: 3, 
      name: "1 Day", 
      price: "40", 
      duration: "1 day", 
      devices: "1 Device", 
      features: ["Full day access", "Standard streaming", "Online gaming"], 
      popular: true, 
      link: "http://wifi.optimassys.co.ke/index.php?_route=main" 
    },
    { 
      id: 4, 
      name: "Weekly", 
      price: "250", 
      duration: "week", 
      devices: "2 Devices", 
      features: ["7 days unlimited", "HD streaming", "Multiple devices"], 
      popular: false, 
      link: "http://wifi.optimassys.co.ke/index.php?_route=main" 
    },
    { 
      id: 5, 
      name: "Monthly Single", 
      price: "610", 
      duration: "month", 
      devices: "1 Device", 
      features: ["30 days access", "Priority bandwidth", "24/7 support"], 
      popular: false, 
      link: "http://wifi.optimassys.co.ke/index.php?_route=main" 
    },
    { 
      id: 6, 
      name: "Monthly Dual", 
      price: "1000", 
      duration: "month", 
      devices: "2 Devices", 
      features: ["30 days unlimited", "4K streaming", "Two devices simultaneously"], 
      popular: false, 
      link: "http://wifi.optimassys.co.ke/index.php?_route=main" 
    },
  ];

  const mobileColors = ["teal", "amber", "violet", "rose", "emerald", "blue"];

  // Fiber Plans
  const plans = [
    { 
      id: 1, 
      name: "Jumbo", 
      price: "1499", 
      speed: "8Mbps", 
      features: ["Great for browsing", "24/7 Support", "Free Installation"], 
      type: "home", 
      popular: false 
    },
    { 
      id: 2, 
      name: "Buffalo", 
      price: "1999", 
      speed: "15Mbps", 
      features: ["Streaming & Social Media", "24/7 Support", "Free Installation"], 
      type: "home", 
      popular: false 
    },
    { 
      id: 3, 
      name: "Ndovu", 
      price: "2499", 
      speed: "25Mbps", 
      features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"], 
      type: "home", 
      popular: false 
    },
    { 
      id: 4, 
      name: "Gazzelle", 
      price: "2999", 
      speed: "30Mbps", 
      features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"], 
      type: "home", 
      popular: true 
    },
    { 
      id: 5, 
      name: "Tiger", 
      price: "3999", 
      speed: "40Mbps", 
      features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"], 
      type: "home", 
      popular: false 
    },
    { 
      id: 6, 
      name: "Chui", 
      price: "4999", 
      speed: "60Mbps", 
      features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"], 
      type: "home", 
      popular: false 
    },
  ];

  const colors = ["blue", "red", "goldenYellow", "goldenGreen", "purple", "pink"];

  // Features
  const features = [
    { 
      title: "Lightning Fast Speeds", 
      description: "Experience blazing fast internet with our fiber optic technology", 
      icon: <Wifi size={24} /> 
    },
    { 
      title: "24/7 Support", 
      description: "Our technical team is available round the clock to assist you", 
      icon: <Phone size={24} /> 
    },
    { 
      title: "Free Installation", 
      description: "Get connected without any setup fees or hidden charges", 
      icon: <MapPin size={24} /> 
    },
    { 
      title: "Reliable Connection", 
      description: "99.9% uptime guarantee for uninterrupted browsing and streaming", 
      icon: <CheckCircle size={24} /> 
    }
  ];

  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Event Handlers
  const handleContactClick = () => {
    navigate('/contact');
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowForm(true);
    setErrorDetails("");
  };

  const handleMobilePlanSelect = (plan) => {
    window.open(plan.link, '_blank');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowProcessing(true);
    setErrorDetails("");

    const { name, email, phone, location } = formData;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim().replace(/\s+/g, '');
    const trimmedLocation = location.trim();

    // Basic validation
    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedLocation) {
      setErrorDetails("Please fill in all required fields.");
      setShowProcessing(false);
      setIsLoading(false);
      return;
    }

    // Simulate API call (replace with actual API call)
    setTimeout(() => {
      const mockInvoiceData = {
        _id: "mock_" + Date.now(),
        invoiceNumber: "INV" + Math.floor(Math.random() * 10000),
        customerName: trimmedName,
        customerEmail: trimmedEmail,
        customerPhone: trimmedPhone,
        customerLocation: trimmedLocation,
        planName: selectedPlan.name,
        planPrice: parseInt(selectedPlan.price),
        planSpeed: selectedPlan.speed,
        features: selectedPlan.features,
        connectionType: "Fiber Optic",
        status: "pending",
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      setInvoiceData(mockInvoiceData);
      setShowProcessing(false);
      setShowSuccessPopup(true);
      setShowForm(false);
      setIsLoading(false);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
      });
    }, 3000);
  };

  const handleViewInvoice = () => {
    setShowSuccessPopup(false);
    setShowInvoice(true);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    const cleanStr = price.toString().replace(/,/g, '');
    const num = parseInt(cleanStr, 10);
    return isNaN(num) ? price : num.toLocaleString();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  return (
    <motion.div 
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#182b5c] to-[#0f1f45] z-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-30 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Experience <span className="text-[#d0b216]">Blazing Fast</span>
              <br />
              Internet
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-200 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Join thousands of satisfied customers with our reliable, high-speed fiber internet
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.button 
                onClick={() => document.getElementById("plans").scrollIntoView({ behavior: "smooth" })}
                className={`${BUTTON_STYLES.primary.base} bg-[#d0b216] text-[#182b5c] hover:bg-[#c0a220]`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Plans
              </motion.button>
              
              <motion.button 
                className={`${BUTTON_STYLES.secondary.base} border-white text-white hover:bg-white hover:text-[#182b5c]`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContactClick}
              >
                Get Started Today
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="relative -mt-20 md:-mt-32 z-20">
        <div className="container mx-auto px-4">
          
          {/* Mobile Hotspot Section */}
          <section id="mobile-hotspot" className="mb-16 md:mb-24">
            <motion.div 
              className={`rounded-2xl shadow-xl p-6 md:p-8 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className={`text-2xl md:text-4xl font-bold text-center mb-8 ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                }`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Mobile Hotspot Packages
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {mobilePlans.map((plan, index) => (
                  <MobileHotspotCard 
                    key={plan.id} 
                    plan={plan} 
                    color={mobileColors[index]}
                    index={index}
                    onSelect={handleMobilePlanSelect}
                    darkMode={darkMode}
                  />
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                viewport={{ once: true }}
                className={`mt-6 p-4 rounded-xl text-center ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Note:</strong> All packages redirect to our secure payment portal. You'll receive access credentials via SMS.
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section id="features" className="mb-16 md:mb-24">
            <motion.div 
              className={`rounded-2xl p-8 md:p-12 ${
                darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-[#182b5c] to-[#0f1f45] text-white'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <motion.h2 
                  className="text-2xl md:text-4xl font-bold mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Why Choose Optimas Fiber?
                </motion.h2>
                <motion.p 
                  className="text-xl text-blue-200 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  We provide the best internet experience with cutting-edge technology
                </motion.p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`text-center p-6 rounded-xl backdrop-blur-sm border hover:bg-opacity-20 transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 bg-opacity-50 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white bg-opacity-10 border-white border-opacity-20'
                    }`}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="text-[#d0b216] mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-blue-100 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Fiber Plans Section */}
          <section id="plans" className="mb-16 md:mb-24">
            <motion.div 
              className={`rounded-2xl p-6 md:p-8 ${
                darkMode ? 'bg-gray-800' : 'bg-white shadow-xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className={`text-2xl md:text-4xl font-bold text-center mb-8 ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                }`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Optimas Fiber Packages
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {plans.map((plan, index) => (
                  <DomeCard 
                    key={plan.id} 
                    plan={plan} 
                    color={colors[index]}
                    index={index}
                    onSelect={handlePlanSelect}
                    darkMode={darkMode}
                  />
                ))}
              </motion.div>
            </motion.div>
          </section>

          {/* Final CTA Section */}
          <section className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 md:p-12 ${
                darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-[#182b5c] to-[#0f1f45] text-white'
              }`}
            >
              <motion.h2 
                className="text-2xl md:text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Ready to Get Connected?
              </motion.h2>
              
              <motion.p 
                className="text-xl mb-8 max-w-2xl mx-auto text-blue-100"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                Join thousands of satisfied customers enjoying reliable, high-speed internet.
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  className={`${BUTTON_STYLES.primary.base} bg-[#d0b216] text-[#182b5c] hover:bg-[#c0a220]`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById("plans").scrollIntoView({ behavior: "smooth" })}
                >
                  View All Plans
                </motion.button>
                
                <motion.button 
                  className={`${BUTTON_STYLES.secondary.base} border-white text-white hover:bg-white hover:text-[#182b5c]`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContactClick}
                >
                  Speak to an Expert
                </motion.button>
              </div>
            </motion.div>
          </section>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showForm && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`rounded-xl shadow-xl w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className={`mr-3 text-lg ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>
                      <Wifi className="w-6 h-6" />
                    </div>
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>
                      {selectedPlan.name} - Get Connected
                    </h2>
                  </div>
                  <motion.button 
                    onClick={() => setShowForm(false)}
                    className={`transition-colors duration-300 p-2 rounded-full hover:bg-gray-200 ${
                      darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="text-xl" />
                  </motion.button>
                </div>
                
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Complete the form below and we'll create your professional invoice.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>
                      <CheckCircle className="text-green-500 mr-2 w-5 h-5" />
                      Key Features
                    </h3>
                    <ul className="space-y-3">
                      {selectedPlan.features.map((feature, index) => (
                        <motion.li 
                          key={index} 
                          className="flex items-start"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className={`w-3 h-3 rounded-full mt-1.5 mr-3 flex-shrink-0 ${darkMode ? 'bg-[#d0b216]' : 'bg-[#182b5c]'}`}></span>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>
                      <Star className="mr-2 w-5 h-5" />
                      Plan Details
                    </h3>
                    <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="mb-3">
                        <h4 className={`font-medium ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>Price</h4>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Ksh {formatPrice(selectedPlan.price)}/month</p>
                      </div>
                      <div className="mb-3">
                        <h4 className={`font-medium ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>Speed</h4>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedPlan.speed}</p>
                      </div>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>Swahili Name</h4>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{animalNames[selectedPlan.name]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {errorDetails && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6"
                  >
                    <p>{errorDetails}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#182b5c] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#182b5c] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your WhatsApp number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#182b5c] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                      <input
                        type="text"
                        name="location"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#182b5c] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter your location"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Package</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl cursor-not-allowed dark:text-white"
                        value={selectedPlan.name}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <motion.button 
                      className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light} px-8 py-3 flex items-center justify-center`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isLoading}
                    >
                      <Send size={18} className="mr-2" />
                      {isLoading ? 'Processing...' : 'Submit Order'}
                    </motion.button>
                    
                    <motion.button 
                      className={`${BUTTON_STYLES.secondary.base} ${darkMode ? BUTTON_STYLES.secondary.dark : BUTTON_STYLES.secondary.light} px-8 py-3`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleContactClick}
                    >
                      Contact Sales
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Animation */}
      <AnimatePresence>
        {showProcessing && (
          <ProcessingAnimation darkMode={darkMode} />
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <SuccessPopup
            onClose={() => setShowSuccessPopup(false)}
            onViewInvoice={handleViewInvoice}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Invoice Preview */}
      <AnimatePresence>
        {showInvoice && invoiceData && (
          <InvoicePreview
            invoiceData={invoiceData}
            onClose={() => setShowInvoice(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WifiPlans;