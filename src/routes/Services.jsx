import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaNetworkWired,
  FaWifi,
  FaUserShield,
  FaServer,
  FaHome,
  FaBuilding,
  FaTools,
  FaHeadset,
  FaChartLine,
  FaShieldAlt,
  FaCogs,
  FaBroadcastTower,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaShieldVirus,
  FaRocket,
  FaInfinity,
  FaArrowRight
} from 'react-icons/fa';
// import { ThemeContext } from '../contexts/ThemeContext'; // REMOVED

const Services = () => {
  const [activeTab, setActiveTab] = useState('residential');
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  // const { darkMode } = useContext(ThemeContext); // REMOVED

  // Navigation handlers
  const handleCoverageClick = () => {
    navigate('/coverage');
  };
  const handleGetStartedClick = () => {
    navigate('/wifi-plans');
  };
  const handleContactClick = () => {
    navigate('/contact');
  };

  const servicesData = {
    residential: [
      {
        id: 1,
        icon: <FaHome className="text-lg md:text-xl" />,
        title: "Home Fiber Internet",
        description: "Blazing-fast fiber internet for your home with unlimited data, perfect for streaming, gaming, and remote work.",
        features: ["Up to 1Gbps speeds", "Unlimited data", "Free installation", "24/7 support"],
        details: {
          pricing: "From $49.99/month",
          speedTiers: ["100Mbps", "300Mbps", "600Mbps", "1Gbps"],
          equipment: "Advanced Wi-Fi 6 router included",
          contract: "No long-term contract required",
          benefits: [
            "Buffer-free 4K streaming",
            "Lag-free online gaming",
            "Seamless video conferencing",
            "Connect 50+ devices simultaneously"
          ]
        }
      },
      {
        id: 2,
        icon: <FaWifi className="text-lg md:text-xl" />,
        title: "Whole Home WiFi",
        description: "Seamless WiFi coverage throughout your home with our advanced mesh network systems.",
        features: ["Whole home coverage", "Multiple devices", "Parental controls", "Guest network"],
        details: {
          pricing: "From $9.99/month (equipment rental) or $199 one-time purchase",
          coverage: "Up to 5,000 sq ft with base system",
          nodes: "Expandable with additional nodes",
          security: "Built-in network security",
          management: "Easy app-based network management",
          benefits: [
            "Seamless roaming between access points",
            "Band steering for optimal performance",
            "Device prioritization settings",
            "Usage statistics and insights"
          ]
        }
      },
      {
        id: 3,
        icon: <FaUserShield className="text-lg md:text-xl" />,
        title: "Home Security Bundle",
        description: "Internet plus security solutions to keep your home and family protected online.",
        features: ["VPN included", "Malware protection", "Smart home ready", "Family safety"],
        details: {
          pricing: "From $14.99/month added to internet plan",
          protection: "Real-time threat detection and blocking",
          privacy: "Secure VPN for all devices",
          parental: "Advanced parental controls with scheduling",
          smartHome: "Dedicated IoT network for smart devices",
          benefits: [
            "Ad blocking across your network",
            "Social media monitoring for kids",
            "Data breach alerts",
            "Identity theft protection"
          ]
        }
      }
    ],
    business: [
      {
        id: 1,
        icon: <FaBuilding className="text-lg md:text-xl" />,
        title: "Business Fiber",
        description: "Dedicated fiber connections for businesses with guaranteed uptime and symmetrical speeds.",
        features: ["SLA guaranteed", "Symmetrical speeds", "Static IP options", "Priority support"],
        details: {
          pricing: "Custom pricing based on requirements",
          speedTiers: ["100Mbps", "500Mbps", "1Gbps", "10Gbps"],
          sla: "99.9% uptime guarantee",
          support: "24/7 dedicated business support",
          staticIPs: "Options for 1, 5, or 13 static IP addresses",
          benefits: [
            "No data caps or throttling",
            "Business-grade hardware included",
            "Advanced network monitoring",
            "Professional installation"
          ]
        }
      },
      {
        id: 2,
        icon: <FaServer className="text-lg md:text-xl" />,
        title: "Managed Services",
        description: "Complete IT solutions including network management, cloud services, and security.",
        features: ["24/7 monitoring", "Proactive maintenance", "Cloud integration", "Security management"],
        details: {
          pricing: "Custom packages starting at $299/month",
          monitoring: "24/7 network monitoring and alerting",
          maintenance: "Proactive patches and updates",
          backup: "Cloud backup solutions",
          security: "Enterprise-grade firewall and security",
          benefits: [
            "Dedicated account manager",
            "Regular performance reports",
            "On-demand IT support",
            "Hardware lifecycle management"
          ]
        }
      },
      {
        id: 3,
        icon: <FaChartLine className="text-lg md:text-xl" />,
        title: "SD-WAN Solutions",
        description: "Advanced software-defined networking for multi-location business connectivity.",
        features: ["Multi-site management", "Traffic optimization", "Cost reduction", "Enhanced security"],
        details: {
          pricing: "From $99/month per location",
          management: "Centralized cloud-based management",
          optimization: "Application-aware routing",
          resilience: "Automatic failover between connections",
          security: "Integrated security with zero-trust architecture",
          benefits: [
            "Real-time network analytics",
            "Bandwidth aggregation",
            "Quality of Service (QoS) controls",
            "Simplified branch deployments"
          ]
        }
      }
    ],
    enterprise: [
      {
        id: 1,
        icon: <FaNetworkWired className="text-lg md:text-xl" />,
        title: "Enterprise Fiber",
        description: "Carrier-grade fiber solutions for large enterprises with mission-critical requirements.",
        features: ["99.99% uptime", "Dedicated bandwidth", "24/7 NOC support", "Custom solutions"],
        details: {
          pricing: "Custom enterprise pricing",
          speeds: "From 1Gbps to 100Gbps+",
          sla: "99.99% uptime SLA with financial guarantees",
          support: "24/7 dedicated NOC and account team",
          scalability: "Easily scalable as needs grow",
          benefits: [
            "Diverse path routing options",
            "Customized latency optimization",
            "Carrier-neutral facilities",
            "Dedicated dark fiber options"
          ]
        }
      },
      {
        id: 2,
        icon: <FaShieldAlt className="text-lg md:text-xl" />,
        title: "Enterprise Security",
        description: "Advanced cybersecurity solutions tailored for enterprise network protection.",
        features: ["DDoS protection", "Advanced threat detection", "Compliance management", "Security consulting"],
        details: {
          pricing: "Custom security packages",
          protection: "Multi-layered DDoS mitigation",
          threat: "Advanced threat intelligence and hunting",
          compliance: "Industry-specific compliance support",
          consulting: "Strategic security consulting services",
          benefits: [
            "SOC 2 Type II compliance support",
            "Zero-trust network architecture",
            "Security awareness training",
            "Incident response retainer"
          ]
        }
      },
      {
        id: 3,
        icon: <FaBroadcastTower className="text-lg md:text-xl" />,
        title: "Dark Fiber",
        description: "Private fiber optic infrastructure for complete network control and customization.",
        features: ["Complete ownership", "Unlimited scalability", "Maximum security", "Future-proof infrastructure"],
        details: {
          pricing: "Lease-based or purchase options",
          capacity: "Virtually unlimited capacity",
          control: "Complete control over lighting equipment",
          security: "Physically private infrastructure",
          lifespan: "25+ year infrastructure lifespan",
          benefits: [
            "Custom wavelength services",
            "Low latency paths for financial services",
            "Research and education network support",
            "Carrier wholesale options"
          ]
        }
      }
    ]
  };

  const handleLearnMore = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedService(null), 300);
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

  // ✅ UPDATED BUTTON STYLES (simplified for light mode)
  const BUTTON_STYLES = {
    primary: {
      base: 'py-2 px-6 rounded-full transition-colors duration-300 font-medium text-sm whitespace-nowrap',
      light: 'bg-[#182b5c] hover:bg-[#0f1f45] text-white',
    },
    secondary: {
      base: 'py-2 px-6 rounded-full transition-colors duration-300 font-medium text-sm whitespace-nowrap',
      light: 'border border-[#182b5c] text-[#182b5c] hover:bg-[#182b5c] hover:text-white',
    }
  };

  // Service Card Component (modified for light mode)
  const ServiceCard = ({ service, index }) => (
    <motion.div
      variants={itemVariants}
      // Replaced conditional dark mode class with light mode default
      className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 group bg-white border border-gray-200`}
      whileHover={{ y: -3 }}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="text-center mb-4">
        <motion.div 
          // Replaced conditional dark mode class with light mode default
          className={`group-hover:text-[#d0b216] transition-colors duration-300 inline-block mb-2 text-[#182b5c]`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {service.icon}
        </motion.div>
        <h3 className={`font-semibold mb-2 text-sm md:text-base text-[#182b5c]`}>
          {service.title}
        </h3>
        {/* Replaced conditional dark mode class with light mode default */}
        <p className={`leading-relaxed mb-4 text-xs text-gray-600`}>
          {service.description}
        </p>
      </div>
      <ul className={`space-y-1 mb-4`}>
        {service.features.map((feature, featureIndex) => (
          <motion.li 
            key={featureIndex} 
            className={`flex items-center text-xs text-gray-700`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: featureIndex * 0.1 }}
          >
            <FaCheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
      <motion.button 
        onClick={() => handleLearnMore(service)}
        // Used light mode button style
        className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Learn More
      </motion.button>
    </motion.div>
  );

  return (
    <motion.div 
      // Replaced conditional dark mode class with light mode default
      className={`services-page min-h-screen py-4 md:py-8 overflow-hidden transition-colors duration-300 bg-gray-50`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* ✅ HERO SECTION — FROM NEW VERSION, USING world.jpg (modified for light mode transition) */}
      <section className="relative w-full min-h-[55vh] md:min-h-[60vh] flex items-center overflow-hidden bg-gray-900 pb-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3870&auto=format&fit=crop" 
            alt="Server Background" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        {/* Set static light-mode-friendly gradient (or just use the blue-950 one) */}
        <div className={`absolute inset-0 z-10 bg-gradient-to-r from-blue-950 via-blue-900/90 to-transparent`}></div>
        <div className="relative z-20 w-full max-w-6xl mx-auto px-6 h-full flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 pt-20 md:pt-0">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-[#d0b216] text-xs font-bold uppercase tracking-[0.2em] mb-2">Premium Solutions</p>
              <h1 className="text-4xl md:text-5xl font-bold uppercase mb-2 text-white">
                World Class <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0b216] to-amber-400">Fiber Services</span>
              </h1>
              <p className="text-gray-300 text-xs md:text-sm max-w-sm mb-6 leading-relaxed">
                Whether for home entertainment or enterprise operations, our dedicated fiber infrastructure delivers the speed and reliability you deserve.
              </p>
              <div className="flex gap-4">
                <button onClick={handleGetStartedClick} className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-full transition-all shadow-lg flex items-center gap-2">
                  Get Started <FaArrowRight size={12}/>
                </button>
                <button onClick={handleContactClick} className="border border-white/30 hover:bg-white/10 text-white px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-full transition-all">
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>
          <div className="hidden md:flex w-1/2 h-full items-end justify-end mt-12 md:mt-0 relative">
               {/* Note: I'm keeping the image tag/path as provided in the original code for file path accuracy */}
               <motion.img 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3, duration: 0.8 }} 
                src="/world.jpg" 
                alt="Services Graphic" 
                className="w-full max-w-md object-contain relative z-20 opacity-90" 
                style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} 
              />
          </div>
        </div>
      </section>

      {/* Header Section (Original) */}
      <section className="container mx-auto px-4 mb-4 md:mb-8 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            // Replaced conditional dark mode class with light mode default
            className={`text-lg md:text-2xl font-semibold mb-2 text-[#182b5c]`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our <span className="text-[#d0b216]">Fiber Services</span>
          </motion.h1>
          <motion.p 
            // Replaced conditional dark mode class with light mode default
            className={`text-xs md:text-base max-w-3xl mx-auto text-gray-600`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Experience the future of connectivity with our comprehensive range of fiber internet solutions.
          </motion.p>
          <motion.div 
            className="w-12 h-1 bg-[#d0b216] mx-auto mt-2 md:mt-3"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-4 mb-4 md:mb-8 relative z-10">
        <div className="flex justify-center">
          <motion.div 
            // Replaced conditional dark mode class with light mode default
            className={`rounded-lg shadow-sm p-1 flex flex-wrap justify-center gap-1 bg-white`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {['residential', 'business', 'enterprise'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                  activeTab === tab
                    ? 'bg-[#182b5c] text-white shadow-md'
                    // Used light mode tab style
                    : 'text-gray-600 hover:text-[#182b5c] hover:bg-gray-100'
                }`}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab === 'residential' && <FaHome className="mr-1 text-xs" />}
                {tab === 'business' && <FaBuilding className="mr-1 text-xs" />}
                {tab === 'enterprise' && <FaNetworkWired className="mr-1 text-xs" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 mb-6 md:mb-12 relative z-10">
        <motion.h2 
          // Replaced conditional dark mode class with light mode default
          className={`text-base md:text-xl font-semibold text-center mb-3 md:mb-6 capitalize text-[#182b5c]`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab} Services
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeTab}
        >
          {servicesData[activeTab].map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </motion.div>
      </section>

      {/* Coverage Map Section */}
      <section className="container mx-auto px-4 mb-6 md:mb-12 relative z-10">
        <motion.div 
          // Replaced conditional dark mode class with light mode default
          className={`rounded-xl shadow-md overflow-hidden bg-gradient-to-r from-[#182b5c] to-[#0f1f45]`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-4 md:p-6 text-white">
              <h2 className="text-base md:text-xl font-semibold mb-2">Check Our Coverage</h2>
              <p className="text-blue-100 mb-3 text-xs md:text-sm">
                See if our high-speed fiber network is available in your area.
              </p>
              <ul className="space-y-2 mb-4">
                <motion.li 
                  className="flex items-center text-xs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <FaMapMarkerAlt className="w-3 h-3 mr-2 text-[#d0b216]" />
                  <span>Real-time coverage checking</span>
                </motion.li>
                <motion.li 
                  className="flex items-center text-xs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <FaClock className="w-3 h-3 mr-2 text-[#d0b216]" />
                  <span>Instant eligibility results</span>
                </motion.li>
                <motion.li 
                  className="flex items-center text-xs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <FaRocket className="w-3 h-3 mr-2 text-[#d0b216]" />
                  <span>Quick installation scheduling</span>
                </motion.li>
              </ul>
              <motion.button 
                onClick={handleCoverageClick}
                className={`${BUTTON_STYLES.primary.base} bg-[#d0b216] text-[#182b5c] hover:bg-[#c0a220]`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Check Coverage
              </motion.button>
            </div>
            <div className={`flex items-center justify-center p-4 bg-gray-200`}>
              <motion.div 
                className={`rounded-lg p-4 text-center w-full h-40 md:h-56 flex flex-col items-center justify-center bg-white text-gray-800`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 10 }}
                >
                  <FaMapMarkerAlt className="w-5 h-5 text-[#182b5c]" />
                </motion.div>
                <h3 className="text-sm md:text-lg font-medium mb-1">Coverage Map</h3>
                <p className={`text-gray-600 mb-2 text-xs`}>Check availability</p>
                <div className={`w-full h-2 rounded-full mb-1 overflow-hidden bg-gray-300`}>
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-[#182b5c] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className={`text-xs text-gray-500`}>95% coverage</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Value-Added Services Section */}
      <section className="container mx-auto px-4 mb-6 md:mb-12 relative z-10">
        <motion.div 
          // Replaced conditional dark mode class with light mode default
          className={`rounded-xl p-4 bg-gradient-to-r from-[#182b5c] to-[#0f1f45]`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="text-center mb-4">
            <h2 className="text-base md:text-xl font-semibold mb-2 text-white">Value-Added Services</h2>
            <p className="text-xs md:text-sm text-blue-200">
              Enhance your internet experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {[
              {
                icon: <FaTools className="text-lg mb-2" />,
                title: "Professional Installation",
                description: "Expert installation by certified technicians"
              },
              {
                icon: <FaHeadset className="text-lg mb-2" />,
                title: "24/7 Premium Support",
                description: "Round-the-clock customer support"
              },
              {
                icon: <FaCogs className="text-lg mb-2" />,
                title: "Smart Home Setup",
                description: "Complete smart home integration"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                // Used light mode styles
                className={`text-center p-3 rounded-lg backdrop-blur-sm border hover:bg-opacity-20 transition-all duration-300 bg-white bg-opacity-10 border-white border-opacity-20`}
                whileHover={{ y: -3 }}
              >
                <div className="text-[#d0b216] mb-2">
                  {service.icon}
                </div>
                <h3 className="text-sm font-medium mb-1 text-white">
                  {service.title}
                </h3>
                <p className="text-blue-100 text-xs">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              // Used light mode background/text color
              className={`rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900`}
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className={`mr-3 text-lg text-[#182b5c]`}>
                      {selectedService.icon}
                    </div>
                    <h2 className={`text-base md:text-xl font-semibold text-[#182b5c]`}>
                      {selectedService.title}
                    </h2>
                  </div>
                  <motion.button 
                    onClick={closeModal}
                    // Used light mode button style
                    className={`transition-colors duration-300 p-1 rounded-full text-gray-500 hover:bg-gray-100`}
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes className="text-lg" />
                  </motion.button>
                </div>
                <p className={`text-xs md:text-sm mb-4 text-gray-600`}>
                  {selectedService.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className={`text-sm font-medium mb-2 flex items-center text-[#182b5c]`}>
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Key Features
                    </h3>
                    <ul className="space-y-1">
                      {selectedService.features.map((feature, index) => (
                        <motion.li 
                          key={index} 
                          className="flex items-start text-xs"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-[#182b5c]`}></span>
                          <span className={'text-gray-700'}>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium mb-2 flex items-center text-[#182b5c]`}>
                      <FaShieldVirus className="mr-2" />
                      Service Details
                    </h3>
                    {/* Used light mode background */}
                    <div className={`rounded-lg p-3 bg-gray-50`}>
                      {selectedService.details.pricing && (
                        <div className="mb-2">
                          <h4 className={`font-medium text-xs text-[#182b5c]`}>Pricing</h4>
                          <p className={'text-gray-700 text-xs'}>{selectedService.details.pricing}</p>
                        </div>
                      )}
                      {selectedService.details.sla && (
                        <div className="mb-2">
                          <h4 className={`font-medium text-xs text-[#182b5c]`}>Uptime Guarantee</h4>
                          <p className={'text-gray-700 text-xs'}>{selectedService.details.sla}</p>
                        </div>
                      )}
                      {selectedService.details.speedTiers && (
                        <div className="mb-2">
                          <h4 className={`font-medium text-xs text-[#182b5c]`}>Speed Tiers</h4>
                          <p className={'text-gray-700 text-xs'}>{selectedService.details.speedTiers.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {selectedService.details.benefits && (
                  <div className="mb-6">
                    <h3 className={`text-sm font-medium mb-2 flex items-center text-[#182b5c]`}>
                      <FaRocket className="mr-2" />
                      Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedService.details.benefits.map((benefit, index) => (
                        <motion.div 
                          key={index} 
                          className={`flex items-start p-2 rounded-lg text-xs bg-blue-50`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <FaInfinity className={`mt-0.5 mr-2 flex-shrink-0 text-[#182b5c]`} />
                          <span className={'text-gray-700'}>{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
                  <motion.button 
                    className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGetStartedClick}
                  >
                    Get This Service
                  </motion.button>
                  <motion.button 
                    className={`${BUTTON_STYLES.secondary.base} ${BUTTON_STYLES.secondary.light}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContactClick}
                  >
                    Contact Sales
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mt-6 md:mt-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          // Used light mode background/shadow
          className={`rounded-xl p-4 bg-white shadow-md`}
        >
          <h2 className={`text-base md:text-xl font-semibold mb-2 text-[#182b5c]`}>
            Ready to Experience True Fiber?
          </h2>
          <p className={`text-xs md:text-base mb-4 max-w-2xl mx-auto text-gray-600`}>
            Join thousands of satisfied customers enjoying lightning-fast internet.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <motion.button 
              className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStartedClick}
            >
              Get Started Now
            </motion.button>
            <motion.button 
              className={`${BUTTON_STYLES.secondary.base} ${BUTTON_STYLES.secondary.light}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContactClick}
            >
              Speak to an Expert
            </motion.button>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Services;