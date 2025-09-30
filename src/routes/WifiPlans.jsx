import React, { useState, useEffect, useRef, useContext } from "react";
import { CheckCircle, X, Wifi, Star, Phone, Mail, MapPin, Zap, Smartphone } from "lucide-react";
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

// Unsplash image URLs for each animal
const animalImages = {
  "Jumbo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFr-Advkxc3Hmjylf99Lscbr31AYXnazFG5HuTexJoyGcImkelkJ2UKCPzAzWu9copzjQ&usqp=CAU",
  "Buffalo": "https://media.istockphoto.com/id/1870310423/photo/portrait-of-a-buffalo-in-kruger-national-park.jpg?s=612x612&w=0&k=20&c=uZktgvgIZd5fpjhB8QpsZdBTzLeH8MbJe6-9SIf7fck=",
  "Ndovu": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "Gazzelle": "https://www.nczoo.org/sites/default/files/styles/max_650x650/public/2024-07/thomsons-gazelle-2.jpg.webp?itok=IgdtfgBb",
  "Tiger": "https://t4.ftcdn.net/jpg/02/17/63/97/360_F_217639719_SxjxC4qyRoJQJdwmWtgQrvzTUX0SF3HY.jpg",
  "Chui": "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA3L3JvYl9yYXdwaXhlbF9hX3Bob3RvX29mX2FfY2hlZXRhaF9ydW5uaW5nX2FmdGVyX2FfZ2F6ZWxsZV9zaWRlX183Mjk5Y2E5My01ZWI0LTQ2NDAtOTgzNy00NWVlMDI0ZGU0ZTctNXgtaHEtc2NhbGUtNV8wMHguanBn.jpg",
};

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

