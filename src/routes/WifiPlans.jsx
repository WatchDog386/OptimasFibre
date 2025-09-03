import React, { useState, useEffect } from "react";
import { CheckCircle, X, Wifi, Star, ChevronDown, ChevronUp, Phone, Mail, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DomeCard = ({ plan, color, index, onSelect }) => {
  const colorMap = {
    blue: {
      bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
      button: "bg-blue-600 hover:bg-blue-700",
      gradientStart: "#2563eb",
      gradientEnd: "#1e40af"
    },
    red: {
      bg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      button: "bg-red-600 hover:bg-red-700",
      gradientStart: "#dc2626",
      gradientEnd: "#b91c1c"
    },
    goldenYellow: {
      bg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      button: "bg-yellow-600 hover:bg-yellow-700",
      gradientStart: "#d97706",
      gradientEnd: "#b45309"
    },
    goldenGreen: {
      bg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      button: "bg-green-600 hover:bg-green-700",
      gradientStart: "#059669",
      gradientEnd: "#047857"
    },
    purple: {
      bg: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      button: "bg-purple-600 hover:bg-purple-700",
      gradientStart: "#7c3aed",
      gradientEnd: "#6d28d9"
    },
    pink: {
      bg: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
      button: "bg-pink-600 hover:bg-pink-700",
      gradientStart: "#db2777",
      gradientEnd: "#be185d"
    }
  };

  const currentColor = colorMap[color];
  const gradientId = `gradient-${plan.id}`;
  
  const unsplashImages = [
    "/1.jpg",
    "/2.jpg",
    "/3.jpg",
    "/4.jpg",
    "/5.jpg",
    "/6.jpg",
  ];

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
          className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 text-sm font-bold rounded-full z-10 flex items-center shadow-md"
        >
          <Star size={14} className="mr-1 fill-current" />
          Popular
        </motion.div>
      )}
      
      {/* Image Top Section */}
      <div className="h-48 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
          className="w-full h-full relative"
        >
          <img 
            src={unsplashImages[index]}
            alt={plan.name}
            className="w-full h-full object-cover object-center"
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <div className="flex items-center">
                <Wifi size={16} className="mr-2" />
                <span className="text-sm opacity-90">{plan.speed}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Card Content with Color Background */}
      <div className="flex-grow flex flex-col" style={{ background: currentColor.bg }}>
        <div className="p-6 flex-grow">
          <ul className="mb-6 flex-grow">
            {plan.features.map((feature, idx) => (
              <motion.li 
                key={idx} 
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 + (idx * 0.1) }}
              >
                <CheckCircle className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                <span className="text-white">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        
        {/* Dome-shaped Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.8 }}
          className="relative pt-10 pb-6 px-6"
        >
          {/* Dome shape */}
          <div className="absolute -top-16 left-0 w-full h-20 flex justify-center">
            <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
              <path 
                d="M 0,0 C 20,20 80,20 100,0 L 100,20 L 0,20 Z" 
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
          
          <div className="text-center mb-4 relative z-10">
            <span className="text-2xl font-bold text-white">Ksh {plan.price}</span>
            <span className="text-white opacity-80"> /month</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(plan)}
            className={`w-full text-white py-3 rounded-xl font-semibold transition-all ${currentColor.button} shadow-md`}
          >
            BOOK NOW
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

  const plans = [
    {
      id: 1,
      name: "Basic",
      price: "1,500",
      speed: "6Mbps",
      features: ["Great for browsing", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 2,
      name: "Essential",
      price: "2,000",
      speed: "12Mbps",
      features: ["Streaming & Social Media", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 3,
      name: "Family",
      price: "2,500",
      speed: "20Mbps",
      features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 4,
      name: "Streaming",
      price: "3,000",
      speed: "30Mbps",
      features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"],
      type: "home",
      popular: true,
    },
    {
      id: 5,
      name: "Pro",
      price: "4,000",
      speed: "40Mbps",
      features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"],
      type: "home",
      popular: false,
    },
    {
      id: 6,
      name: "Premium",
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
      description: "Experience blazing fast internet with our fibre optic technology",
      icon: <Wifi size={32} />
    },
    {
      title: "24/7 Support",
      description: "Our technical team is available round the clock to assist you",
      icon: <Phone size={32} />
    },
    {
      title: "Free Installation",
      description: "Get connected without any setup fees or hidden charges",
      icon: <MapPin size={32} />
    },
    {
      title: "Reliable Connection",
      description: "99.9% uptime guarantee for uninterrupted browsing and streaming",
      icon: <CheckCircle size={32} />
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
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-200 opacity-20"
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

      {/* Header Section */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 10 }}
        className="bg-white/80 backdrop-blur-md shadow-sm py-4 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-md"
            >
              <Wifi size={24} />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Optimas Fibre</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <motion.a whileHover={{ y: -2 }} href="#plans" className="text-blue-900 hover:text-blue-700 font-medium">Plans</motion.a>
            <motion.a whileHover={{ y: -2 }} href="#features" className="text-blue-900 hover:text-blue-700 font-medium">Features</motion.a>
            <motion.a whileHover={{ y: -2 }} href="#contact" className="text-blue-900 hover:text-blue-700 font-medium">Contact</motion.a>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg hover:shadow-md font-medium"
            >
              Book Installation
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Connect To The World With Optimas Fibre
            </h2>
            <p className="text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
              Experience lightning-fast internet with our reliable fibre connections. Perfect for streaming, gaming, and working from home.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("plans").scrollIntoView({ behavior: "smooth" })}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all shadow-md"
            >
              View Our Plans
            </motion.button>
          </motion.div>
        </div>
        
        {/* Animated circles in hero */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-200 opacity-10"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-300 opacity-10"
          animate={{
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
        />
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-blue-900 mb-4">Why Choose Optimas Fibre?</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We provide the best internet experience with cutting-edge technology and exceptional customer service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 ${activeFeature === index ? 'ring-2 ring-blue-500 scale-105' : 'hover:shadow-xl'}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-blue-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-blue-900 mb-4">Optimas Fibre Packages</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Check out our speeds and plans to suit every need and budget. Installs take just 1 hour & can be booked for the next day.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-900">Get {selectedPlan?.name}</h3>
                <p className="text-gray-600">Fill out the form and we'll contact you shortly</p>
              </div>

              {messageStatus === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4"
                >
                  <p>Message sent successfully! We'll contact you shortly.</p>
                </motion.div>
              )}

              {messageStatus === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4"
                >
                  <p>Failed to send message. Please try again or contact us directly.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl cursor-not-allowed"
                      value={formData.connectionType}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl flex items-center disabled:opacity-70 font-medium"
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
                      "Send Request"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WifiPlans;