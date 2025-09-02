import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, HardHat, Wifi, Zap, ChevronRight, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Unsplash images for fibre network
const unsplashImages = {
  basic: "https://images.unsplash.com/photo-1563014959-7aaa83350992?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  essential: "https://images.unsplash.com/photo-1592910147776-6807e05f5b4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  family: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  streaming: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  pro: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  premium: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  business: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  enterprise: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
};

const plans = [
  {
    id: 1,
    name: "6 Mbps Plan",
    price: "Ksh 1,500",
    speed: "6Mbps",
    image: unsplashImages.basic,
    features: ["Great for browsing", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    id: 2,
    name: "12 Mbps Plan",
    price: "Ksh 2,000",
    speed: "12Mbps",
    image: unsplashImages.essential,
    features: ["Streaming & Social Media", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    id: 3,
    name: "20 Mbps Plan",
    price: "Ksh 2,500",
    speed: "20Mbps",
    image: unsplashImages.family,
    features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false  // Removed popular tag as requested
  },
  {
    id: 4,
    name: "30 Mbps Plan",
    price: "Ksh 3,000",
    speed: "30Mbps",
    image: unsplashImages.streaming,
    features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    id: 5,
    name: "40 Mbps Plan",
    price: "Ksh 4,000",
    speed: "40Mbps",
    image: unsplashImages.pro,
    features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    id: 6,
    name: "60 Mbps Plan",
    price: "Ksh 6,000",
    speed: "60Mbps",
    image: unsplashImages.premium,
    features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    id: 7,
    name: "Business Basic",
    price: "Ksh 8,000",
    speed: "50Mbps",
    image: unsplashImages.business,
    features: ["5 IP phones", "3 Static IPs", "Priority support", "99.5% uptime"],
    type: "business",
    popular: false
  },
  {
    id: 8,
    name: "Business Plus",
    price: "Ksh 15,000",
    speed: "100Mbps",
    image: unsplashImages.business,
    features: ["10 IP phones", "5 Static IPs", "Dedicated line", "99.9% uptime"],
    type: "business",
    popular: false  // Removed popular tag
  },
  {
    id: 9,
    name: "Enterprise",
    price: "Custom",
    speed: "500Mbps+",
    image: unsplashImages.enterprise,
    features: ["Unlimited IP phones", "10+ Static IPs", "SLA guarantee", "24/7 monitoring"],
    type: "enterprise",
    popular: false
  }
];

const features = [
  {
    icon: "far fa-check-circle",
    title: "High Speed",
    description: "Enjoy our high speeds of VTL Telecom fiber for your Home & office meetings and entertainment purpose"
  },
  {
    icon: "fas fa-user-clock",
    title: "Customer Service",
    description: "We provide 24/7 Customer support. Reach out to us at any time of the day for any inquiries"
  },
  {
    icon: "fas fa-infinity",
    title: "Unlimited Access",
    description: "Browse and stream your favorite movies without internet limit restrictions."
  },
  {
    icon: "far fa-thumbs-up",
    title: "Reliability",
    description: "With our internet plans you get connected to internet that works 24/7 with zero downtime."
  },
  {
    icon: "fas fa-money-check-alt",
    title: "Affordability",
    description: "With us you get more for less. We do Installations free of charge. We have no capping on your usage."
  },
  {
    icon: "fas fa-check-double",
    title: "Safety",
    description: "Your privacy and security is our core priority and with us you are assured of both."
  }
];

export default function WifiPlans() {
  const [activeTab, setActiveTab] = useState("home");
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    connectionType: ''
  });
  const [messageStatus, setMessageStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [showChatBot, setShowChatBot] = useState(false);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      connectionType: plan.name
    }));
    setShowForm(true);
    setMessageStatus(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const whatsappNumber = "+254741874200";
    const message = `New Connection Request:%0A%0A` +
                   `*Name:* ${formData.name}%0A` +
                   `*Phone:* ${formData.phone}%0A` +
                   `*Email:* ${formData.email}%0A` +
                   `*Location:* ${formData.location}%0A` +
                   `*Connection Type:* ${formData.connectionType}%0A%0A` +
                   `I would like to get connected!`;
    
    // Open WhatsApp in a new tab
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    
    // Simulate message delivery status
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll assume it's always successful
      // In a real app, you would check the actual status
      setMessageStatus('success');
      
      setTimeout(() => {
        setShowForm(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          connectionType: ''
        });
        setSelectedPlan(null);
      }, 2000);
    } catch (err) {
      setMessageStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => plan.type === activeTab);

  // Card animation variants
  const cardVariants = {
    offscreen: {
      y: 100,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Floating WhatsApp Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        onClick={() => setShowChatBot(true)}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-40 hover:bg-green-600 transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* WhatsApp Chat Bot */}
      <AnimatePresence>
        {showChatBot && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="bg-green-500 text-white p-3 flex justify-between items-center">
              <h3 className="font-semibold">Chat with us on WhatsApp</h3>
              <button onClick={() => setShowChatBot(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">Hello! How can we help you today?</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    window.open(`https://wa.me/+254741874200?text=Hello! I need information about your internet plans.`, '_blank');
                    setShowChatBot(false);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors text-left"
                >
                  📋 Information about plans
                </button>
                
                <button
                  onClick={() => {
                    window.open(`https://wa.me/+254741874200?text=Hello! I need support with my current connection.`, '_blank');
                    setShowChatBot(false);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors text-left"
                >
                  🔧 Technical support
                </button>
                
                <button
                  onClick={() => {
                    window.open(`https://wa.me/+254741874200?text=Hello! I'd like to make a complaint.`, '_blank');
                    setShowChatBot(false);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors text-left"
                >
                  📝 Make a complaint
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Or start a conversation directly:</p>
                <button
                  onClick={() => {
                    window.open(`https://wa.me/+254741874200`, '_blank');
                    setShowChatBot(false);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors mt-2 flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Open WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with VTL-inspired design */}
      <section className="relative bg-gradient-to-r from-[#0033a0] to-[#0099cc] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            High-Speed Fibre Internet
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-10 max-w-3xl mx-auto"
          >
            Experience lightning-fast internet with our reliable fibre connections. 
            Perfect for streaming, gaming, and working from home.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center"
          >
            <button 
              onClick={() => document.getElementById('plans-section').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-[#0033a0] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-lg"
            >
              View Plans
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section id="plans-section" className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#0033a0] to-[#0099cc] bg-clip-text text-transparent">
              Internet Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your home or business with our reliable fibre internet solutions
            </p>
          </motion.div>

          {/* Tab Navigation - VTL Style */}
          <div className="flex justify-center mb-12">
            <motion.div 
              className="inline-flex rounded-lg bg-gray-200 p-1 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => setActiveTab("home")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === "home" ? "bg-[#0033a0] text-white shadow-md" : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"}`}
              >
                Home Plans
              </button>
              <button
                onClick={() => setActiveTab("business")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === "business" ? "bg-[#0033a0] text-white shadow-md" : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"}`}
              >
                Business Plans
              </button>
              <button
                onClick={() => setActiveTab("enterprise")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === "enterprise" ? "bg-[#0033a0] text-white shadow-md" : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"}`}
              >
                Enterprise
              </button>
            </motion.div>
          </div>

          {/* Plans Grid with VTL-inspired design */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className="relative"
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                <motion.div
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 relative h-full flex flex-col ${hoveredPlan === plan.id ? 'border-[#0033a0]' : 'border-transparent'}`}
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-[#0033a0]">{plan.name}</h3>
                      <span className="text-2xl font-bold text-[#0033a0]">{plan.price}</span>
                    </div>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-gray-800">{plan.speed}</span>
                      <span className="text-gray-600"> download speed</span>
                    </div>
                  </div>
                  <div className="p-6 flex-grow">
                    <ul className="mb-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle className="w-5 h-5 text-[#0099cc] mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 pt-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlanSelect(plan)}
                      className="w-full bg-gradient-to-r from-[#0033a0] to-[#0099cc] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      Get Connected
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Connection Form Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={() => setShowForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[#0033a0]">Get {selectedPlan?.name}</h3>
                  </div>

                  {/* Status Messages */}
                  {messageStatus === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
                    >
                      <p>Message sent successfully! We'll contact you shortly.</p>
                    </motion.div>
                  )}

                  {messageStatus === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0] transition-all"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0] transition-all"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0] transition-all"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0] transition-all"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 cursor-not-allowed"
                          value={formData.connectionType}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors disabled:opacity-70"
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
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-6.29-3.062c-.545 0-1-.448-1-1s.445-1 1-1c.552 0 1 .448 1 1s-.443 1-1 1m4 0c-.545 0-1-.448-1-1s.445-1 1-1c.552 0 1 .448 1 1s-.443 1-1 1m2.005 9.644c-.366-.01-1.422-.361-2.053-.616l-.086-.035c-.487-.199-1.153-.473-1.623-.762-.543-.333-.915-.669-1.279-1.141-.432-.561-.757-1.236-.964-1.821l-.013-.034c-.309-.84-.175-1.579.024-2.192l-.013-.034c.099-.24.260-.624.260-.624s-.159-.397-.198-.606c-.40-.209-.05-.359-.099-.568-.05-.208-.248-.52-.446-.669-.198-.149-.471-.258-.97-.258-.322 0-.644.025-.966.074-.309.05-.619.124-.929.198-.396.099-1.108.347-1.564.644-.447.297-.828.694-1.04 1.141-.223.471-.347 1.033-.347 1.702 0 .669.124 1.379.471 2.118l.013.034c.396.941 1.104 2.06 1.806 2.809.744.793 1.678 1.416 2.488 1.821l.074.037c.669.322 1.847.793 2.379.941.396.112.828.174 1.213.174.57 0 1.074-.062 1.49-.211.446-.160.832-.471 1.104-.941.272-.471.347-1.033.248-1.604-.074-.458-.322-.907-.644-1.191a1.49 1.49 0 00-.793-.347c-.124-.025-.223-.033-.322-.033" />
                            </svg>
                            Send via WhatsApp
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features Section with Marquee Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-xl p-8 shadow-lg overflow-hidden"
          >
            <h3 className="text-2xl font-bold text-center text-[#0033a0] mb-8">All Plans Include</h3>
            
            {/* Marquee Container */}
            <div className="relative flex overflow-hidden">
              <motion.div 
                className="flex flex-none"
                animate={{ x: [0, -1000] }}
                transition={{ 
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear"
                  }
                }}
              >
                {/* First set of icons */}
                <div className="flex space-x-8 pr-8">
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">24/7 Support</h4>
                    <p className="text-gray-600 text-sm">Round-the-clock technical assistance</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HardHat className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Quick Installation</h4>
                    <p className="text-gray-600 text-sm">Professional setup within 48 hours</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Low Latency</h4>
                    <p className="text-gray-600 text-sm">&lt;5ms ping for gaming</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wifi className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Free Router</h4>
                    <p className="text-gray-600 text-sm">High-quality router included</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Reliability</h4>
                    <p className="text-gray-600 text-sm">99.9% uptime guarantee</p>
                  </div>
                </div>
                
                {/* Duplicate set for seamless looping */}
                <div className="flex space-x-8 pr-8">
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">24/7 Support</h4>
                    <p className="text-gray-600 text-sm">Round-the-clock technical assistance</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HardHat className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Quick Installation</h4>
                    <p className="text-gray-600 text-sm">Professional setup within 48 hours</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Low Latency</h4>
                    <p className="text-gray-600 text-sm">&lt;5ms ping for gaming</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wifi className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Free Router</h4>
                    <p className="text-gray-600 text-sm">High-quality router included</p>
                  </div>
                  
                  <div className="text-center flex-shrink-0 w-40">
                    <div className="bg-gradient-to-r from-[#0033a0] to-[#0099cc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#0033a0] mb-2">Reliability</h4>
                    <p className="text-gray-600 text-sm">99.9% uptime guarantee</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-[#0033a0] to-[#0099cc] rounded-xl p-8 text-white"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Let's Talk?</h3>
              <p className="opacity-90">Talk to one of our consultants today and learn how to start leveraging your business.</p>
            </div>
            
            <form className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Service</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]">
                    <option value="">Click to Select</option>
                    <option value="ICT Consultancy">ICT Consultancy</option>
                    <option value="Internet Provision">Internet Provision</option>
                    <option value="Software Solutions">Software Solutions</option>
                    <option value="Security System Solutions">Security System Solutions</option>
                    <option value="Computer Network Design">Computer Network Design</option>
                    <option value="ICT Equipment Supply">ICT Equipment Supply</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                ></textarea>
              </div>
              
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-white text-[#0033a0] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  SEND
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}