// ✅ Updated DomeCard to match Services.jsx styling
const DomeCard = ({ plan, color, index, onSelect, darkMode }) => {
  const colorMap = {
    blue: {
      bg: darkMode ? "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)" : "linear-gradient(135deg, #182b5c 0%, #0f1f45 100%)",
      button: darkMode ? BUTTON_STYLES.small.dark : BUTTON_STYLES.small.light,
      gradientStart: darkMode ? "#1e3a8a" : "#182b5c",
      gradientEnd: darkMode ? "#1e40af" : "#0f1f45"
    },
    red: {
      bg: darkMode ? "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)" : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      button: "bg-red-600 hover:bg-red-700 text-white",
      gradientStart: darkMode ? "#991b1b" : "#dc2626",
      gradientEnd: darkMode ? "#dc2626" : "#b91c1c"
    },
    goldenYellow: {
      bg: darkMode ? "linear-gradient(135deg, #92400e 0%, #d97706 100%)" : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
      gradientStart: darkMode ? "#92400e" : "#d97706",
      gradientEnd: darkMode ? "#d97706" : "#b45309"
    },
    goldenGreen: {
      bg: darkMode ? "linear-gradient(135deg, #047857 0%, #059669 100%)" : "linear-gradient(135deg, #059669 0%, #047857 100%)",
      button: "bg-green-600 hover:bg-green-700 text-white",
      gradientStart: darkMode ? "#047857" : "#059669",
      gradientEnd: darkMode ? "#059669" : "#047857"
    },
    purple: {
      bg: darkMode ? "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
      gradientStart: darkMode ? "#6d28d9" : "#7c3aed",
      gradientEnd: darkMode ? "#7c3aed" : "#6d28d9"
    },
    pink: {
      bg: darkMode ? "linear-gradient(135deg, #be185d 0%, #db2777 100%)" : "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
      button: "bg-pink-600 hover:bg-pink-700 text-white",
      gradientStart: darkMode ? "#be185d" : "#db2777",
      gradientEnd: darkMode ? "#db2777" : "#be185d"
    }
  };

  const currentColor = colorMap[color];
  const gradientId = `gradient-${plan.id}`;
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
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 text-xs font-bold rounded-full z-10 flex items-center shadow-md">
          <Star size={12} className="mr-1 fill-current" />
          Popular
        </div>
      )}

      {/* Image Top Section */}
      <div className="h-32 md:h-36 relative overflow-hidden">
        <div className="w-full h-full relative">
          <img 
            src={animalImages[plan.name]}
            alt={plan.name}
            className="w-full h-full object-cover object-center"
            style={{ 
              objectFit: "cover", 
              width: "100%", 
              height: "100%",
              margin: 0
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
            <div className="text-white">
              <h3 className="text-sm md:text-base font-semibold mb-1">{plan.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi size={12} className="mr-1" />
                  <span className="text-xs opacity-90">{plan.speed}</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {animalNames[plan.name]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content with Color Background */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-3 md:p-4 flex-grow">
          <ul className="mb-4 flex-grow">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center mb-2">
                <CheckCircle className="w-3 h-3 text-white mr-2 flex-shrink-0" />
                <span className="text-white text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="relative pt-4 pb-3 px-3 md:px-4">
          <div className="text-center mb-2 relative z-10">
            <span className="text-base md:text-lg font-bold text-white">Ksh {plan.price}</span>
            <span className="text-white opacity-80 text-xs"> /month</span>
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

// ✅ Updated MobileHotspotCard to match Services.jsx styling
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
            <span className="text-base md:text-lg font-bold text-white">Ksh {plan.price}</span>
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

const WifiPlans = () => {
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
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  // Navigation handlers
  const handleContactClick = () => {
    navigate('/contact');
  };

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
      price: "1,500",
      speed: "6Mbps",
      features: ["Great for browsing", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 2,
      name: "Buffalo",
      price: "2,000",
      speed: "12Mbps",
      features: ["Streaming & Social Media", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 3,
      name: "Ndovu",
      price: "2,500",
      speed: "20Mbps",
      features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 4,
      name: "Gazzelle",
      price: "3,000",
      speed: "30Mbps",
      features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"],
      type: "home",
      popular: true,
    },
    {
      id: 5,
      name: "Tiger",
      price: "4,000",
      speed: "40Mbps",
      features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 6,
      name: "Chui",
      price: "6,000",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData((prev) => ({
      ...prev,
      connectionType: plan.name,
    }));
    setShowForm(true);
    setMessageStatus(null);
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
    try {
      const message = `Hello! I'm interested in the ${formData.connectionType} plan.
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Location: ${formData.location}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/254741874200?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      setMessageStatus("success");
      setTimeout(() => {
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          connectionType: "",
        });
        setSelectedPlan(null);
      }, 2000);
    } catch (err) {
      setMessageStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants matching Services.jsx
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
      {/* Hero Section - Updated with GGCC-style hero integration */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#182b5c] to-[#0f1f45] z-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-30 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Experience <span className="text-[#d0b216]">Blazing Fast</span>
              <br />
              Internet
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-2xl mx-auto text-gray-200 leading-relaxed"
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
                className={`${BUTTON_STYLES.primary.base} bg-[#d0b216] text-[#182b5c] hover:bg-[#c0a220] text-base px-8 py-3`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Plans
              </motion.button>
              <motion.button 
                className={`${BUTTON_STYLES.secondary.base} border-white text-white hover:bg-white hover:text-[#182b5c] text-base px-8 py-3`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContactClick}
              >
                Get Started Today
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
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

          {/* Fiber Plans Section */}
          <section id="plans" className="mb-12 md:mb-16 relative z-10">
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
                  onClick={() => document.getElementById("plans").scrollIntoView({ behavior: "smooth" })}
                >
                  View All Plans
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
                      {selectedPlan.name}
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
                  Complete the form below and we'll contact you to set up your {selectedPlan.name} plan.
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
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Ksh {selectedPlan.price}/month</p>
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
                    <p>Message sent successfully! We'll contact you shortly.</p>
                  </motion.div>
                )}
                {messageStatus === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6"
                  >
                    <p>Failed to send message. Please try again or contact us directly.</p>
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#182b5c] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        value={formData.email}
                        onChange={handleInputChange}
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Package</label>
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
                      className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light} px-8 py-3`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Send via WhatsApp"}
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
    </motion.div>
  );
};

export default WifiPlans;