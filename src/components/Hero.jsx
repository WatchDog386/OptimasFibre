// WifiPlans.jsx — FINAL FRONTEND VERSION (Numeric Price Fix Applied)
import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { CheckCircle, X, Wifi, Star, Phone, Mail, MapPin, Zap, Smartphone, Download, Send } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

// Utility function to clean and parse price (used for display and submission)
const parsePrice = (price) => {
    const cleanStr = price ? price.toString().replace(/,/g, '') : '0';
    return parseInt(cleanStr, 10);
};

// Utility function to format price for display (add commas)
const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    const num = parsePrice(price);
    return isNaN(num) ? price : num.toLocaleString();
};


// Animal name mappings (English to Swahili)
const animalNames = {
  "Jumbo": "Ndovu",
  "Buffalo": "Nyati", 
  "Ndovu": "Ndovu",
  "Gazzelle": "Swala",
  "Tiger": "Tiger",
  "Chui": "Chui",
};

// Unsplash image URLs for each animal
const animalImages = {
  "Jumbo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFr-Advkxc3Hmjylf99Lscbr31AYXnazFG5HuTexJoyGcImkelkJ2UKCPzAzWu9copzjQ&usqp=CAU",
  "Buffalo": "https://media.istockphoto.com/id/1870310423/photo/portrait-of-a-buffalo-in-kruger-national-park.jpg?s=612x612&w=0&k=20&c=uZktgvgIZd5fpjhB8QpsZdBTzLeH8MbJe6-9SIf7fck=",
  "Ndovu": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Gazzelle": "https://www.nczoo.org/sites/default/files/styles/max_650x650/public/2024-07/thomsons-gazelle-2.jpg.webp?itok=IgdtfgBb",
  "Tiger": "https://t4.ftcdn.net/jpg/02/17/63/97/360_F_217639719_SxjxC4qyRoJQJdwmWtgQrvzTUX0SF3HY.jpg",
  "Chui": "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA3L3JvYl9yYXdwaXhlbF9hX3Bob3RvX29mX2FfY2hlZXRhaF9ydW5uaW5nX2FmdGVyX2FfZ2F6ZWxsZV9zaWRlX183Mjk5Y2E5My01ZWI0LTQ2NDAtOTgzNy00NWVlMDI0ZGU0ZTctNXgtaHEtc2NhbGUtNV8wMHguanBn.jpg",
};

// Background images for hero section
const heroBackgrounds = [
  '/images/net.jpg',
  '/images/optic.jpeg',
  '/images/net.jpg'
];

// ✅ UPDATED BUTTON STYLES — MATCHES SERVICES.JSX
const BUTTON_STYLES = {
  primary: {
    base: 'py-2 px-6 rounded-full transition-colors duration-300 font-medium text-sm whitespace-nowrap',
    dark: 'bg-[#182b5c] hover:bg-[#0f1f45] text-white',
    light: 'bg-[#182b5c] hover:bg-[#0f1f45] text-white',
  },
  secondary: {
    base: 'py-2 px-6 rounded-full transition-colors duration-300 font-medium text-sm whitespace-nowrap',
    dark: 'border border-gray-600 text-gray-300 hover:border-[#182b5c] hover:text-[#182b5c]',
    light: 'border border-[#182b5c] text-[#182b5c] hover:bg-[#182b5c] hover:text-white',
  },
  small: {
    base: 'py-1.5 px-4 rounded-full font-medium transition-all text-xs whitespace-nowrap',
    light: 'bg-[#182b5c] hover:bg-[#0f1f45] text-white',
    dark: 'bg-[#182b5c] hover:bg-[#0f1f45] text-white',
  }
};

