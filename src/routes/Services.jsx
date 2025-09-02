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

  // Service Card Component
  const ServiceCard = ({ service, index, compact = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group border border-gray-100 ${
        compact ? 'h-full' : ''
      }`}
    >
      <div className="text-center mb-6">
        <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300 inline-block mb-4">
          {service.icon}
        </div>
        <h3 className={`font-bold text-gray-900 mb-3 ${compact ? 'text-lg' : 'text-xl'}`}>
          {service.title}
        </h3>
        <p className={`text-gray-600 mb-4 leading-relaxed ${compact ? 'text-sm' : ''}`}>
          {service.description}
        </p>
      </div>
      
      <ul className={`space-y-2 mb-6 ${compact ? 'space-y-1' : 'space-y-3'}`}>
        {service.features.slice(0, compact ? 3 : service.features.length).map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-center text-gray-700">
            <FaCheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
            <span className={compact ? 'text-sm' : ''}>{feature}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={() => handleLearnMore(service)}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl transition-colors duration-300 font-semibold flex items-center justify-center group-hover:shadow-md ${
          compact ? 'text-sm py-2' : ''
        }`}
      >
        Learn More <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );

  return (
    <div className="services-page bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-12 overflow-hidden">
      {/* Header Section */}
      <section className="container mx-auto px-4 mb-16">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-blue-600">Fiber Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of connectivity with our comprehensive range of fiber internet solutions. 
            From homes to enterprises, we deliver reliable, high-speed internet services.
          </p>
        </motion.div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-2 flex space-x-2">
            {['residential', 'business', 'enterprise'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'residential' && <FaHome className="mr-2" />}
                {tab === 'business' && <FaBuilding className="mr-2" />}
                {tab === 'enterprise' && <FaNetworkWired className="mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 capitalize">
          {activeTab} Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData[activeTab].map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>
      </section>

      {/* Coverage Map Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 text-white">
              <h2 className="text-3xl font-bold mb-4">Check Our Coverage</h2>
              <p className="text-blue-100 mb-6 text-lg">
                See if our high-speed fiber network is available in your area with our interactive coverage map.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <FaMapMarkerAlt className="w-5 h-5 mr-3 text-blue-200" />
                  <span>Real-time coverage checking</span>
                </li>
                <li className="flex items-center">
                  <FaClock className="w-5 h-5 mr-3 text-blue-200" />
                  <span>Instant eligibility results</span>
                </li>
                <li className="flex items-center">
                  <FaRocket className="w-5 h-5 mr-3 text-blue-200" />
                  <span>Quick installation scheduling</span>
                </li>
              </ul>
              <button 
                onClick={handleCoverageClick}
                className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition-colors duration-300 flex items-center"
              >
                Check Coverage <FaArrowRight className="ml-2" />
              </button>
            </div>
            <div className="bg-gray-200 flex items-center justify-center p-10">
              <div className="bg-white rounded-xl p-6 text-center shadow-inner w-full h-64 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FaMapMarkerAlt className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Coverage Map</h3>
                <p className="text-gray-600 mb-4">Check availability in your area</p>
                <div className="w-full h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-2"></div>
                <p className="text-sm text-gray-500">95% of metropolitan areas covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value-Added Services Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-12 text-white">
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
              >
                <div className="text-blue-400 mb-4">
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
        </div>
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
                    <div className="text-blue-600 mr-4 text-2xl">
                      {selectedService.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedService.title}
                    </h2>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-300 p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <p className="text-gray-600 text-lg mb-6">
                  {selectedService.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Key Features
                    </h3>
                    <ul className="space-y-3">
                      {selectedService.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FaShieldVirus className="text-blue-500 mr-2" />
                      Service Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-5">
                      {selectedService.details.pricing && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900">Pricing</h4>
                          <p className="text-gray-700">{selectedService.details.pricing}</p>
                        </div>
                      )}
                      
                      {selectedService.details.sla && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900">Uptime Guarantee</h4>
                          <p className="text-gray-700">{selectedService.details.sla}</p>
                        </div>
                      )}
                      
                      {selectedService.details.speedTiers && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900">Speed Tiers</h4>
                          <p className="text-gray-700">{selectedService.details.speedTiers.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedService.details.benefits && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FaRocket className="text-blue-500 mr-2" />
                      Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedService.details.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start bg-blue-50 p-4 rounded-xl">
                          <FaInfinity className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-8 gap-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors duration-300 font-semibold">
                    Get This Service
                  </button>
                  <button className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-3 rounded-xl transition-colors duration-300 font-semibold">
                    Contact Sales
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience True Fiber?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers enjoying lightning-fast internet. 
            Contact our team today to find the perfect solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-colors duration-300 font-semibold shadow-md hover:shadow-lg">
              Get Started Now
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl transition-colors duration-300 font-semibold">
              Speak to an Expert
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Services;