import React, { useState } from "react";
import { CheckCircle, Clock, HardHat, Wifi, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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
    name: "6 Mbps Plan",
    price: "Ksh 1,500",
    speed: "6Mbps",
    image: unsplashImages.basic,
    features: ["Great for browsing", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    name: "12 Mbps Plan",
    price: "Ksh 2,000",
    speed: "12Mbps",
    image: unsplashImages.essential,
    features: ["Streaming & Social Media", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    name: "20 Mbps Plan",
    price: "Ksh 2,500",
    speed: "20Mbps",
    image: unsplashImages.family,
    features: ["Work from Home", "Streaming", "24/7 Support", "Free Installation"],
    type: "home",
    popular: true
  },
  {
    name: "30 Mbps Plan",
    price: "Ksh 3,000",
    speed: "30Mbps",
    image: unsplashImages.streaming,
    features: ["Multiple Devices", "Low Latency", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    name: "40 Mbps Plan",
    price: "Ksh 4,000",
    speed: "40Mbps",
    image: unsplashImages.pro,
    features: ["Heavy Streaming", "Gaming Ready", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    name: "60 Mbps Plan",
    price: "Ksh 6,000",
    speed: "60Mbps",
    image: unsplashImages.premium,
    features: ["High-Speed Everything", "Gaming & 4K", "24/7 Support", "Free Installation"],
    type: "home",
    popular: false
  },
  {
    name: "Business Basic",
    price: "Ksh 8,000",
    speed: "50Mbps",
    image: unsplashImages.business,
    features: ["5 IP phones", "3 Static IPs", "Priority support", "99.5% uptime"],
    type: "business",
    popular: false
  },
  {
    name: "Business Plus",
    price: "Ksh 15,000",
    speed: "100Mbps",
    image: unsplashImages.business,
    features: ["10 IP phones", "5 Static IPs", "Dedicated line", "99.9% uptime"],
    type: "business",
    popular: true
  },
  {
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

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      connectionType: plan.name
    }));
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const whatsappNumber = "254101964632";
    const message = `New Connection Request:%0A%0A` +
                   `*Name:* ${formData.name}%0A` +
                   `*Phone:* ${formData.phone}%0A` +
                   `*Email:* ${formData.email}%0A` +
                   `*Location:* ${formData.location}%0A` +
                   `*Connection Type:* ${formData.connectionType}%0A%0A` +
                   `I would like to get connected!`;
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      connectionType: ''
    });
    setShowForm(false);
    setSelectedPlan(null);
  };

  const filteredPlans = plans.filter(plan => plan.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section with VTL-inspired design */}
      <section className="relative bg-gradient-to-r from-[#0033a0] to-[#0099cc] text-white py-20">
        <div className="container mx-auto px-4 text-center">
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
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
            <div className="inline-flex rounded-lg bg-gray-200 p-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-6 py-3 rounded-md font-medium ${activeTab === "home" ? "bg-[#0033a0] text-white" : "text-gray-700 hover:text-gray-900"}`}
              >
                Home Plans
              </button>
              <button
                onClick={() => setActiveTab("business")}
                className={`px-6 py-3 rounded-md font-medium ${activeTab === "business" ? "bg-[#0033a0] text-white" : "text-gray-700 hover:text-gray-900"}`}
              >
                Business Plans
              </button>
              <button
                onClick={() => setActiveTab("enterprise")}
                className={`px-6 py-3 rounded-md font-medium ${activeTab === "enterprise" ? "bg-[#0033a0] text-white" : "text-gray-700 hover:text-gray-900"}`}
              >
                Enterprise
              </button>
            </div>
          </div>

          {/* Plans Grid with VTL-inspired design */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow relative ${plan.popular ? 'ring-2 ring-[#0033a0] ring-opacity-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#0033a0] text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
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
                <div className="p-6">
                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-[#0099cc] mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className="w-full bg-[#0033a0] text-white py-3 rounded-lg font-semibold hover:bg-[#00257a] transition-colors flex items-center justify-center"
                  >
                    Get Connected
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Connection Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#0033a0]">Get {selectedPlan?.name}</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0033a0]"
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
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-6.29-3.062c-.545 0-1-.448-1-1s.445-1 1-1c.552 0 1 .448 1 1s-.443 1-1 1m4 0c-.545 0-1-.448-1-1s.445-1 1-1c.552 0 1 .448 1 1s-.443 1-1 1m2.005 9.644c-.366-.01-1.422-.361-2.053-.616l-.086-.035c-.487-.199-1.153-.473-1.623-.762-.543-.333-.915-.669-1.279-1.141-.432-.561-.757-1.236-.964-1.821l-.013-.034c-.309-.84-.175-1.579.024-2.192l.013-.034c.099-.24.260-.624.260-.624s-.159-.397-.198-.606c-.40-.209-.05-.359-.099-.568-.05-.208-.248-.52-.446-.669-.198-.149-.471-.258-.97-.258-.322 0-.644.025-.966.074-.309.05-.619.124-.929.198-.396.099-1.108.347-1.564.644-.447.297-.828.694-1.04 1.141-.223.471-.347 1.033-.347 1.702 0 .669.124 1.379.471 2.118l.013.034c.396.941 1.104 2.06 1.806 2.809.744.793 1.678 1.416 2.488 1.821l.074.037c.669.322 1.847.793 2.379.941.396.112.828.174 1.213.174.57 0 1.074-.062 1.49-.211.446-.160.832-.471 1.104-.941.272-.471.347-1.033.248-1.604-.074-.458-.322-.907-.644-1.191a1.49 1.49 0 00-.793-.347c-.124-.025-.223-.033-.322-.033" />
                      </svg>
                      Send via WhatsApp
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-center text-[#0033a0] mb-8">All Plans Include</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-[#0033a0] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-semibold text-[#0033a0] mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">Round-the-clock technical assistance</p>
              </div>
              <div className="text-center">
                <div className="bg-[#0033a0] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HardHat className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-semibold text-[#0033a0] mb-2">Quick Installation</h4>
                <p className="text-gray-600 text-sm">Professional setup within 48 hours</p>
              </div>
              <div className="text-center">
                <div className="bg-[#0033a0] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-semibold text-[#0033a0] mb-2">Low Latency</h4>
                <p className="text-gray-600 text-sm">&lt;5ms ping for gaming</p>
              </div>
              <div className="text-center">
                <div className="bg-[#0033a0] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-semibold text-[#0033a0] mb-2">Free Router</h4>
                <p className="text-gray-600 text-sm">High-quality router included</p>
              </div>
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
                <button
                  type="submit"
                  className="bg-white text-[#0033a0] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  SEND
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}