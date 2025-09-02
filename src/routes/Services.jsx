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
  FaArrowRight,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaShieldVirus,
  FaRocket,
  FaInfinity
} from 'react-icons/fa';

const Services = () => {
  const [activeTab, setActiveTab] = useState('residential');
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const servicesData = {
    residential: [
      {
        id: 1,
        icon: <FaHome className="text-3xl" />,
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
        icon: <FaWifi className="text-3xl" />,
        title: "Whole Home WiFi",
        description: "Seamless WiFi coverage throughout your home with our advanced mesh network systems.",
        features: ["Whole home coverage", "Multiple devices", "Parental controls", "Guest network"],
        details: {
          pricing: "From $9.99/month (equipment rental) or $199 one-time purchase",
          coverage: "Up to 5,000 sq ft with base system",
          nodes: "Expandable with additional nodes",
          security: "Built-in network security",
          management: "Easy app-based network management",
          features: [
            "Seamless roaming between access points",
            "Band steering for optimal performance",
            "Device prioritization settings",
            "Usage statistics and insights"
          ]
        }
      },
      {
        id: 3,
        icon: <FaUserShield className="text-3xl" />,
        title: "Home Security Bundle",
        description: "Internet plus security solutions to keep your home and family protected online.",
        features: ["VPN included", "Malware protection", "Smart home ready", "Family safety"],
        details: {
          pricing: "From $14.99/month added to internet plan",
          protection: "Real-time threat detection and blocking",
          privacy: "Secure VPN for all devices",
          parental: "Advanced parental controls with scheduling",
          smartHome: "Dedicated IoT network for smart devices",
          features: [
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
        icon: <FaBuilding className="text-3xl" />,
        title: "Business Fiber",
        description: "Dedicated fiber connections for businesses with guaranteed uptime and symmetrical speeds.",
        features: ["SLA guaranteed", "Symmetrical speeds", "Static IP options", "Priority support"],
        details: {
          pricing: "Custom pricing based on requirements",
          speedTiers: ["100Mbps", "500Mbps", "1Gbps", "10Gbps"],
          sla: "99.9% uptime guarantee",
          support: "24/7 dedicated business support",
          staticIPs: "Options for 1, 5, or 13 static IP addresses",
          features: [
            "No data caps or throttling",
            "Business-grade hardware included",
            "Advanced network monitoring",
            "Professional installation"
          ]
        }
      },
      {
        id: 2,
        icon: <FaServer className="text-3xl" />,
        title: "Managed Services",
        description: "Complete IT solutions including network management, cloud services, and security.",
        features: ["24/7 monitoring", "Proactive maintenance", "Cloud integration", "Security management"],
        details: {
          pricing: "Custom packages starting at $299/month",
          monitoring: "24/7 network monitoring and alerting",
          maintenance: "Proactive patches and updates",
          backup: "Cloud backup solutions",
          security: "Enterprise-grade firewall and security",
          features: [
            "Dedicated account manager",
            "Regular performance reports",
            "On-demand IT support",
            "Hardware lifecycle management"
          ]
        }
      },
      {
        id: 3,
        icon: <FaChartLine className="text-3xl" />,
        title: "SD-WAN Solutions",
        description: "Advanced software-defined networking for multi-location business connectivity.",
        features: ["Multi-site management", "Traffic optimization", "Cost reduction", "Enhanced security"],
        details: {
          pricing: "From $99/month per location",
          management: "Centralized cloud-based management",
          optimization: "Application-aware routing",
          resilience: "Automatic failover between connections",
          security: "Integrated security with zero-trust architecture",
          features: [
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
        icon: <FaNetworkWired className="text-3xl" />,
        title: "Enterprise Fiber",
        description: "Carrier-grade fiber solutions for large enterprises with mission-critical requirements.",
        features: ["99.99% uptime", "Dedicated bandwidth", "24/7 NOC support", "Custom solutions"],
        details: {
          pricing: "Custom enterprise pricing",
          speeds: "From 1Gbps to 100Gbps+",
          sla: "99.99% uptime SLA with financial guarantees",
          support: "24/7 dedicated NOC and account team",
          scalability: "Easily scalable as needs grow",
          features: [
            "Diverse path routing options",
            "Customized latency optimization",
            "Carrier-neutral facilities",
            "Dedicated dark fiber options"
          ]
        }
      },
      {
        id: 2,
        icon: <FaShieldAlt className="text-3xl" />,
        title: "Enterprise Security",
        description: "Advanced cybersecurity solutions tailored for enterprise network protection.",
        features: ["DDoS protection", "Advanced threat detection", "Compliance management", "Security consulting"],
        details: {
          pricing: "Custom security packages",
          protection: "Multi-layered DDoS mitigation",
          threat: "Advanced threat intelligence and hunting",
          compliance: "Industry-specific compliance support",
          consulting: "Strategic security consulting services",
          features: [
            "SOC 2 Type II compliance support",
            "Zero-trust network architecture",
            "Security awareness training",
            "Incident response retainer"
          ]
        }
      },
      {
        id: 3,
        icon: <FaBroadcastTower className="text-3xl" />,
        title: "Dark Fiber",
        description: "Private fiber optic infrastructure for complete network control and customization.",
        features: ["Complete ownership", "Unlimited scalability", "Maximum security", "Future-proof infrastructure"],
        details: {
          pricing: "Lease-based or purchase options",
          capacity: "Virtually unlimited capacity",
          control: "Complete control over lighting equipment",
          security: "Physically private infrastructure",
          lifespan: "25+ year infrastructure lifespan",
          features: [
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

  const handleCoverageClick = () => {
    navigate('/coverageMap');
  };

  const handleGetStartedClick = () => {
    navigate('/WifiPlans');
  };

  const handleContactClick = () => {
    navigate('/contact');
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

  // Map animation variants
  const mapContainerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const mapContentVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.3,
        ease: "easeOut"
      }
    }
  };

  const progressBarVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: {
        duration: 1.5,
        delay: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Service Card Component
  const ServiceCard = ({ service, index, compact = false }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group border border-gray-100 ${
        compact ? 'h-full' : ''
      }`}
      whileHover={{ y: -5 }}
    >
      <div className="text-center mb-6">
        <motion.div 
          className="text-[#182b5c] group-hover:text-[#d0b216] transition-colors duration-300 inline-block mb-4"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {service.icon}
        </motion.div>
        <h3 className={`font-bold text-[#182b5c] mb-3 ${compact ? 'text-lg' : 'text-xl'}`}>
          {service.title}
        </h3>
        <p className={`text-gray-600 mb-4 leading-relaxed ${compact ? 'text-sm' : ''}`}>
          {service.description}
        </p>
      </div>
      
      <ul className={`space-y-2 mb-6 ${compact ? 'space-y-1' : 'space-y-3'}`}>
        {service.features.slice(0, compact ? 3 : service.features.length).map((feature, featureIndex) => (
          <motion.li 
            key={featureIndex} 
            className="flex items-center text-gray-700"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: featureIndex * 0.1 }}
          >
            <FaCheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
            <span className={compact ? 'text-sm' : ''}>{feature}</span>
          </motion.li>
        ))}
      </ul>

      <motion.button 
        onClick={() => handleLearnMore(service)}
        className={`w-full bg-[#182b5c] hover:bg-[#0f1f45] text-white py-3 px-6 rounded-xl transition-colors duration-300 font-semibold flex items-center justify-center group-hover:shadow-md ${
          compact ? 'text-sm py-2' : ''
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Learn More <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );

  return (
    <motion.div 
      className="services-page bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-12 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[#182b5c]">
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

      {/* Header Section */}
      <section className="container mx-auto px-4 mb-16 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-[#182b5c] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our <span className="text-[#d0b216]">Fiber Services</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Experience the future of connectivity with our comprehensive range of fiber internet solutions. 
            From homes to enterprises, we deliver reliable, high-speed internet services.
          </motion.p>
          <motion.div 
            className="w-24 h-1 bg-[#d0b216] mx-auto mt-4"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-4 mb-12 relative z-10">
        <div className="flex justify-center">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-2 flex space-x-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {['residential', 'business', 'enterprise'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                  activeTab === tab
                    ? 'bg-[#182b5c] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#182b5c] hover:bg-gray-100'
                }`}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {tab === 'residential' && <FaHome className="mr-2" />}
                {tab === 'business' && <FaBuilding className="mr-2" />}
                {tab === 'enterprise' && <FaNetworkWired className="mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 mb-16 relative z-10">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-[#182b5c] text-center mb-8 capitalize"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab} Services
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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

      {/* Coverage Map Section - Animated */}
      <section className="container mx-auto px-4 mb-20 relative z-10">
        <motion.div 
          className="bg-gradient-to-r from-[#182b5c] to-[#0f1f45] rounded-2xl shadow-xl overflow-hidden"
          variants={mapContainerVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 text-white">
              <h2 className="text-3xl font-bold mb-4">Check Our Coverage</h2>
              <p className="text-blue-100 mb-6 text-lg">
                See if our high-speed fiber network is available in your area with our interactive coverage map.
              </p>
              <ul className="space-y-3 mb-8">
                <motion.li 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <FaMapMarkerAlt className="w-5 h-5 mr-3 text-[#d0b216]" />
                  <span>Real-time coverage checking</span>
                </motion.li>
                <motion.li 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <FaClock className="w-5 h-5 mr-3 text-[#d0b216]" />
                  <span>Instant eligibility results</span>
                </motion.li>
                <motion.li 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <FaRocket className="w-5 h-5 mr-3 text-[#d0b216]" />
                  <span>Quick installation scheduling</span>
                </motion.li>
              </ul>
              <motion.button 
                onClick={handleCoverageClick}
                className="bg-[#d0b216] text-[#182b5c] hover:bg-[#c0a220] font-semibold py-3 px-8 rounded-xl transition-colors duration-300 flex items-center"
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                Check Coverage <FaArrowRight className="ml-2" />
              </motion.button>
            </div>
            <div className="bg-gray-200 flex items-center justify-center p-10">
              <motion.div 
                className="bg-white rounded-xl p-6 text-center shadow-inner w-full h-64 flex flex-col items-center justify-center"
                variants={mapContentVariants}
              >
                <motion.div 
                  className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 10 }}
                >
                  <FaMapMarkerAlt className="w-8 h-8 text-[#182b5c]" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Coverage Map</h3>
                <p className="text-gray-600 mb-4">Check availability in your area</p>
                <div className="w-full h-3 bg-gray-300 rounded-full mb-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-[#182b5c] rounded-full"
                    variants={progressBarVariants}
                  />
                </div>
                <p className="text-sm text-gray-500">95% of metropolitan areas covered</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Value-Added Services Section */}
      <section className="container mx-auto px-4 mb-20 relative z-10">
        <motion.div 
          className="bg-gradient-to-r from-[#182b5c] to-[#0f1f45] rounded-2xl p-12 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Value-Added Services</h2>
            <p className="text-lg text-blue-200">
              Enhance your internet experience with our premium additional services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaTools className="text-3xl mb-4" />,
                title: "Professional Installation",
                description: "Expert installation by certified technicians"
              },
              {
                icon: <FaHeadset className="text-3xl mb-4" />,
                title: "24/7 Premium Support",
                description: "Round-the-clock customer support with priority response"
              },
              {
                icon: <FaCogs className="text-3xl mb-4" />,
                title: "Smart Home Setup",
                description: "Complete smart home integration services"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-[#d0b216] mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-blue-100">
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="text-[#182b5c] mr-4 text-2xl">
                      {selectedService.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-[#182b5c]">
                      {selectedService.title}
                    </h2>
                  </div>
                  <motion.button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-300 p-2 rounded-full hover:bg-gray-100"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes className="text-xl" />
                  </motion.button>
                </div>

                <p className="text-gray-600 text-lg mb-6">
                  {selectedService.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-[#182b5c] mb-4 flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Key Features
                    </h3>
                    <ul className="space-y-3">
                      {selectedService.features.map((feature, index) => (
                        <motion.li 
                          key={index} 
                          className="flex items-start"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="w-2 h-2 bg-[#182b5c] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#182b5c] mb-4 flex items-center">
                      <FaShieldVirus className="text-[#182b5c] mr-2" />
                      Service Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-5">
                      {selectedService.details.pricing && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-[#182b5c]">Pricing</h4>
                          <p className="text-gray-700">{selectedService.details.pricing}</p>
                        </div>
                      )}
                      
                      {selectedService.details.sla && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-[#182b5c]">Uptime Guarantee</h4>
                          <p className="text-gray-700">{selectedService.details.sla}</p>
                        </div>
                      )}
                      
                      {selectedService.details.speedTiers && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-[#182b5c]">Speed Tiers</h4>
                          <p className="text-gray-700">{selectedService.details.speedTiers.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedService.details.benefits && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-[#182b5c] mb-4 flex items-center">
                      <FaRocket className="text-[#182b5c] mr-2" />
                      Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedService.details.benefits.map((benefit, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-start bg-blue-50 p-4 rounded-xl"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <FaInfinity className="text-[#182b5c] mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-8 gap-4">
                  <motion.button 
                    className="bg-[#182b5c] hover:bg-[#0f1f45] text-white px-8 py-3 rounded-xl transition-colors duration-300 font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGetStartedClick}
                  >
                    Get This Service
                  </motion.button>
                  <motion.button 
                    className="border-2 border-gray-300 text-gray-700 hover:border-[#182b5c] hover:text-[#182b5c] px-8 py-3 rounded-xl transition-colors duration-300 font-semibold"
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
      <section className="container mx-auto px-4 mt-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-12"
        >
          <h2 className="text-3xl font-bold text-[#182b5c] mb-4">
            Ready to Experience True Fiber?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers enjoying lightning-fast internet. 
            Contact our team today to find the perfect solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              className="bg-[#182b5c] hover:bg-[#0f1f45] text-white px-8 py-4 rounded-xl transition-colors duration-300 font-semibold shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStartedClick}
            >
              Get Started Now
            </motion.button>
            <motion.button 
              className="border-2 border-[#182b5c] text-[#182b5c] hover:bg-[#182b5c] hover:text-white px-8 py-4 rounded-xl transition-colors duration-300 font-semibold"
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