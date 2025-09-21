import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { ThemeContext } from '../contexts/ThemeContext';

// Define consistent button and card styles
const CARD_STYLES = {
  base: 'rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5',
  dark: 'bg-gray-800 border border-gray-700',
  light: 'bg-white border border-gray-200',
  hover: { y: -3 }
};

// ✅ UPDATED BUTTON STYLES — SHORTER, NATURAL WIDTH, NO ICONS
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
  }
};

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  // Navigation handler
  const handleServicesClick = () => {
    navigate('/services');
  };

  // Image gallery data
  const galleryImages = [
    "/connection.jpg",
    "/world.jpg",
    "/fibre3.webp",
    "/city2.jpg",
    "/pipe.webp",
  ];

  // Services data
  const services = [
    {
      title: "Fibre Internet",
      description: "High-speed connectivity solutions for homes and businesses",
      icon: "📡"
    },
    {
      title: "Network Design",
      description: "Custom network architecture tailored to your needs",
      icon: "🔧"
    },
    {
      title: "Installation",
      description: "Professional implementation of fibre infrastructure",
      icon: "⚡"
    },
    {
      title: "Maintenance",
      description: "Ongoing support and optimization services",
      icon: "🛠️"
    }
  ];

  // Fetch portfolio items from backend
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError('');
        // ✅ FIXED: Removed extra spaces from URL
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
        const res = await fetch(`${API_BASE_URL}/api/portfolio`);
        
        if (!res.ok) {
          throw new Error(`Failed to load portfolio items: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        setPortfolioItems(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setError('Unable to load portfolio items. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

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

  return (
    <div 
      className={`about-page min-h-screen py-6 md:py-8 overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-white shadow-sm'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <motion.img 
                src="/oppo.jpg" 
                alt="Optimas Fibre" 
                className="h-10 w-10 object-contain rounded-full border-2 border-[#d0b216]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: 2,
                  transition: { duration: 0.2 }
                }}
              />
              <motion.div 
                className="flex flex-col ml-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className={`text-lg md:text-xl font-bold leading-tight ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                }`}>OPTIMAS</span>
                <span className="text-lg md:text-xl font-bold text-[#d0b216] leading-tight">FIBRE</span>
              </motion.div>
            </div>
            <nav className="hidden md:flex space-x-4">
              {['Home', 'Services', 'About', 'Portfolio', 'Contact'].map((item) => (
                <motion.a 
                  key={item} 
                  href="#" 
                  className={`text-xs md:text-sm font-medium transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:text-[#d0b216]' 
                      : 'text-[#182B5C] hover:text-[#d0b216]'
                  }`}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
            <motion.button 
              className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Quote
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pb-20 bg-white relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, #d0b216, transparent 40%), 
                              radial-gradient(circle at 70% 70%, #e5c845, transparent 50%)`,
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-[#182B5C] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Optimas Fibre
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-700 mb-10 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Leading Kenya's digital transformation with cutting-edge fibre solutions
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4"
            >
              <motion.a 
                href="#contact" 
                className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.a>
              <motion.button 
                onClick={handleServicesClick}
                className={`${BUTTON_STYLES.secondary.base} ${darkMode ? BUTTON_STYLES.secondary.dark : BUTTON_STYLES.secondary.light}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Our Services
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className={`py-6 border-t transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className={`rounded-lg shadow-sm p-1 flex flex-wrap justify-center gap-1 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {['overview', 'portfolio'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                    activeTab === tab
                      ? 'bg-[#182b5c] text-white shadow-md'
                      : darkMode
                        ? 'text-gray-400 hover:text-[#d0b216] hover:bg-gray-700'
                        : 'text-gray-600 hover:text-[#182b5c] hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <section className={`py-12 md:py-16 transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
              {/* Left Column - Text Content */}
              <div className="w-full lg:w-1/2">
                <motion.h2 
                  className={`text-2xl md:text-3xl font-bold mb-6 md:mb-8 ${
                    darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Who We Are
                </motion.h2>
                
                <div className={`space-y-4 md:space-y-6 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed">
                    Optimas Fibre is a premier Kenyan systems integrator with a distinguished reputation in telecommunications. 
                    We deliver comprehensive end-to-end solutions including innovative design, premium supply, precision installation, 
                    expert commissioning, and reliable maintenance of cutting-edge fibre optic systems.
                  </p>
                  
                  <p className="text-sm md:text-base leading-relaxed">
                    Our expertise has evolved from foundational infrastructure design to encompass comprehensive Internet Service Provision, 
                    advanced network configuration, and sophisticated management services, positioning us as leaders in Kenya's digital transformation.
                  </p>
                  
                  <p className="text-sm md:text-base leading-relaxed">
                    Our team of seasoned professionals maintains strategic relationships with technology vendors across the region, 
                    ensuring exceptional service delivery that consistently meets time constraints and exceeds quality expectations.
                  </p>
                </div>
                
                <div className="mt-8 md:mt-12">
                  <h3 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${
                    darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                  }`}>
                    Integrated Fibre Solutions
                  </h3>
                  <p className={darkMode ? 'text-gray-300 mb-4 md:mb-6 text-sm md:text-base' : 'text-gray-700 mb-4 md:mb-6 text-sm md:text-base'}>
                    We provide comprehensive fibre optics solutions with specialized expertise in FTTX design, network optimization, 
                    cross-vendor product integration, rigorous testing protocols, and professional commissioning services.
                  </p>
                  
                  <div className="mt-6 md:mt-8">
                    <motion.button 
                      onClick={handleServicesClick}
                      className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Services
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Image Carousel */}
              <div className="w-full lg:w-1/2">
                <div className="sticky top-24">
                  <h3 className={`text-xl md:text-2xl font-bold mb-6 md:mb-8 ${
                    darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                  }`}>
                    Our Work
                  </h3>
                  
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={16}
                    slidesPerView={1}
                    pagination={{ 
                      clickable: true, 
                      el: '.swiper-pagination',
                      bulletClass: `swiper-pagination-bullet ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      } opacity-50`,
                      bulletActiveClass: 'swiper-pagination-bullet-active !bg-[#182B5C] !opacity-100'
                    }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                    className="rounded-xl overflow-hidden shadow-xl"
                  >
                    {galleryImages.map((image, index) => (
                      <SwiperSlide key={index}>
                        <motion.div 
                          className="h-64 md:h-80 lg:h-96 w-full relative"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <img 
                            src={image} 
                            alt={`Optimas Fibre project ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6">
                            <h4 className="text-white text-base md:text-lg font-semibold">Project {index + 1}</h4>
                            <p className="text-gray-200 text-xs md:text-sm">Fibre optic installation</p>
                          </div>
                        </motion.div>
                      </SwiperSlide>
                    ))}
                    <div className="swiper-pagination mt-3 md:mt-4"></div>
                  </Swiper>
                </div>
              </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-12 md:mt-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-[#182B5C] to-[#0f1e42] p-5 md:p-8 rounded-xl text-white"
                whileHover={{ y: -5 }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 md:mb-6">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Our Mission</h3>
                <p className="opacity-90 text-sm md:text-base">
                  Deliver cost-effective, detail-oriented fibre solutions that exceed client expectations through innovation and technical excellence.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-[#d0b216] to-[#e5c845] p-5 md:p-8 rounded-xl text-[#182B5C]"
                whileHover={{ y: -5 }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/30 rounded-full flex items-center justify-center mb-3 md:mb-6">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Our Vision</h3>
                <p className="text-sm md:text-base">
                  To become Africa's leading technology solutions provider, delivering world-class digital infrastructure that transforms communities and empowers businesses.
                </p>
              </motion.div>
            </div>

            {/* Services Section */}
            <div className="mt-12 md:mt-20">
              <motion.h2 
                className={`text-2xl md:text-3xl font-bold mb-4 text-center ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Our Services
              </motion.h2>
              <p className={`text-center mb-8 md:mb-12 max-w-2xl mx-auto ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } text-sm md:text-base`}>
                Comprehensive fibre solutions tailored to meet the evolving needs of businesses and communities across Kenya.
              </p>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    className={`${CARD_STYLES.base} ${darkMode ? CARD_STYLES.dark : CARD_STYLES.light}`}
                    whileHover={CARD_STYLES.hover}
                    variants={itemVariants}
                  >
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4">{service.icon}</div>
                    <h3 className={`text-base md:text-lg font-bold mb-2 ${
                      darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                    }`}>{service.title}</h3>
                    <p className={darkMode ? 'text-gray-400 text-xs md:text-sm' : 'text-gray-600 text-xs md:text-sm'}>{service.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Company Bio */}
            <div className="mt-12 md:mt-20">
              <motion.h2 
                className={`text-2xl md:text-3xl font-bold mb-6 md:mb-8 ${
                  darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Optimas Bio
              </motion.h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <p className="mb-4 md:mb-6 text-sm md:text-base leading-relaxed">
                    Optimas Fibre was founded by a team of telecommunications experts with over a decade of industry experience, 
                    united by a vision to bridge the gap between user expectations and provider capabilities in Kenya's rapidly evolving digital landscape.
                  </p>
                  
                  <p className="text-sm md:text-base leading-relaxed">
                    We questioned the status quo of internet connectivity in our region and committed to implementing 
                    projects with higher standards, focusing on creativity, innovation, and technical excellence to deliver 
                    superior convenience and unparalleled client satisfaction.
                  </p>

                  <p className="mt-6 text-sm md:text-base leading-relaxed">
                    Today, Optimas Fibre stands as a testament to our commitment to quality, with a growing portfolio of successful 
                    projects that have transformed connectivity for businesses, institutions, and communities across Kenya.
                  </p>
                </div>
                
                <div className={`p-5 md:p-8 rounded-xl ${
                  darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${
                    darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                  }`}>
                    Our Expertise
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3 md:gap-4 mb-6 md:mb-8">
                    {['FTTX Design & Implementation', 'Network Optimization', 'Cross-Vendor Product Integration', 
                      'Testing & Commissioning', 'Training & Certification', 'Ongoing Maintenance & Support'].map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-[#d0b216] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className={darkMode ? 'text-gray-300 text-xs md:text-sm' : 'text-gray-700 text-xs md:text-sm'}>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <motion.button 
                      onClick={handleServicesClick}
                      className={`${BUTTON_STYLES.primary.base} ${darkMode ? BUTTON_STYLES.primary.dark : BUTTON_STYLES.primary.light}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Services
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {activeTab === 'portfolio' && (
        <section className={`py-12 md:py-16 transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className="container mx-auto px-4">
            <motion.h2 
              className={`text-2xl md:text-3xl font-bold mb-4 text-center ${
                darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our Portfolio
            </motion.h2>
            <p className={`text-center mb-8 md:mb-12 max-w-2xl mx-auto ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm md:text-base`}>
              Explore our successful projects and see how we've helped businesses and communities with our fibre solutions.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#182B5C]"></div>
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-lg font-medium">No portfolio items yet.</p>
                <p className="mt-2">Admin can add portfolio items via the dashboard.</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {portfolioItems.map((item) => (
                  <motion.div
                    key={item._id}
                    className={`${CARD_STYLES.base} ${darkMode ? CARD_STYLES.dark : CARD_STYLES.light}`}
                    whileHover={CARD_STYLES.hover}
                    variants={itemVariants}
                  >
                    {item.imageUrl && (
                      <div className="h-48 md:h-56 overflow-hidden rounded-lg mb-4">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className={`text-base md:text-lg font-bold mb-2 ${
                        darkMode ? 'text-[#d0b216]' : 'text-[#182B5C]'
                      }`}>{item.title}</h3>
                      <p className={`text-xs md:text-sm mb-2 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {item.category || 'General'}
                      </p>
                      <p className={`mb-4 text-xs md:text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default About;