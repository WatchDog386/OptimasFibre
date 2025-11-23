import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
// import { ThemeContext } from '../contexts/ThemeContext'; // REMOVED

// Consistent styles (simplified for light mode)
const CARD_STYLES = {
  base: 'shadow-sm transition-all duration-300',
  // Removed dark property
  light: 'bg-white border border-gray-200',
};

const BUTTON_STYLES = {
  primary: {
    base: 'py-2 px-5 rounded transition-colors duration-300 font-medium text-sm whitespace-nowrap',
    // Consolidated light mode classes
    light: 'bg-[#182b5c] hover:bg-[#0f1f45] text-white',
  },
  secondary: {
    base: 'py-2 px-5 rounded transition-colors duration-300 font-medium text-sm whitespace-nowrap',
    // Consolidated light mode classes
    light: 'border border-[#182b5c] text-[#182b5c] hover:bg-[#182b5c] hover:text-white',
  },
};

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const navigate = useNavigate();
  // const { darkMode } = useContext(ThemeContext); // REMOVED

  const handleAddPortfolio = () => {
    navigate('/admin/login');
  };

  const handleServicesClick = () => {
    navigate('/services');
  };

  const handlePortfolioClick = (item) => {
    setSelectedPortfolioItem(item);
  };

  const handleCloseModal = () => {
    setSelectedPortfolioItem(null);
  };

  const goToContact = () => {
    navigate('/contact');
  };

  const getCarouselImages = () => {
    if (portfolioItems && portfolioItems.length > 0) {
      const itemsWithImages = portfolioItems.filter(item => item.imageUrl);
      if (itemsWithImages.length > 0) {
        return itemsWithImages.slice(0, 5).map(item => item.imageUrl);
      }
    }
    return [
      "/connection.jpg",
      "/world.jpg", 
      "/fibre3.webp",
      "/city2.jpg",
      "/pipe.webp",
    ];
  };

  const services = [
    { title: "Fibre Internet", description: "High-speed connectivity solutions for homes and businesses", icon: "📡" },
    { title: "Network Design", description: "Custom network architecture tailored to your needs", icon: "🔧" },
    { title: "Installation", description: "Professional implementation of fibre infrastructure", icon: "⚡" },
    { title: "Maintenance", description: "Ongoing support and optimization services", icon: "🛠️" }
  ];

  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    if (import.meta.env.DEV) return 'http://localhost:10000';
    return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError('');
        const API_BASE_URL = getApiBaseUrl();
        const res = await fetch(`${API_BASE_URL}/api/portfolio`);
        if (!res.ok) throw new Error(`Failed to load portfolio items: ${res.status} ${res.statusText}`);
        const responseData = await res.json();

        let items = [];
        if (Array.isArray(responseData)) items = responseData;
        else if (responseData && Array.isArray(responseData.data)) items = responseData.data;
        else if (responseData && Array.isArray(responseData.items)) items = responseData.items;
        else console.warn('Unexpected API response structure:', responseData);

        setPortfolioItems(items);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setError('Unable to load portfolio items. Please check your internet connection and try again.');
        setPortfolioItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  const portfolioCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1, duration: 0.5 }
    })
  };

  return (
    <div 
      // Replaced conditional dark mode class with light mode default
      className={`about-page min-h-screen py-6 md:py-8 overflow-hidden transition-colors duration-300 bg-gray-50`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-colors duration-300 bg-white shadow-sm`}>
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
                whileHover={{ scale: 1.05, rotate: 2 }}
              />
              <motion.div 
                className="flex flex-col ml-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Used light mode text color */}
                <span className={`text-lg md:text-xl font-bold leading-tight text-[#182B5C]`}>OPTIMAS</span>
                <span className="text-lg md:text-xl font-bold text-[#d0b216] leading-tight">FIBRE</span>
              </motion.div>
            </div>
            <nav className="hidden md:flex space-x-4">
              {['Home', 'Services', 'About', 'Portfolio', 'Contact'].map((item) => (
                <motion.a 
                  key={item} 
                  href="#" 
                  // Used light mode text color
                  className={`text-xs md:text-sm font-medium transition-colors text-[#182B5C] hover:text-[#d0b216]`}
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
            <motion.button 
              // Used light mode button style
              className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Quote
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {/* Used light mode background */}
      <section className={`pt-32 pb-16 md:pb-20 relative overflow-hidden transition-colors duration-300 bg-white`}>
        <div 
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, #d0b216, transparent 40%), radial-gradient(circle at 70% 70%, #e5c845, transparent 50%)`,
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              // Used light mode text color
              className={`text-3xl md:text-4xl font-bold mb-6 text-[#182B5C]`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Optimas Fibre
            </motion.h1>
            <motion.p 
              // Used light mode text color
              className={`text-lg md:text-xl mb-10 font-light text-gray-700`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Leading Kenya's digital transformation with cutting-edge fibre solutions
            </motion.p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      {/* Used light mode background and border */}
      <section className={`py-6 border-t transition-colors duration-300 bg-white border-gray-100`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {/* Used light mode background */}
            <div className={`rounded-lg shadow-sm p-1 flex flex-wrap justify-center gap-1 bg-white`}>
              {['overview', 'portfolio'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded font-medium transition-all duration-300 text-sm ${
                    activeTab === tab
                      ? 'bg-[#182b5c] text-white shadow-md'
                      // Used light mode tab style
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
        // Used light mode background
        <section className={`py-12 md:py-16 transition-colors duration-300 bg-white`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
              <div className="w-full lg:w-1/2">
                <motion.h2 
                  className={`text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-[#182B5C]`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Who We Are
                </motion.h2>
                {/* Used light mode text color */}
                <div className={`space-y-4 md:space-y-6 text-gray-700`}>
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
                  <h3 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#182B5C]`}>
                    Integrated Fibre Solutions
                  </h3>
                  {/* Used light mode text color */}
                  <p className={'text-gray-700 mb-4 md:mb-6 text-sm md:text-base'}>
                    We provide comprehensive fibre optics solutions with specialized expertise in FTTX design, network optimization, 
                    cross-vendor product integration, rigorous testing protocols, and professional commissioning services.
                  </p>
                  <div className="mt-6 md:mt-8">
                    <motion.button 
                      onClick={handleServicesClick}
                      // Used light mode button style
                      className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Services
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="sticky top-24">
                  <h3 className={`text-xl md:text-2xl font-bold mb-6 md:mb-8 text-[#182B5C]`}>
                    Our Work
                  </h3>
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={16}
                    slidesPerView={1}
                    pagination={{ 
                      clickable: true, 
                      el: '.swiper-pagination',
                      // Used light mode pagination styles
                      bulletClass: `swiper-pagination-bullet bg-gray-300 opacity-50`,
                      bulletActiveClass: 'swiper-pagination-bullet-active !bg-[#182B5C] !opacity-100'
                    }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                    className="rounded overflow-hidden shadow-xl"
                  >
                    {getCarouselImages().map((image, index) => (
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
                            onError={(e) => {
                              e.target.src = "/word.jpg"
                              e.target.onerror = null;
                            }}
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

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-12 md:mt-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-[#182B5C] to-[#0f1e42] p-5 md:p-8 rounded text-white"
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
                className="bg-gradient-to-br from-[#d0b216] to-[#e5c845] p-5 md:p-8 rounded text-[#182B5C]"
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

            {/* Services */}
            <div className="mt-12 md:mt-20">
              <motion.h2 
                className={`text-2xl md:text-3xl font-bold mb-4 text-center text-[#182B5C]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Our Services
              </motion.h2>
              {/* Used light mode text color */}
              <p className={`text-center mb-8 md:mb-12 max-w-2xl mx-auto text-gray-600 text-sm md:text-base`}>
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
                    // Used light mode card style
                    className={`${CARD_STYLES.base} ${CARD_STYLES.light} p-4 rounded`}
                    whileHover={{ y: -3 }}
                    variants={itemVariants}
                  >
                    <div className="text-2xl md:text-3xl mb-2">{service.icon}</div>
                    {/* Used light mode text color */}
                    <h3 className={`text-sm md:text-base font-bold mb-1 text-[#182B5C]`}>{service.title}</h3>
                    {/* Used light mode text color */}
                    <p className={'text-gray-600 text-xs'}>{service.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bio */}
            <div className="mt-12 md:mt-20">
              <motion.h2 
                className={`text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-[#182B5C]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Optimas Bio
              </motion.h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {/* Used light mode text color */}
                <div className={'text-gray-700'}>
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
                {/* Used light mode background and text color */}
                <div className={`p-5 md:p-8 rounded bg-gray-50`}>
                  <h3 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#182B5C]`}>
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
                        <div className="w-1.5 h-1.5 bg-[#d0b216] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                        {/* Used light mode text color */}
                        <span className={'text-gray-700 text-xs'}>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-center">
                    <motion.button 
                      onClick={handleServicesClick}
                      // Used light mode button style
                      className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
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

      {/* ✅ UPDATED PORTFOLIO SECTION */}
      {activeTab === 'portfolio' && (
        // Used light mode background
        <section className={`py-12 md:py-16 transition-colors duration-300 bg-white`}>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8 md:mb-12">
              <div>
                <motion.h2 
                  // Used light mode text color
                  className={`text-2xl md:text-3xl font-bold mb-2 text-[#182B5C]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Our Portfolio
                </motion.h2>
                {/* Used light mode text color */}
                <p className={`max-w-2xl text-gray-600 text-sm md:text-base`}>
                  Explore our successful projects and see how we've helped businesses and communities with our fibre solutions.
                </p>
              </div>
              <motion.button 
                onClick={handleAddPortfolio}
                // Used light mode button style
                className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light} flex items-center gap-1`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Portfolio
              </motion.button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#182B5C]"></div>
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-base font-medium">No portfolio items yet.</p>
                <p className="mt-1">Click "Add Portfolio" to upload your first project.</p>
              </div>
            ) : (
              <motion.div 
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {portfolioItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    className={`flex flex-col md:flex-row ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    } gap-5 md:gap-6 p-4 bg-white border border-gray-200 rounded-sm shadow-sm`}
                    variants={portfolioCardVariants}
                    custom={index}
                    whileHover={{ y: -3 }}
                    onClick={() => handlePortfolioClick(item)}
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 w-full md:w-48 h-32 overflow-hidden rounded-sm">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzljYTBiZCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        {/* Used light mode text color */}
                        <h3 className={`text-base font-bold text-gray-900`}>
                          {item.title}
                        </h3>
                        {/* Used light mode background/text color */}
                        <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-[#182b5c]`}>
                          {item.category || 'General'}
                        </span>
                      </div>
                      <p className={`mt-2 text-xs leading-relaxed text-gray-600`}>
                        {item.description || item.content || 'No description available.'}
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        {/* Used light mode text color */}
                        <span className={`text-xs text-gray-400`}>
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 
                            item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Date not available'}
                        </span>
                        <motion.button 
                          // Used light mode button style
                          className={`text-xs font-medium px-3 py-1.5 rounded transition-colors bg-gray-100 text-gray-700 hover:bg-[#182b5c] hover:text-white`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Learn More
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Stats */}
            {portfolioItems.length > 0 && (
              <div className="mt-12 md:mt-16">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <motion.div 
                    // Used light mode background/border
                    className={`p-4 rounded text-center bg-white/80 border border-gray-200`}
                    whileHover={{ y: -3 }}
                  >
                    <div className="text-2xl font-bold text-[#d0b216]">{portfolioItems.length}</div>
                    {/* Used light mode text color */}
                    <div className={`text-xs font-medium text-gray-700`}>Total Projects</div>
                  </motion.div>
                  <motion.div 
                    // Used light mode background/border
                    className={`p-4 rounded text-center bg-white/80 border border-gray-200`}
                    whileHover={{ y: -3 }}
                  >
                    <div className="text-2xl font-bold text-[#d0b216]">
                      {new Set(portfolioItems.map(item => item.category)).size}
                    </div>
                    {/* Used light mode text color */}
                    <div className={`text-xs font-medium text-gray-700`}>Categories</div>
                  </motion.div>
                  <motion.div 
                    // Used light mode background/border
                    className={`p-4 rounded text-center bg-white/80 border border-gray-200`}
                    whileHover={{ y: -3 }}
                  >
                    <div className="text-2xl font-bold text-[#d0b216]">{Math.floor(Math.random() * 50) + 10}+</div>
                    {/* Used light mode text color */}
                    <div className={`text-xs font-medium text-gray-700`}>Happy Clients</div>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Portfolio Modal */}
      {selectedPortfolioItem && (
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal}
        >
          <motion.div 
            // Used light mode background
            className={`max-w-2xl w-full rounded overflow-hidden max-h-[90vh] overflow-y-auto bg-white`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 md:h-64">
              {selectedPortfolioItem.imageUrl ? (
                <img 
                  src={selectedPortfolioItem.imageUrl} 
                  alt={selectedPortfolioItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Used light mode background
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              )}
              <button 
                onClick={handleCloseModal}
                className="absolute top-3 right-3 w-7 h-7 rounded bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-5 md:p-6">
              <h3 className={`text-xl font-bold mb-2 text-[#182B5C]`}>
                {selectedPortfolioItem.title}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {/* Used light mode background/text color */}
                <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-[#182b5c]`}>
                  {selectedPortfolioItem.category || 'General'}
                </span>
                {/* Used light mode text color */}
                <span className={`text-xs text-gray-600`}>
                  {selectedPortfolioItem.publishedAt ? new Date(selectedPortfolioItem.publishedAt).toLocaleDateString() : 
                    selectedPortfolioItem.uploadedAt ? new Date(selectedPortfolioItem.uploadedAt).toLocaleDateString() : 'Date not available'}
                </span>
              </div>
              {/* Used light mode text color */}
              <p className={`text-sm leading-relaxed text-gray-700`}>
                {selectedPortfolioItem.description || selectedPortfolioItem.content || 'No description available.'}
              </p>
              <div className="mt-6 flex gap-3">
                <motion.button 
                  onClick={goToContact}
                  className={`flex-1 py-2.5 rounded font-medium text-sm bg-[#182b5c] text-white hover:bg-[#0f1f45]`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contact About Project
                </motion.button>
                <motion.button 
                  onClick={handleCloseModal}
                  // Used light mode button style
                  className={`px-4 py-2.5 rounded font-medium text-sm border border-gray-300 text-gray-700 hover:border-[#182b5c] hover:text-[#182b5c]`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default About;