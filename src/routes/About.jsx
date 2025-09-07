import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLearnMore, setShowLearnMore] = useState(false);
  const navigate = useNavigate();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const slideUp = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const staggerItem = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  const handleServicesClick = () => {
    navigate('/services');
  };

  const handlePortfolioClick = () => {
    navigate('/portfolio');
  };

  const handleGalleryClick = () => {
    navigate('/gallery');
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  const handleGetQuoteClick = () => {
    navigate('/quote');
  };

  // Gallery Images
  const galleryImages = [
    "/connection.jpg",
    "/work.jpg",
    "/fibre3.webp",
    "/city2.jpg",
    "/pipe.webp",
  ];

  // Services Data
  const services = [
    {
      title: "Fiber Internet",
      description: "High-speed connectivity solutions for homes and businesses",
      icon: "📡",
      link: "/services#fiber"
    },
    {
      title: "Network Design",
      description: "Custom network architecture tailored to your needs",
      icon: "🔧",
      link: "/services#design"
    },
    {
      title: "Installation",
      description: "Professional implementation of fiber infrastructure",
      icon: "⚡",
      link: "/services#installation"
    },
    {
      title: "Maintenance",
      description: "Ongoing support and optimization services",
      icon: "🛠️",
      link: "/services#maintenance"
    }
  ];

  // Portfolio Projects
  const portfolioProjects = [
    {
      id: 1,
      title: "Westlands Business District",
      description: "Fiber optic network installation for commercial high-rises",
      completion: "Jan 2023",
      image: "/work2.jpg",
      link: "/portfolio#westlands",
      category: "Commercial",
      technologies: ["FTTH", "GPON", "10G Ethernet"]
    },
    {
      id: 2,
      title: "Karen Residential Estate",
      description: "FTTH (Fiber to the Home) deployment for upscale community",
      completion: "Mar 2023",
      image: "/connection.jpg",
      link: "/portfolio#karen",
      category: "Residential",
      technologies: ["FTTH", "WiFi Mesh", "Smart Home Integration"]
    },
    {
      id: 3,
      title: "Industrial Park Connectivity",
      description: "Dedicated fiber lines for manufacturing facilities",
      completion: "Jun 2023",
      image: "/pipe.webp",
      link: "/portfolio#industrial",
      category: "Industrial",
      technologies: ["Dedicated Fiber", "Redundant Links", "Industrial Ethernet"]
    },
    {
      id: 4,
      title: "University Campus Network",
      description: "Campus-wide high-speed internet for education institution",
      completion: "Aug 2023",
      image: "/work2.JPG",
      link: "/portfolio#campus",
      category: "Education",
      technologies: ["Campus Network", "Eduroam", "High-Density WiFi"]
    },
    {
      id: 5,
      title: "Healthcare Facility Upgrade",
      description: "Reliable connectivity for hospital digital systems",
      completion: "Oct 2023",
      image: "/fibre3.webp",
      link: "/portfolio#healthcare",
      category: "Healthcare",
      technologies: ["Medical IoT", "Low Latency", "High Availability"]
    },
    {
      id: 6,
      title: "Shopping Complex Deployment",
      description: "Public WiFi and tenant connectivity solutions",
      completion: "Dec 2023",
      image: "/connection.jpg",
      link: "/portfolio#shopping",
      category: "Retail",
      technologies: ["Public WiFi", "Multi-Tenant", "Guest Portal"]
    }
  ];

  // Reviews Data
  const reviews = [
    {
      id: 1,
      name: "James Mwangi",
      company: "Tech Solutions Ltd.",
      comment: "Optimas Fiber transformed our office connectivity. We've seen a 40% increase in productivity since installation.",
      rating: 5,
      date: "March 15, 2023"
    },
    {
      id: 2,
      name: "Sarah Kimani",
      company: "Karen Residence Association",
      comment: "The professional installation and ongoing support have been exceptional. Our community finally has reliable internet.",
      rating: 5,
      date: "April 2, 2023"
    },
    {
      id: 3,
      name: "David Ochieng",
      company: "Nairobi University",
      comment: "The campus-wide fiber network has revolutionized our digital learning capabilities. The implementation was seamless.",
      rating: 4,
      date: "June 28, 2023"
    },
    {
      id: 4,
      name: "Grace Wanjiku",
      company: "Westlands Business Tower",
      comment: "As a property manager, I appreciate Optimas' minimal disruption during installation and their responsive maintenance team.",
      rating: 5,
      date: "August 12, 2023"
    }
  ];

  // Learn More Content
  const learnMoreContent = (
    <div className="bg-gradient-to-br from-[#182B5C] to-[#0f1e42] text-white p-8 rounded-xl mt-6 shadow-lg">
      <h3 className="text-2xl font-bold mb-4">Why Choose Optimas Fiber?</h3>
      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <p><strong>Future-Ready Infrastructure:</strong> We deploy state-of-the-art fiber optic networks that support gigabit+ speeds, ensuring your home or business stays ahead in a digital-first world.</p>
        <p><strong>Reliability & Low Latency:</strong> Unlike traditional copper cables, our fiber connections offer unmatched reliability, minimal signal loss, and ultra-low latency — ideal for cloud services, video conferencing, and IoT.</p>
        <p><strong>Scalable Solutions:</strong> Whether you're a startup or a large enterprise, our modular network design allows seamless scaling as your bandwidth needs grow.</p>
        <p><strong>Sustainable Technology:</strong> Fiber uses light instead of electricity, consuming less power and offering a greener alternative for long-term digital infrastructure.</p>
        <p><strong>Local Expertise, Global Standards:</strong> As a Kenyan leader in fiber integration, we combine international best practices with deep local knowledge to deliver robust, cost-effective networks across urban and rural areas.</p>
        <p><strong>24/7 Monitoring & Support:</strong> Our maintenance team ensures uptime with proactive monitoring, rapid response times, and SLA-backed service guarantees.</p>
      </div>
      <motion.button
        onClick={() => setShowLearnMore(false)}
        className="mt-4 bg-white text-[#182B5C] px-5 py-2 rounded font-semibold text-sm"
        whileHover={{ scale: 1.05 }}
      >
        Close
      </motion.button>
    </div>
  );

  // Render star ratings
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>★</span>
    ));
  };

  return (
    <div className="about-page bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300 pt-16">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#182B5C] via-[#0f1e42] to-[#182B5C] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Optimas Fiber
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white opacity-90 mb-10 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Leading Kenya's digital transformation with cutting-edge fiber solutions
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center space-x-4"
            >
              <motion.button 
                className="inline-block bg-[#d0b216] hover:bg-[#b89b14] text-[#182B5C] px-8 py-3.5 rounded-md font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabClick('contact')}
              >
                Contact Us
              </motion.button>
              <motion.button 
                onClick={handleServicesClick}
                className="inline-block border-2 border-white text-white hover:bg-white hover:text-[#182B5C] px-8 py-3.5 rounded-md font-semibold transition-colors"
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
      <section className="py-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-2 overflow-x-auto">
            {['overview', 'portfolio', 'gallery', 'reviews', 'contact'].map((tab) => (
              <motion.button
                key={tab}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-[#182B5C] text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-[#182B5C] dark:hover:text-[#d0b216] hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleTabClick(tab)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="w-full lg:w-1/2">
                <motion.h2 
                  className="text-3xl font-bold text-[#182B5C] dark:text-white mb-8"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  Who We Are
                </motion.h2>
                
                <div className="space-y-6 text-gray-700 dark:text-gray-300">
                  <p className="text-lg leading-relaxed">
                    Optimas Fiber is a premier Kenyan systems integrator with a distinguished reputation in telecommunications. 
                    We deliver comprehensive end-to-end solutions including innovative design, premium supply, precision installation, 
                    expert commissioning, and reliable maintenance of cutting-edge fiber optic systems.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Our expertise has evolved from foundational infrastructure design to encompass comprehensive Internet Service Provision, 
                    advanced network configuration, and sophisticated management services, positioning us as leaders in Kenya's digital transformation.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Our team of seasoned professionals maintains strategic relationships with technology vendors across the region, 
                    ensuring exceptional service delivery that consistently meets time constraints and exceeds quality expectations.
                  </p>
                </div>

                <div className="mt-12">
                  <h3 className="text-2xl font-semibold text-[#182B5C] dark:text-white mb-6">Integrated Fiber Solutions</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    We provide comprehensive fiber optics solutions with specialized expertise in FTTX design, network optimization, 
                    cross-vendor product integration, rigorous testing protocols, and professional commissioning services.
                  </p>
                  
                  <motion.button 
                    onClick={() => setShowLearnMore(!showLearnMore)}
                    className="inline-flex items-center bg-[#182B5C] hover:bg-[#0f7dcc] text-white px-6 py-3.5 rounded-md font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showLearnMore ? 'Show Less' : 'Learn More'}
                    <svg className={`w-5 h-5 ml-2 transform ${showLearnMore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </motion.button>

                  {showLearnMore && learnMoreContent}
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="sticky top-24">
                  <h3 className="text-2xl font-semibold text-[#182B5C] dark:text-white mb-8">Our Work</h3>
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={20}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                    loop
                    className="rounded-xl overflow-hidden shadow-xl"
                  >
                    {galleryImages.map((image, index) => (
                      <SwiperSlide key={index}>
                        <div className="h-96 w-full">
                          <img 
                            src={image} 
                            alt={`Optimas Fiber project ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                            <h4 className="text-white text-xl font-semibold">Project {index + 1}</h4>
                            <p className="text-gray-200">Fiber optic installation</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="text-center mt-6">
                    <motion.button 
                      onClick={() => handleTabClick('portfolio')}
                      className="inline-flex items-center text-[#182B5C] dark:text-[#d0b216] font-semibold"
                      whileHover={{ x: 5 }}
                    >
                      View Full Portfolio
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
              <motion.div 
                className="bg-gradient-to-br from-[#182B5C] to-[#0f1e42] p-8 rounded-xl text-white"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
                <p className="opacity-90">
                  Deliver cost-effective, detail-oriented fiber solutions that exceed client expectations through innovation and technical excellence.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-[#d0b216] to-[#e5c845] p-8 rounded-xl text-[#182B5C]"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
                <p>
                  To become Africa's leading technology solutions provider, delivering world-class digital infrastructure that transforms communities and empowers businesses.
                </p>
              </motion.div>
            </div>

            {/* Services */}
            <div className="mt-20">
              <motion.h2 
                className="text-3xl font-bold text-[#182B5C] dark:text-white mb-4 text-center"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                Our Services
              </motion.h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Comprehensive fiber solutions tailored to meet the evolving needs of businesses and communities across Kenya.
              </p>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {services.map((service, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    variants={staggerItem}
                    whileHover={{ y: 5 }}
                    onClick={() => navigate(service.link)}
                  >
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className="text-xl font-semibold text-[#182B5C] dark:text-white mb-2">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                    <div className="mt-4 text-[#182B5C] dark:text-[#d0b216] text-sm font-semibold flex items-center">
                      Learn more
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="text-center mt-10">
                <motion.button 
                  onClick={handleServicesClick}
                  className="bg-[#d0b216] hover:bg-[#b89b14] text-[#182B5C] px-8 py-3.5 rounded-md font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Services
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-3xl font-bold text-[#182B5C] dark:text-white mb-4 text-center" variants={fadeIn} initial="hidden" animate="visible">
              Our Portfolio
            </motion.h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Explore our successful projects and see how we've helped businesses and communities with our fiber solutions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioProjects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  className="group bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-600 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(project.link)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-[#182B5C] text-white text-xs font-medium rounded-full">
                        {project.category}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                      <p className="text-gray-200 text-sm mt-1">{project.completion}</p>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Completed: {project.completion}</span>
                      <div className="text-[#182B5C] dark:text-[#d0b216] font-semibold text-sm transition-colors flex items-center group-hover:text-[#0f7dcc]">
                        View Project
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <motion.button 
                onClick={handleGetQuoteClick}
                className="bg-gradient-to-r from-[#182B5C] to-[#0f7dcc] hover:from-[#0f7dcc] hover:to-[#182B5C] text-white px-8 py-3.5 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Project
              </motion.button>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-3xl font-bold text-[#182B5C] dark:text-white mb-4 text-center" variants={fadeIn} initial="hidden" animate="visible">
              Our Gallery
            </motion.h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              A visual journey through our projects and the quality work we deliver.
            </p>
            
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
              {galleryImages.map((image, index) => (
                <motion.div 
                  key={index}
                  className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  variants={staggerItem}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleTabClick('gallery')}
                >
                  <div className="h-56 w-full relative overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Optimas Fiber gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <motion.button 
                onClick={handleContactClick}
                className="bg-[#d0b216] hover:bg-[#b89b14] text-[#182B5C] px-8 py-3.5 rounded-md font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Request More Images
              </motion.button>
            </div>
          </div>
        </section>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-3xl font-bold text-[#182B5C] dark:text-white mb-4 text-center" variants={fadeIn} initial="hidden" animate="visible">
              Client Reviews
            </motion.h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Hear what our clients have to say about our services and solutions.
            </p>
            
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={staggerContainer} initial="hidden" animate="visible">
              {reviews.map((review) => (
                <motion.div 
                  key={review.id}
                  className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600"
                  variants={staggerItem}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#182B5C] to-[#0f7dcc] rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#182B5C] dark:text-white">{review.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{review.company}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic">{review.date}</p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <motion.button 
                onClick={handleContactClick}
                className="bg-[#182B5C] hover:bg-[#0f7dcc] text-white px-8 py-3.5 rounded-md font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Share Your Experience
              </motion.button>
            </div>
          </div>
        </section>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-[#182B5C] dark:text-white mb-4">Get In Touch</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Have questions about our services or need a custom solution? Reach out to our team today.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your email address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Service</label>
                    <select 
                      id="service" 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a service</option>
                      <option value="fiber-internet">Fiber Internet</option>
                      <option value="network-design">Network Design</option>
                      <option value="installation">Installation</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Message</label>
                  <textarea 
                    id="message" 
                    rows="5" 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <div className="text-center">
                  <motion.button 
                    type="submit" 
                    className="bg-[#182B5C] hover:bg-[#0f7dcc] text-white px-8 py-3.5 rounded-lg font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    SEND MESSAGE
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#182B5C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#182B5C] dark:text-white mb-2">Phone</h3>
                <p className="text-gray-600 dark:text-gray-300">+254 710 888 022</p>
                <p className="text-gray-600 dark:text-gray-300">+254 734 888 022</p>
              </div>
              
              <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#182B5C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#182B5C] dark:text-white mb-2">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">info@optimasfiber.com</p>
                <p className="text-gray-600 dark:text-gray-300">support@optimasfiber.com</p>
              </div>
              
              <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#182B5C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#182B5C] dark:text-white mb-2">Address</h3>
                <p className="text-gray-600 dark:text-gray-300">Nairobi, Kenya</p>
                <p className="text-gray-600 dark:text-gray-300">Westlands Business District</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;