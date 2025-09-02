import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Image gallery data
  const galleryImages = [
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ];

  // Thumbnail images
  const thumbnailImages = [
    "https://images.unsplash.com/photo-1592928304669-9d5e0a6dd455?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  ];

  // Stats data
  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '500+', label: 'Projects Completed' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '24/7', label: 'Support' }
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

  return (
    <div className="about-page bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Optimas Fibre" 
                className="h-10"
              />
            </div>
            <nav className="hidden md:flex space-x-8">
              {['Home', 'Services', 'About', 'Portfolio', 'Contact'].map((item) => (
                <a key={item} href="#" className="text-[#182B5C] hover:text-[#d0b216] font-medium transition-colors text-sm">
                  {item}
                </a>
              ))}
            </nav>
            <button className="bg-[#d0b216] hover:bg-[#b89b14] text-white px-5 py-2.5 rounded-md font-medium transition-colors text-sm">
              Get Quote
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#182B5C] via-[#0f7dcc] to-[#182B5C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-white"></div>
        <div className="absolute top-0 right-0 -mt-16 mr-16 w-64 h-64 bg-[#d0b216] opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-16 ml-16 w-64 h-64 bg-[#d0b216] opacity-10 rounded-full"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Optimas Fibre
            </motion.h1>
            <motion.p 
              className="text-xl text-white opacity-90 mb-10 font-light"
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
              className="flex justify-center space-x-4"
            >
              <a 
                href="#contact" 
                className="inline-block bg-[#d0b216] hover:bg-[#b89b14] text-white px-8 py-3.5 rounded-md font-semibold transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="#services" 
                className="inline-block border-2 border-white text-white hover:bg-white hover:text-[#182B5C] px-8 py-3.5 rounded-md font-semibold transition-colors"
              >
                Our Services
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-[#182B5C] mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-6 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-2">
            {['overview', 'portfolio', 'gallery', 'contact'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === tab ? 'bg-[#182B5C] text-white shadow-md' : 'text-gray-600 hover:text-[#182B5C] hover:bg-gray-50'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16">
              {/* Left Column - Text Content */}
              <div className="w-full lg:w-1/2">
                <motion.h2 
                  className="text-3xl font-bold text-[#182B5C] mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Who We Are
                </motion.h2>
                
                <div className="space-y-6 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Optimas Fibre is a premier Kenyan systems integrator with a distinguished reputation in telecommunications. 
                    We deliver comprehensive end-to-end solutions including innovative design, premium supply, precision installation, 
                    expert commissioning, and reliable maintenance of cutting-edge fibre optic systems.
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
                  <h3 className="text-2xl font-semibold text-[#182B5C] mb-6">Integrated Fibre Solutions</h3>
                  <p className="text-gray-700 mb-6">
                    We provide comprehensive fibre optics solutions with specialized expertise in FTTX design, network optimization, 
                    cross-vendor product integration, rigorous testing protocols, and professional commissioning services.
                  </p>
                  
                  <div className="mt-8">
                    <a 
                      href="#services" 
                      className="inline-flex items-center bg-[#182B5C] hover:bg-[#0f7dcc] text-white px-6 py-3.5 rounded-md font-semibold transition-colors"
                    >
                      Explore Our Services
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Image Carousel */}
              <div className="w-full lg:w-1/2">
                <div className="sticky top-24">
                  <h3 className="text-2xl font-semibold text-[#182B5C] mb-8">Our Work</h3>
                  
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={20}
                    slidesPerView={1}
                    pagination={{ 
                      clickable: true, 
                      el: '.swiper-pagination',
                      bulletClass: 'swiper-pagination-bullet bg-gray-300 opacity-50',
                      bulletActiveClass: 'swiper-pagination-bullet-active !bg-[#182B5C] !opacity-100'
                    }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                    className="rounded-xl overflow-hidden shadow-xl"
                  >
                    {galleryImages.map((image, index) => (
                      <SwiperSlide key={index}>
                        <div className="h-96 w-full relative">
                          <img 
                            src={image} 
                            alt={`Optimas Fibre project ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                            <h4 className="text-white text-xl font-semibold">Project {index + 1}</h4>
                            <p className="text-gray-200">Fibre optic installation</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                    <div className="swiper-pagination mt-4"></div>
                  </Swiper>
                  
                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-4 gap-4 mt-8">
                    {thumbnailImages.map((image, index) => (
                      <motion.div 
                        key={index} 
                        className="h-24 rounded-lg overflow-hidden shadow-md cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img 
                          src={image} 
                          alt={`Optimas Fibre thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-[#182B5C] to-[#0f7dcc] p-8 rounded-xl text-white"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
                <p className="opacity-90">
                  Deliver cost-effective, detail-oriented fibre solutions that exceed client expectations through innovation and technical excellence.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-[#d0b216] to-[#e5c845] p-8 rounded-xl text-[#182B5C]"
              >
                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
                <p>
                  To become Africa's leading technology solutions provider, delivering world-class digital infrastructure that transforms communities and empowers businesses.
                </p>
              </motion.div>
            </div>

            {/* Services Section */}
            <div className="mt-20">
              <motion.h2 
                className="text-3xl font-bold text-[#182B5C] mb-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Our Services
              </motion.h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Comprehensive fibre solutions tailored to meet the evolving needs of businesses and communities across Kenya.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className="text-xl font-semibold text-[#182B5C] mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Company Bio */}
            <div className="mt-20">
              <motion.h2 
                className="text-3xl font-bold text-[#182B5C] mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Our Story
              </motion.h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    Optimas Fibre was founded by a team of telecommunications experts with over a decade of industry experience, 
                    united by a vision to bridge the gap between user expectations and provider capabilities in Kenya's rapidly evolving digital landscape.
                  </p>
                  
                  <p className="text-gray-700 text-lg leading-relaxed">
                    We questioned the status quo of internet connectivity in our region and committed to implementing 
                    projects with higher standards, focusing on creativity, innovation, and technical excellence to deliver 
                    superior convenience and unparalleled client satisfaction.
                  </p>

                  <p className="text-gray-700 mt-6 text-lg leading-relaxed">
                    Today, Optimas Fibre stands as a testament to our commitment to quality, with a growing portfolio of successful 
                    projects that have transformed connectivity for businesses, institutions, and communities across Kenya.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-8 rounded-xl">
                  <h3 className="text-2xl font-semibold text-[#182B5C] mb-6">Our Expertise</h3>
                  
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {['FTTX Design & Implementation', 'Network Optimization', 'Cross-Vendor Product Integration', 
                      'Testing & Commissioning', 'Training & Certification', 'Ongoing Maintenance & Support'].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-[#d0b216] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <a 
                      href="#services" 
                      className="inline-flex items-center bg-[#182B5C] hover:bg-[#0f7dcc] text-white px-6 py-3 rounded-md font-semibold transition-colors"
                    >
                      Discover Our Services
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {activeTab === 'portfolio' && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-[#182B5C] mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our Portfolio
            </motion.h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Explore our successful projects and see how we've helped businesses and communities with our fibre solutions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <motion.div 
                  key={item}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: item * 0.1 }}
                >
                  <div className="h-48 bg-gradient-to-r from-[#182B5C] to-[#0f7dcc] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-white text-xl font-semibold z-10">Project {item}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#182B5C] mb-2">Fibre Network {item}</h3>
                    <p className="text-gray-700 mb-4 text-sm">
                      High-speed fibre optic installation for {item === 1 ? 'commercial building' : item === 2 ? 'residential area' : 'industrial park'}.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Completed: Jan 2023</span>
                      <a href="#" className="text-[#182B5C] hover:text-[#d0b216] font-semibold text-sm transition-colors flex items-center">
                        Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {activeTab === 'gallery' && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-[#182B5C] mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our Gallery
            </motion.h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              A visual journey through our projects and the quality work we deliver.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryImages.concat(thumbnailImages).map((image, index) => (
                <motion.div 
                  key={index}
                  className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-56 w-full relative overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Optimas Fibre gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form Section */}
      {activeTab === 'contact' && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-[#182B5C] mb-4">Get In Touch</h2>
              <p className="text-gray-600">
                Have questions about our services or need a custom solution? Reach out to our team today.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2 text-sm font-medium">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C]"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2 text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C]"
                      placeholder="Your email address"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-2 text-sm font-medium">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C]"
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="service" className="block text-gray-700 mb-2 text-sm font-medium">Service</label>
                    <select 
                      id="service" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C]"
                    >
                      <option value="">Select a service</option>
                      <option value="fibre-internet">Fibre Internet</option>
                      <option value="network-design">Network Design</option>
                      <option value="installation">Installation</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-700 mb-2 text-sm font-medium">Message</label>
                  <textarea 
                    id="message" 
                    rows="5" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182B5C]"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <div className="text-center">
                  <button 
                    type="submit" 
                    className="bg-[#182B5C] hover:bg-[#0f7dcc] text-white px-8 py-3.5 rounded-lg font-semibold transition-colors"
                  >
                    SEND MESSAGE
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center bg-white p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#182B5C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#182B5C] mb-2">Phone</h3>
                <p className="text-gray-600">+254 710 888 022</p>
                <p className="text-gray-600">+254 734 888 022</p>
              </div>
              
              <div className="text-center bg-white p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#182B5C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#182B5C] mb-2">Email</h3>
                <p className="text-gray-600">info@optimasfibre.com</p>
                <p className="text-gray-600">support@optimasfibre.com</p>
              </div>
              
              <div className="text-center bg-white p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#182B5C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#182B5C] mb-2">Address</h3>
                <p className="text-gray-600">Nairobi, Kenya</p>
                <p className="text-gray-600">Westlands Business District</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;