import React, { useState, useEffect } from "react";
import { CheckCircle, X, Wifi, Star, Phone, Mail, MapPin, Zap, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animal name mappings (English to Swahili)
const animalNames = {
  "Jumbo": "Ndovu", // Elephant
  "Buffalo": "Nyati", // Buffalo
  "Ndovu": "Ndovu", // Elephant
  "Gazzelle": "Swala", // Gazelle
  "Tiger": "Tiger", // Tiger (kept as Tiger since it's already English)
  "Chui": "Chui", // Leopard
};

// Unsplash image URLs for each animal
const animalImages = {
  "Jumbo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFr-Advkxc3Hmjylf99Lscbr31AYXnazFG5HuTexJoyGcImkelkJ2UKCPzAzWu9copzjQ&usqp=CAU", // Elephant
  "Buffalo": "https://media.istockphoto.com/id/1870310423/photo/portrait-of-a-buffalo-in-kruger-national-park.jpg?s=612x612&w=0&k=20&c=uZktgvgIZd5fpjhB8QpsZdBTzLeH8MbJe6-9SIf7fck=", // Buffalo
  "Ndovu": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Elephant (different angle)
  "Gazzelle": "https://www.nczoo.org/sites/default/files/styles/max_650x650/public/2024-07/thomsons-gazelle-2.jpg.webp?itok=IgdtfgBb", // Gazelle
  "Tiger": "https://t4.ftcdn.net/jpg/02/17/63/97/360_F_217639719_SxjxC4qyRoJQJdwmWtgQrvzTUX0SF3HY.jpg", // Tiger/Leopard
  "Chui": "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA3L3JvYl9yYXdwaXhlbF9hX3Bob3RvX29mX2FfY2hlZXRhaF9ydW5uaW5nX2FmdGVyX2FfZ2F6ZWxsZV9zaWRlX183Mjk5Y2E5My01ZWI0LTQ2NDAtOTgzNy00NWVlMDI0ZGU0ZTctNXgtaHEtc2NhbGUtNV8wMHguanBn.jpg", // Cheetah
};

// ✅ COMPACT BUTTON STYLES — NO ICONS, NATURAL WIDTH
const BUTTON_STYLES = {
  primary: {
    base: 'py-2 px-6 rounded-xl font-semibold transition-all text-sm whitespace-nowrap',
    light: 'bg-[#015B97] hover:bg-[#014a7a] text-white shadow-md hover:shadow-lg',
    dark: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
  },
  secondary: {
    base: 'py-2 px-6 rounded-xl font-semibold transition-all text-sm whitespace-nowrap',
    light: 'bg-white hover:bg-gray-100 text-[#015B97] border border-[#015B97]',
    dark: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600',
  },
  small: {
    base: 'py-1.5 px-4 rounded-xl font-medium transition-all text-xs whitespace-nowrap',
    light: 'bg-[#015B97] hover:bg-[#014a7a] text-white',
    dark: 'bg-blue-600 hover:bg-blue-700 text-white',
  }
};

const DomeCard = ({ plan, color, index, onSelect }) => {
  const colorMap = {
    blue: {
      bg: "linear-gradient(135deg, #015B97 0%, #014a7a 100%)",
      button: BUTTON_STYLES.small.light,
      gradientStart: "#015B97",
      gradientEnd: "#014a7a"
    },
    red: {
      bg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      button: "bg-red-600 hover:bg-red-700 text-white",
      gradientStart: "#dc2626",
      gradientEnd: "#b91c1c"
    },
    goldenYellow: {
      bg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
      gradientStart: "#d97706",
      gradientEnd: "#b45309"
    },
    goldenGreen: {
      bg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      button: "bg-green-600 hover:bg-green-700 text-white",
      gradientStart: "#059669",
      gradientEnd: "#047857"
    },
    purple: {
      bg: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
      gradientStart: "#7c3aed",
      gradientEnd: "#6d28d9"
    },
    pink: {
      bg: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
      button: "bg-pink-600 hover:bg-pink-700 text-white",
      gradientStart: "#db2777",
      gradientEnd: "#be185d"
    }
  };

  const currentColor = colorMap[color];
  const gradientId = `gradient-${plan.id}`;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: index * 0.1
        }
      }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className="rounded-2xl shadow-xl overflow-hidden relative h-full flex flex-col group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {plan.popular && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 text-xs font-bold rounded-full z-10 flex items-center shadow-md"
        >
          <Star size={12} className="mr-1 fill-current" />
          Popular
        </motion.div>
      )}

      {/* Image Top Section */}
      <motion.div 
        className="h-40 md:h-48 relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
          className="w-full h-full relative"
        >
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
            <div className="text-white">
              <h3 className="text-lg md:text-xl font-bold mb-1">{plan.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi size={14} className="mr-2" />
                  <span className="text-xs opacity-90">{plan.speed}</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {animalNames[plan.name]}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card Content with Color Background */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-4 md:p-6 flex-grow">
          <ul className="mb-6 flex-grow">
            {plan.features.map((feature, idx) => (
              <motion.li 
                key={idx} 
                className="flex items-center mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 + (idx * 0.1) }}
              >
                <CheckCircle className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                <span className="text-white text-sm">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Dome-shaped Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.8 }}
          className="relative pt-8 pb-4 px-4 md:px-6"
        >
          {/* Dome shape */}
          <div className="absolute -top-12 left-0 w-full h-16 flex justify-center">
            <svg viewBox="0 0 100 16" className="w-full h-full" preserveAspectRatio="none">
              <path 
                d="M 0,0 C 25,16 75,16 100,0 L 100,16 L 0,16 Z" 
                fill={`url(#${gradientId})`}
              />
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={currentColor.gradientStart} />
                  <stop offset="100%" stopColor={currentColor.gradientEnd} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-center mb-3 relative z-10">
            <span className="text-xl md:text-2xl font-bold text-white">Ksh {plan.price}</span>
            <span className="text-white opacity-80 text-sm"> /month</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(plan)}
            className={`${BUTTON_STYLES.small.base} ${currentColor.button} w-full`}
          >
            BOOK NOW
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const MobileHotspotCard = ({ plan, color, index, onSelect }) => {
  const colorMap = {
    teal: {
      bg: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
      button: BUTTON_STYLES.small.light,
      gradientStart: "#0d9488",
      gradientEnd: "#0f766e"
    },
    amber: {
      bg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
      gradientStart: "#d97706",
      gradientEnd: "#b45309"
    },
    violet: {
      bg: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      button: "bg-violet-600 hover:bg-violet-700 text-white",
      gradientStart: "#7c3aed",
      gradientEnd: "#6d28d9"
    },
    rose: {
      bg: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
      button: "bg-rose-600 hover:bg-rose-700 text-white",
      gradientStart: "#e11d48",
      gradientEnd: "#be123c"
    },
    emerald: {
      bg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white",
      gradientStart: "#059669",
      gradientEnd: "#047857"
    },
    blue: {
      bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      gradientStart: "#2563eb",
      gradientEnd: "#1e40af"
    }
  };

  const currentColor = colorMap[color];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: index * 0.1
        }
      }}
      whileHover={{ 
        y: -10, 
        transition: { duration: 0.2 }
      }}
      className="rounded-2xl shadow-xl overflow-hidden relative h-full flex flex-col group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {plan.popular && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 text-xs font-bold rounded-full z-10 flex items-center shadow-md"
        >
          <Star size={12} className="mr-1 fill-current" />
          Popular
        </motion.div>
      )}

      {/* Wide color header instead of image */}
      <motion.div 
        className="h-20 md:h-24 relative overflow-hidden"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        style={{ background: currentColor.bg }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-3">
          <div className="text-white w-full">
            <h3 className="text-base md:text-lg font-bold mb-1">{plan.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone size={12} className="mr-2" />
                <span className="text-xs opacity-90">{plan.devices}</span>
              </div>
              <span className="text-xs font-bold">{plan.duration}</span>
            </div>
          </div>
        </div>
        {/* Animated elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="white" opacity="0.1" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill="url(#circles)" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Card Content with Color Background */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-3 md:p-4 flex-grow">
          <div className="text-center mb-3">
            <span className="text-xl md:text-2xl font-bold text-white">Ksh {plan.price}</span>
          </div>
          <ul className="mb-4 flex-grow">
            {plan.features.map((feature, idx) => (
              <motion.li 
                key={idx} 
                className="flex items-center mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 + (idx * 0.1) }}
              >
                <CheckCircle className="w-3 h-3 text-white mr-2 flex-shrink-0" />
                <span className="text-white text-xs">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.8 }}
          className="relative pb-3 px-3 md:px-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(plan)}
            className={`${BUTTON_STYLES.small.base} ${currentColor.button} w-full text-xs md:text-sm`}
          >
            BUY NOW
          </motion.button>
        </motion.div>
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
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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
      icon: <Wifi size={28} />
    },
    {
      title: "24/7 Support",
      description: "Our technical team is available round the clock to assist you",
      icon: <Phone size={28} />
    },
    {
      title: "Free Installation",
      description: "Get connected without any setup fees or hidden charges",
      icon: <MapPin size={28} />
    },
    {
      title: "Reliable Connection",
      description: "99.9% uptime guarantee for uninterrupted browsing and streaming",
      icon: <CheckCircle size={28} />
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    // Auto-rotate features
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
    // Redirect to the specific package page
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
      // Format the WhatsApp message
      const message = `Hello! I'm interested in the ${formData.connectionType} plan.
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Location: ${formData.location}`;
      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/254741874200?text=${encodedMessage}`;
      // Redirect to WhatsApp
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-200 dark:bg-blue-800 opacity-20"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 20 - 10, 0],
              x: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-16 pb-16 md:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">
              Connect To The World With Optimas Fiber
            </h2>
            <p className="text-base md:text-lg mb-6 md:mb-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience lightning-fast internet with our reliable fiber connections. Perfect for streaming, gaming, and working from home.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("mobile-hotspot").scrollIntoView({ behavior: "smooth" })}
              className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
            >
              View Our Plans
            </motion.button>
          </motion.div>
        </div>
        {/* Animated circles in hero */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-blue-200 dark:bg-blue-800 opacity-10"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-blue-300 dark:bg-blue-700 opacity-10"
          animate={{
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
        />
      </section>

      {/* Mobile Hotspot Section */}
      <section id="mobile-hotspot" className="py-12 md:py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: `linear-gradient(135deg, ${mobileColors[i % mobileColors.length] === 'teal' ? '#0d9488' : 
                  mobileColors[i % mobileColors.length] === 'amber' ? '#d97706' :
                  mobileColors[i % mobileColors.length] === 'violet' ? '#7c3aed' :
                  mobileColors[i % mobileColors.length] === 'rose' ? '#e11d48' :
                  mobileColors[i % mobileColors.length] === 'emerald' ? '#059669' : '#2563eb'} 0%, 
                  ${mobileColors[i % mobileColors.length] === 'teal' ? '#0f766e' : 
                  mobileColors[i % mobileColors.length] === 'amber' ? '#b45309' :
                  mobileColors[i % mobileColors.length] === 'violet' ? '#6d28d9' :
                  mobileColors[i % mobileColors.length] === 'rose' ? '#be123c' :
                  mobileColors[i % mobileColors.length] === 'emerald' ? '#047857' : '#1e40af'} 100%)`
              }}
              animate={{
                y: [0, Math.random() * 20 - 10, 0],
                x: [0, Math.random() * 20 - 10, 0],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
              <Zap className="w-6 h-6 text-[#015B97] dark:text-blue-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">Mobile Hotspot Packages</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Stay connected on the go with our affordable and flexible mobile data packages.
            </p>
          </motion.div>
          {/* Mobile Plans Grid — 2 columns on mobile, 3 on tablet, 6 on desktop */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6"
          >
            {mobilePlans.map((plan, index) => (
              <MobileHotspotCard 
                key={plan.id} 
                plan={plan} 
                color={mobileColors[index]}
                index={index}
                onSelect={handleMobilePlanSelect}
              />
            ))}
          </motion.div>
          {/* Additional Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8 md:mt-12 text-center bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              <strong>Note:</strong> All packages redirect to our secure payment portal. You'll receive access credentials via SMS.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">Why Choose Optimas Fiber?</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              We provide the best internet experience with cutting-edge technology and exceptional customer service.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 ${activeFeature === index ? 'ring-2 ring-[#015B97] scale-105' : 'hover:shadow-xl'}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="text-[#015B97] dark:text-blue-400 mb-3">{feature.icon}</div>
                <h4 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiber Plans Section */}
      <section id="plans" className="py-12 md:py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">Optimas Fiber Packages</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Check out our speeds and plans to suit every need and budget. Installs take just 1 hour.
            </p>
          </motion.div>
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <DomeCard 
                key={plan.id} 
                plan={plan} 
                color={colors[index]}
                index={index}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showForm && (
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
              className="rounded-xl shadow-xl w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="mr-3 text-[#015B97] dark:text-blue-400">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <h2 className="text-base md:text-xl font-semibold text-[#015B97] dark:text-blue-400">
                      {selectedPlan?.name}
                    </h2>
                  </div>
                  <motion.button 
                    onClick={() => setShowForm(false)}
                    className="transition-colors duration-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="text-lg" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <div>
                    <h3 className="text-sm md:text-base font-medium mb-2 text-[#015B97] dark:text-blue-400 flex items-center">
                      <CheckCircle className="text-green-500 mr-2 w-4 h-4" />
                      Key Features
                    </h3>
                    <ul className="space-y-1">
                      {selectedPlan?.features.map((feature, index) => (
                        <motion.li 
                          key={index} 
                          className="flex items-start text-xs md:text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="w-2 h-2 rounded-full mt-1.5 mr-2 bg-[#015B97] dark:bg-blue-400 flex-shrink-0"></span>
                          <span className="dark:text-gray-300">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm md:text-base font-medium mb-2 text-[#015B97] dark:text-blue-400 flex items-center">
                      <Star className="mr-2 w-4 h-4" />
                      Plan Details
                    </h3>
                    <div className="rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                      <div className="mb-2">
                        <h4 className="font-medium text-xs md:text-sm text-[#015B97] dark:text-blue-400">Price</h4>
                        <p className="dark:text-gray-300 text-xs md:text-sm">Ksh {selectedPlan?.price}/month</p>
                      </div>
                      <div className="mb-2">
                        <h4 className="font-medium text-xs md:text-sm text-[#015B97] dark:text-blue-400">Speed</h4>
                        <p className="dark:text-gray-300 text-xs md:text-sm">{selectedPlan?.speed}</p>
                      </div>
                      <div className="mb-2">
                        <h4 className="font-medium text-xs md:text-sm text-[#015B97] dark:text-blue-400">Swahili Name</h4>
                        <p className="dark:text-gray-300 text-xs md:text-sm">{animalNames[selectedPlan?.name]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {messageStatus === "success" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl mb-4 text-sm"
                  >
                    <p>Message sent successfully! We'll contact you shortly.</p>
                  </motion.div>
                )}
                {messageStatus === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 text-sm"
                  >
                    <p>Failed to send message. Please try again or contact us directly.</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015B97] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015B97] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015B97] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                      <input
                        type="text"
                        name="location"
                        required
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015B97] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl cursor-not-allowed dark:text-white text-sm"
                        value={formData.connectionType}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isLoading}
                      className={`${BUTTON_STYLES.small.base} ${BUTTON_STYLES.small.light} flex items-center justify-center`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Send via WhatsApp"
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WifiPlans;