// ✅ Updated DomeCard (FIBER)
const DomeCard = ({ plan, color, index, onSelect, darkMode }) => {
  const colorMap = {
    blue: {
      bg: darkMode ? "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)" : "linear-gradient(135deg, #182b5c 0%, #0f1f45 100%)",
      button: darkMode ? BUTTON_STYLES.small.dark : BUTTON_STYLES.small.light,
    },
    red: {
      bg: darkMode ? "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)" : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    goldenYellow: {
      bg: darkMode ? "linear-gradient(135deg, #92400e 0%, #d97706 100%)" : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    goldenGreen: {
      bg: darkMode ? "linear-gradient(135deg, #047857 0%, #059669 100%)" : "linear-gradient(135deg, #059669 0%, #047857 100%)",
      button: "bg-green-600 hover:bg-green-700 text-white",
    },
    purple: {
      bg: darkMode ? "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    pink: {
      bg: darkMode ? "linear-gradient(135deg, #be185d 0%, #db2777 100%)" : "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
      button: "bg-pink-600 hover:bg-pink-700 text-white",
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
      className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative h-full flex flex-col group ${
        darkMode ? 'border border-gray-700' : 'border border-gray-200'
      }`}
      whileHover={{ y: -3 }}
    >
      {plan.popular && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 text-xs font-bold rounded-full z-10 flex items-center shadow-md">
          <Star size={12} className="mr-1 fill-current" />
          Popular
        </div>
      )}
      {/* Wide color header - Matching hotspot card height */}
      <div className="h-16 md:h-20 relative overflow-hidden" style={{ background: currentColor.bg }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-2">
          <div className="text-white w-full">
            <h3 className="text-sm font-semibold mb-1">{plan.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wifi size={10} className="mr-1" />
                <span className="text-xs opacity-90">{plan.speed}</span>
              </div>
              <span className="text-xs font-bold">{animalNames[plan.name]}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Card Content */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-3 flex-grow">
          <div className="text-center mb-2">
            {/* Use formatPrice utility here */}
            <span className="text-base md:text-lg font-bold text-white">Ksh {formatPrice(plan.price)}</span>
            <span className="text-white opacity-80 text-xs"> /month</span>
          </div>
          <ul className="mb-3 flex-grow">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center mb-1">
                <CheckCircle className="w-3 h-3 text-white mr-2 flex-shrink-0" />
                <span className="text-white text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative pb-3 px-3">
          <motion.button
            onClick={() => onSelect(plan)}
            className={`${BUTTON_STYLES.small.base} ${currentColor.button} w-full text-xs`}
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

// ✅ Updated MobileHotspotCard (MOBILE)
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
      className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative h-full flex flex-col group ${
        darkMode ? 'border border-gray-700' : 'border border-gray-200'
      }`}
      whileHover={{ y: -3 }}
    >
      {plan.popular && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 text-xs font-bold rounded-full z-10 flex items-center shadow-md">
          <Star size={12} className="mr-1 fill-current" />
          Popular
        </div>
      )}
      {/* Wide color header */}
      <div className="h-16 md:h-20 relative overflow-hidden" style={{ background: currentColor.bg }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-2">
          <div className="text-white w-full">
            <h3 className="text-sm font-semibold mb-1">{plan.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone size={10} className="mr-1" />
                <span className="text-xs opacity-90">{plan.devices}</span>
              </div>
              <span className="text-xs font-bold">{plan.duration}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Card Content */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-3 flex-grow">
          <div className="text-center mb-2">
            <span className="text-base md:text-lg font-bold text-white">Ksh {formatPrice(plan.price)}</span>
          </div>
          <ul className="mb-3 flex-grow">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center mb-1">
                <CheckCircle className="w-3 h-3 text-white mr-2 flex-shrink-0" />
                <span className="text-white text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative pb-3 px-3">
          <motion.button
            onClick={() => onSelect(plan)}
            className={`${BUTTON_STYLES.small.base} ${currentColor.button} w-full text-xs`}
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

// ✅ MAIN COMPONENT — RENAMED TO WifiPlans
const WifiPlans = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // WiFi Plans State
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    connectionType: "",
  });
  const [messageStatus, setMessageStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  // Background rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    } else if (isRightSwipe && swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  // WiFi Plans Data
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

  const plans = [
    {
      id: 1,
      name: "Jumbo",
      price: "1,499",
      speed: "8Mbps",
      features: ["Great for browsing", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 2,
      name: "Buffalo",
      price: "1,999",
      speed: "15Mbps",
      features: ["Streaming & Social Media", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 3,
      name: "Ndovu",
      price: "2,499",
      speed: "25Mbps",
      features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 4,
      name: "Gazzelle",
      price: "2,999",
      speed: "30Mbps",
      features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"],
      type: "home",
      popular: true,
    },
    {
      id: 5,
      name: "Tiger",
      price: "3,999",
      speed: "40Mbps",
      features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 6,
      name: "Chui",
      price: "4,999",
      speed: "60Mbps",
      features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
  ];

  const colors = ["blue", "red", "goldenYellow", "goldenGreen", "purple", "pink"];

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

  // WiFi Plans Handlers
  const handleContactClick = () => {
    navigate('/contact');
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData((prev) => ({
      ...prev,
      connectionType: plan.name,
    }));
    setShowForm(true);
    setMessageStatus(null);
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

  // ✅ CRITICAL FIX IN handleSubmit: Ensure planPrice is a Number
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessageStatus(null);
    setErrorDetails("");

    try {
        // 1. Parse Price to Integer for Backend Safety
        const planPriceNum = parsePrice(selectedPlan.price);
        
        if (isNaN(planPriceNum) || planPriceNum <= 0) {
            throw new Error(`Client-side Error: Invalid numeric price detected: ${selectedPlan.price}`);
        }
        
      const invoicePayload = {
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        customerLocation: formData.location.trim(),
        planName: selectedPlan.name,
        planPrice: planPriceNum, // 🔑 FIXED: Sent as a NUMBER
        planSpeed: selectedPlan.speed,
        features: selectedPlan.features,
        connectionType: formData.connectionType
      };

      console.log('📤 Sending invoice payload:', invoicePayload);

      // 2. Use VITE_API_BASE_URL with fallback
      const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com').trim();
      if (!API_URL) {
        throw new Error('VITE_API_BASE_URL is not configured in .env');
      }

      console.log('🌐 Using API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          // Prioritize the message sent back from the server (often the validation error details)
          errorMsg = errorJson.message || errorJson.error || errorMsg;
          if (errorJson.details) {
            errorMsg += ` - Details: ${JSON.stringify(errorJson.details)}`;
          }
        } catch (e) {
          const text = await response.text();
          if (text) errorMsg = text;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (result.success) {
        setInvoiceData(result.invoice);
        setMessageStatus("success");
        setTimeout(() => {
          setShowInvoice(true);
          setShowForm(false);
        }, 2000);
      } else {
        setMessageStatus("error");
        setErrorDetails(result.message || 'Unknown server error');
      }
    } catch (err) {
      console.error('❌ Invoice creation failed:', err);
      setMessageStatus("error");

      let message = err.message || 'Network error';

      // 🔍 Improve user-facing error
      if (err.message?.includes('CORS') || err.message?.includes('fetch')) {
        message = 'Connection error: Backend is inaccessible or has a configuration issue (CORS).';
      } else if (err.message?.includes('NetworkError') || err.message?.includes('load')) {
        message = 'Cannot reach the server. Check your internet or if the backend is running.';
      } else if (err.message?.includes('Validation error')) {
        message = `Server Validation Failed. Ensure all fields are filled correctly. Details: ${err.message.split(' - Details:')[0].trim()}`;
      }

      setErrorDetails(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Invoice Preview Component (content omitted for brevity, logic preserved)
  const InvoicePreview = () => {
    if (!invoiceData) return null;
    const handlePrint = () => {
      const invoiceContent = document.getElementById('invoice-content');
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = invoiceContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    };
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={() => setShowInvoice(false)}
      >
        <motion.div
          className={`rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hidden print version */}
          <div id="invoice-content" className="hidden">
            <div className="p-8 bg-white text-gray-900">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center">
                  <img 
                    src="/oppo.jpg" 
                    alt="Optimas Fiber" 
                    className="h-16 w-16 mr-4 rounded-lg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-[#182b5c]">OPTIMAS FIBER</h1>
                    <p className="text-gray-600 text-lg">High-Speed Internet Solutions</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-[#d0b216]">INVOICE</h2>
                  <p className="text-gray-600 text-lg">#{invoiceData.invoiceNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#182b5c]">Bill To:</h3>
                  <p className="font-medium text-lg">{invoiceData.customerName}</p>
                  <p className="text-gray-700">{invoiceData.customerEmail}</p>
                  <p className="text-gray-700">{invoiceData.customerPhone}</p>
                  <p className="text-gray-700">{invoiceData.customerLocation}</p>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <p className="text-lg"><strong>Invoice Date:</strong> {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
                    <p className="text-lg"><strong>Due Date:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-lg">
                    <CheckCircle size={20} className="mr-2" />
                    {invoiceData.status}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-300 mb-6">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-lg">Description</th>
                      <th className="text-left p-4 font-semibold text-lg">Details</th>
                      <th className="text-right p-4 font-semibold text-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-300">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-lg">{invoiceData.planName} Plan</p>
                          <p className="text-gray-700">{invoiceData.connectionType}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-lg">Speed: {invoiceData.planSpeed}</p>
                        <p className="text-gray-700">Monthly Subscription</p>
                      </td>
                      <td className="p-4 text-right font-semibold text-lg">
                        Ksh {formatPrice(invoiceData.planPrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mb-8">
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#182b5c]">
                    Total: Ksh {formatPrice(invoiceData.planPrice)}
                  </div>
                  <p className="text-gray-700 text-lg">Per month</p>
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-[#182b5c]">Features Included:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {invoiceData.features && invoiceData.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="text-xl font-semibold mb-4 text-[#182b5c]">Payment Instructions:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-lg font-semibold">Bank Transfer:</p>
                    <p className="text-gray-700 text-lg">Bank: Equity Bank</p>
                    <p className="text-gray-700 text-lg">Account Name: Optimas Fiber Ltd</p>
                    <p className="text-gray-700 text-lg">Account Number: 1234567890</p>
                    <p className="text-gray-700 text-lg">Branch: Nairobi Main</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Mobile Money:</p>
                    <p className="text-gray-700 text-lg">Paybill: 123456</p>
                    <p className="text-gray-700 text-lg">Account: {invoiceData.invoiceNumber}</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8 pt-6 border-t border-gray-300 text-gray-600">
                <p className="text-lg">Thank you for choosing Optimas Fiber!</p>
                <p className="text-lg">For any queries, contact us at: support@optimasfiber.co.ke | +254 741 874 200</p>
              </div>
            </div>
          </div>

          {/* Visible UI */}
          <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-t-xl`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <img 
                  src="/oppo.jpg" 
                  alt="Optimas Fiber" 
                  className="h-12 w-12 mr-4 rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-[#182b5c]">OPTIMAS FIBER</h1>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High-Speed Internet Solutions</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-[#d0b216]">INVOICE</h2>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>#{invoiceData.invoiceNumber}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>Bill To:</h3>
                <p className="font-medium">{invoiceData.customerName}</p>
                <p>{invoiceData.customerEmail}</p>
                <p>{invoiceData.customerPhone}</p>
                <p>{invoiceData.customerLocation}</p>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <p><strong>Invoice Date:</strong> {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
                  <p><strong>Due Date:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                  <CheckCircle size={16} className="mr-2" />
                  {invoiceData.status}
                </div>
              </div>
            </div>
            <div className={`rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'} mb-6`}>
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="text-left p-4 font-semibold">Description</th>
                    <th className="text-left p-4 font-semibold">Details</th>
                    <th className="text-right p-4 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={darkMode ? 'border-gray-600' : 'border-gray-200'}>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{invoiceData.planName} Plan</p>
                        <p className="text-sm opacity-75">{invoiceData.connectionType}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p>Speed: {invoiceData.planSpeed}</p>
                      <p className="text-sm opacity-75">Monthly Subscription</p>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      Ksh {formatPrice(invoiceData.planPrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mb-8">
              <div className="text-right">
                <div className={`text-2xl font-bold ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>
                  Total: Ksh {formatPrice(invoiceData.planPrice)}
                </div>
                <p className="text-sm opacity-75">Per month</p>
              </div>
            </div>
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>Features Included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {invoiceData.features && invoiceData.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'}`}>Payment Instructions:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Bank Transfer:</strong></p>
                  <p>Bank: Equity Bank</p>
                  <p>Account Name: Optimas Fiber Ltd</p>
                  <p>Account Number: 1234567890</p>
                  <p>Branch: Nairobi Main</p>
                </div>
                <div>
                  <p><strong>Mobile Money:</strong></p>
                  <p>Paybill: 123456</p>
                  <p>Account: {invoiceData.invoiceNumber}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <motion.button
                className={`flex items-center px-6 py-3 rounded-full transition-colors ${
                  darkMode 
                    ? 'bg-[#d0b216] text-[#182b5c] hover:bg-[#c0a220]' 
                    : 'bg-[#182b5c] text-white hover:bg-[#0f1f45]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
              >
                <Download size={18} className="mr-2" />
                Download PDF
              </motion.button>
              <motion.button
                className={`flex items-center px-6 py-3 rounded-full border transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:border-[#d0b216] hover:text-[#d0b216]' 
                    : 'border-[#182b5c] text-[#182b5c] hover:bg-[#182b5c] hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInvoice(false)}
              >
                <Send size={18} className="mr-2" />
                Close Invoice
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

  const heroSlides = [
    {
      image: "/optic.jpeg",
      title: "High-Speed Fibre Solutions",
      description: "Experience lightning-fast internet connectivity with our premium fibre optic network, designed for reliability and performance.",
      buttonText: "GET CONNECTED",
      buttonAction: () => navigate('/coverage'),
      overlayGradient: "linear-gradient(135deg, rgba(24, 43, 92, 0.85) 0%, rgba(24, 43, 92, 0.7) 100%)"
    },
    {
      image: "/optic.jpeg",
      title: "Affordable Pricing Plans",
      description: "Get top-quality fibre internet services at competitive rates with flexible packages for homes and businesses.",
      buttonText: "VIEW PLANS",
      buttonAction: () => document.getElementById("wifi-packages").scrollIntoView({ behavior: "smooth" }),
      overlayGradient: "linear-gradient(135deg, rgba(24, 43, 92, 0.85) 0%, rgba(24, 43, 92, 0.7) 100%)"
    },
    {
      image: "/optic.jpeg",
      title: "24/7 Customer Support",
      description: "Our dedicated team provides round-the-clock support to ensure seamless connectivity and quick issue resolution.",
      buttonText: "CONTACT US",
      buttonAction: () => navigate('/contact'),
      overlayGradient: "linear-gradient(135deg, rgba(24, 43, 92, 0.85) 0%, rgba(24, 43, 92, 0.7) 100%)"
    }
  ];

  const textVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.4
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 25px rgba(208, 178, 22, 0.4)",
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Hero Slider Section */}
      <section 
        className="hero p-0 relative w-full overflow-hidden"
        style={{ 
          fontFamily: "'Poppins', sans-serif",
          height: isMobile ? '60vh' : '90vh'
        }}
      >
        {/* Background Images with Slideshow */}
        <div className="absolute inset-0 z-0">
          {heroBackgrounds.map((bg, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${bg})`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentBgIndex === index ? 1 : 0 }}
              transition={{ duration: 1.5 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#182b5c]/80 to-[#0f1f45]/80 z-10"></div>
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-20"></div>
        </div>

        {/* Floating WhatsApp Button */}
        <motion.a
          href="https://wa.me/254741874200"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.1, boxShadow: "0 6px 20px rgba(37, 211, 102, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            width: isMobile ? '40px' : '56px',
            height: isMobile ? '40px' : '56px',
            bottom: isMobile ? '16px' : '32px',
            right: isMobile ? '16px' : '32px',
            backgroundColor: '#25d366',
            color: '#FFF',
            borderRadius: '50%',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <FaWhatsapp style={{ fontSize: isMobile ? '20px' : '28px', color: 'white' }} />
        </motion.a>

        {!isMobile && (
          <motion.div
            className="chat-text"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            style={{
              position: 'fixed',
              bottom: '48px',
              right: '100px',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '500',
              zIndex: 1000,
              backdropFilter: 'blur(5px)',
            }}
          >
            Chat with us
          </motion.div>
        )}

        {/* Swiper hero */}
        <Swiper
          ref={swiperRef}
          modules={[Autoplay, Pagination, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ 
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          effect="fade"
          speed={1200}
          loop={true}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
            renderBullet: (index, className) => {
              return `<span class="${className} custom-bullet">
                <span class="bullet-progress"></span>
              </span>`;
            }
          }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
          className="slider-container full-slider w-full h-full"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index} className="slide-center slider-item w-full h-full relative">
              <motion.div 
                className="slider-image full-image w-full h-full absolute top-0 left-0"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              />
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: slide.overlayGradient
                }}
              />
              <div 
                className={`absolute top-0 right-0 rounded-full bg-[#d0b216] opacity-10`}
                style={{
                  width: isMobile ? '80px' : '192px',
                  height: isMobile ? '80px' : '192px',
                  marginTop: isMobile ? '-40px' : '-80px',
                  marginRight: isMobile ? '16px' : '64px',
                }}
              ></div>
              <div 
                className={`absolute bottom-0 left-0 rounded-full bg-[#d0b216] opacity-10`}
                style={{
                  width: isMobile ? '80px' : '192px',
                  height: isMobile ? '80px' : '192px',
                  marginBottom: isMobile ? '-40px' : '-80px',
                  marginLeft: isMobile ? '16px' : '64px',
                }}
              ></div>
              <div className="slide-content row absolute inset-0 w-full h-full flex items-center justify-center z-10 px-4">
                <motion.div 
                  className="slider-outline center text-center"
                  style={{ 
                    maxWidth: isMobile ? '92%' : '800px',
                    width: '100%'
                  }}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.2
                      }
                    }
                  }}
                >
                  <motion.h1 
                    className="title effect-static-text mb-2"
                    variants={textVariants}
                    style={{
                      color: '#ffffff',
                      fontSize: isMobile ? '1.375rem' : '2.5rem',
                      fontWeight: '700',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      lineHeight: isMobile ? '1.3' : '1.2'
                    }}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    className="description mb-3"
                    variants={textVariants}
                    style={{
                      color: '#ffffff',
                      fontSize: isMobile ? '0.75rem' : '1.125rem',
                      maxWidth: isMobile ? '100%' : '600px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      lineHeight: isMobile ? '1.45' : '1.6',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {slide.description}
                  </motion.p>
                  <motion.div
                    className="buttons"
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="d-sm-inline-flex justify-content-center">
                      <motion.button
                        onClick={slide.buttonAction}
                        className="mx-auto btn primary-button"
                        variants={buttonVariants}
                        whileHover="hover"
                        style={{
                          backgroundColor: '#d0b216',
                          border: 'none',
                          color: '#182B5C',
                          padding: isMobile ? '8px 20px' : '14px 36px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: isMobile ? '0.875rem' : '1rem',
                          cursor: 'pointer',
                          letterSpacing: '0.5px',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {slide.buttonText}
                        <motion.span 
                          className="absolute inset-0 bg-white"
                          style={{ 
                            opacity: 0,
                            borderRadius: '8px'
                          }}
                          whileHover={{
                            opacity: 0.2,
                            transition: { duration: 0.3 }
                          }}
                        />
                      </motion.button>
                  </div>
                  </motion.div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
          <div 
            className="swiper-pagination slider-pagination" 
            style={{ 
              bottom: isMobile ? '14px' : '28px',
              zIndex: 10
            }} 
          />
        </Swiper>

        <style>{`
          .hero {
            position: relative;
            overflow: hidden;
          }
          .slider-item {
            position: relative;
          }
          .slider-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
          .slide-content {
            position: relative;
            z-index: 2;
          }
          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 1;
            margin: 0 3px;
            position: relative;
            overflow: hidden;
            border-radius: 6px;
          }
          .swiper-pagination-bullet-active {
            background: transparent;
            width: 18px;
          }
          .swiper-pagination-bullet-active .bullet-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: #d0b216;
            border-radius: 6px;
            animation: progress 5s linear;
          }
          @keyframes progress {
            0% {
              width: 0%;
            }
            100% {
              width: 100%;
            }
          }
          @media screen and (max-width: 768px) {
            .whatsapp-float {
              width: 40px;
              height: 40px;
              bottom: 16px;
              right: 16px;
            }
            .whatsapp-float svg {
              font-size: 20px;
            }
            .chat-text {
              display: none;
            }
          }
        `}</style>
      </section>

      {/* Rest of content — Fiber, Mobile, CTA — unchanged */}
      <div className="relative -mt-20 md:-mt-32 z-20">
        <div className="container mx-auto px-4">
          {/* Fiber Plans Section */}
          <section id="wifi-packages" className="mb-12 md:mb-16 relative z-10">
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
                className={`text-xl md:text-3xl font-semibold text-center mb-6 md:mb-8 ${
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
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6"
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

          {/* Features Section */}
          <section id="features" className="mb-12 md:mb-16 relative z-10">
            <motion.div 
              className={`rounded-2xl p-6 md:p-8 ${
                darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-[#182b5c] to-[#0f1f45]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-8">
                <motion.h2 
                  className="text-xl md:text-3xl font-semibold mb-4 text-white"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Why Choose Optimas Fiber?
                </motion.h2>
                <motion.p 
                  className="text-lg text-blue-200 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  We provide the best internet experience with cutting-edge technology
                </motion.p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Mobile Hotspot Section */}
          <section id="mobile-hotspot" className="mb-12 md:mb-16 relative z-10">
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
                className={`text-xl md:text-3xl font-semibold text-center mb-6 md:mb-8 ${
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
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6"
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
                <p className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <strong>Note:</strong> All packages redirect to our secure payment portal. You'll receive access credentials via SMS.
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* Final CTA Section */}
          <section className="text-center relative z-10">
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
                className="text-2xl md:text-4xl font-semibold mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Ready to Get Connected?
              </motion.h2>
              <motion.p 
                className="text-lg mb-8 max-w-2xl mx-auto text-blue-100"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                Join thousands of satisfied customers enjoying reliable, high-speed internet.
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  className={`${BUTTON_STYLES.primary.base} bg-[#d0b216] text-[#182b5c] hover:bg-[#c0a220] px-8 py-3 text-base`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById("wifi-packages").scrollIntoView({ behavior: "smooth" })}
                >
                  View WiFi Packages
                </motion.button>
                <motion.button 
                  className={`${BUTTON_STYLES.secondary.base} border-white text-white hover:bg-white hover:text-[#182b5c] px-8 py-3 text-base`}
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

      {/* Modals — unchanged */}
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
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className={`mr-3 text-lg ${
                      darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                    }`}>
                      <Wifi className="w-6 h-6" />
                    </div>
                    <h2 className={`text-xl font-semibold ${
                      darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                    }`}>
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
                <p className={`text-sm mb-6 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Complete the form below and we'll send your professional invoice via WhatsApp and Email.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className={`text-lg font-medium mb-4 flex items-center ${
                      darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                    }`}>
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
                          <span className={`w-3 h-3 rounded-full mt-1.5 mr-3 flex-shrink-0 ${
                            darkMode ? 'bg-[#d0b216]' : 'bg-[#182b5c]'
                          }`}></span>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                        </motion.li>
                      ))}
                  </ul>
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-4 flex items-center ${
                      darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                    }`}>
                      <Star className="mr-2 w-5 h-5" />
                      Plan Details
                    </h3>
                    <div className={`rounded-lg p-4 ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="mb-3">
                        <h4 className={`font-medium ${
                          darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                        }`}>Price</h4>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Ksh {formatPrice(selectedPlan.price)}/month</p>
                      </div>
                      <div className="mb-3">
                        <h4 className={`font-medium ${
                          darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                        }`}>Speed</h4>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedPlan.speed}</p>
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          darkMode ? 'text-[#d0b216]' : 'text-[#182b5c]'
                        }`}>Swahili Name</h4>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{animalNames[selectedPlan.name]}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {messageStatus === "success" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl mb-6"
                  >
                    <p>Invoice created successfully! Sending to your WhatsApp and Email...</p>
                  </motion.div>
                )}
                {messageStatus === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6"
                  >
                    <p>Failed to create invoice. {errorDetails && `Error: ${errorDetails}`}</p>
                    <p className="text-sm mt-1">Please try again or contact us directly.</p>
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
                        value={formData.connectionType}
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
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Invoice...
                        </>
                      ) : (
                        <>
                          <Send size={18} className="mr-2" />
                          Generate & Send Invoice
                        </>
                      )}
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

      <AnimatePresence>
        {showInvoice && <InvoicePreview />}
      </AnimatePresence>
    </motion.div>
  );
};

export default WifiPlans;