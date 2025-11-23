import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { 
  CheckCircle, X, ArrowRight, Users, ChevronRight, Star, Send, 
  Gauge, Activity, Server, Lock, Smartphone, Wifi
} from 'lucide-react';

// --- THEME CONFIG (MATCHES Hero.jsx) ---
const cardThemes = {
  blue: {
    gradient: "bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500",
    buttonBg: "bg-gray-900 text-white hover:bg-gray-800",
    featureIcon: "text-blue-600",
    shadow: "shadow-blue-500/20 hover:shadow-blue-500/40",
    border: "border-blue-200",
    softBg: "bg-blue-50",
    textColor: "text-blue-900"
  }
};

// --- UTILS ---
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.DEV) return 'http://localhost:10000';
  return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
};

// --- CUSTOM COMPONENTS (MATCH Hero.jsx STYLE) ---

const StatCard = ({ icon: Icon, value, label }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center"
  >
    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon size={16} className="text-blue-600" />
    </div>
    <h4 className="font-black text-lg text-gray-900">{value}</h4>
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">{label}</p>
  </motion.div>
);

const ServiceCard = ({ title, description, icon }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-full"
  >
    <div className="text-2xl mb-3">{icon}</div>
    <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
    <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const PortfolioCard = ({ item, onClick }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
    onClick={onClick}
  >
    <div className="h-32 overflow-hidden">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <Wifi size={24} className="text-gray-400" />
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-blue-600">
          {item.category || 'Project'}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description || 'No description'}</p>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-500">
          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'N/A'}
        </span>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="text-[10px] font-bold text-blue-600 flex items-center gap-1"
        >
          View <ChevronRight size={12} />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const navigate = useNavigate();

  const handleServicesClick = () => navigate('/services');
  const handleAddPortfolio = () => navigate('/admin/login');
  const handleCloseModal = () => setSelectedPortfolioItem(null);
  const goToContact = () => navigate('/contact');

  const getCarouselImages = () => {
    if (portfolioItems.length > 0) {
      const withImg = portfolioItems.filter(i => i.imageUrl).slice(0, 5);
      if (withImg.length > 0) return withImg.map(i => i.imageUrl);
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
    { title: "Fibre Internet", description: "High-speed connectivity for homes and businesses", icon: "📡" },
    { title: "Network Design", description: "Custom architecture for your needs", icon: "🔧" },
    { title: "Installation", description: "Professional fibre infrastructure setup", icon: "⚡" },
    { title: "Maintenance", description: "Ongoing support and optimization", icon: "🛠️" }
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${getApiBaseUrl()}/api/portfolio`);
        if (!res.ok) throw new Error('Failed to load portfolio');
        const data = await res.json();
        const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setPortfolioItems(items);
      } catch (err) {
        console.error(err);
        setError('Failed to load portfolio. Please try again.');
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
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Header (matches Hero.jsx navbar style) */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <motion.div 
              className="font-black text-lg text-gray-900 tracking-tighter drop-shadow-sm"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              OPTIMAS<span className="text-blue-400">FIBER</span>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 font-bold uppercase text-[10px] tracking-widest rounded-full shadow-sm"
            >
              Get Quote
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white relative">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            About Optimas Fibre
          </motion.h1>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Leading Kenya's digital transformation with cutting-edge fibre solutions
          </motion.p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-6 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex rounded-full bg-gray-100 p-1">
              {['overview', 'portfolio'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider ${
                    activeTab === tab
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-600 hover:text-blue-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {tab}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Text Content */}
              <div>
                <motion.h2 
                  className="text-2xl md:text-3xl font-bold mb-6 text-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Who We Are
                </motion.h2>
                <div className="space-y-4 text-gray-600 mb-8">
                  <p>Optimas Fibre is a premier Kenyan systems integrator with a distinguished reputation in telecommunications.</p>
                  <p>We deliver comprehensive end-to-end solutions including design, supply, installation, and maintenance of fibre optic systems.</p>
                  <p>Our expertise spans from infrastructure design to Internet Service Provision, advanced network configuration, and management services.</p>
                </div>

                <h3 className="text-xl font-bold mb-4 text-gray-900">Integrated Fibre Solutions</h3>
                <p className="text-gray-600 mb-6">
                  We provide comprehensive fibre optics solutions with specialized expertise in FTTX design, network optimization, and professional commissioning.
                </p>

                <motion.button 
                  onClick={handleServicesClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-2"
                >
                  View All Services <ArrowRight size={14} />
                </motion.button>
              </div>

              {/* Image Carousel */}
              <div className="sticky top-24">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Our Work</h3>
                <Swiper
                  modules={[Autoplay, Pagination]}
                  spaceBetween={16}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000 }}
                  loop={true}
                  className="rounded-xl overflow-hidden shadow-xl"
                >
                  {getCarouselImages().map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="h-64 md:h-80 w-full relative">
                        <img 
                          src={image} 
                          alt={`Project ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "/word.jpg"; e.target.onerror = null; }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h4 className="text-white font-bold">Project {index + 1}</h4>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* Mission & Vision (as in Hero.jsx style cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative h-48 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-lg flex flex-col justify-end p-6 text-white overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <h3 className="text-xl font-black mb-2">Our Mission</h3>
                <p className="text-sm opacity-90">Deliver cost-effective, detail-oriented fibre solutions that exceed client expectations.</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative h-48 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg flex flex-col justify-end p-6 text-gray-900 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <h3 className="text-xl font-black mb-2">Our Vision</h3>
                <p className="text-sm">To become Africa's leading technology solutions provider.</p>
              </motion.div>
            </div>

            {/* Services Grid */}
            <div className="mt-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-900">Our Services</h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">Comprehensive fibre solutions for businesses and communities.</p>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {services.map((s, i) => (
                  <ServiceCard key={i} title={s.title} description={s.description} icon={s.icon} />
                ))}
              </motion.div>
            </div>

            {/* Stats Bar (matches Hero.jsx junction card) */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-md rounded-full shadow-xl py-4 px-6">
                <div className="flex flex-wrap justify-between items-center divide-x divide-gray-200">
                  {[
                    { icon: Gauge, t: "99.9%", d: "Uptime" },
                    { icon: Activity, t: "< 5ms", d: "Ping" },
                    { icon: Server, t: "1:1", d: "Contention" },
                    { icon: Lock, t: "AES-256", d: "Security" }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2">
                      <div className="p-2 bg-blue-50 rounded-full">
                        <f.icon size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-gray-900">{f.t}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{f.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Our Portfolio</h2>
                <p className="text-gray-600">Explore our successful fibre projects across Kenya.</p>
              </div>
              <motion.button 
                onClick={handleAddPortfolio}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-1"
              >
                <span>+</span> Add Portfolio
              </motion.button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-center mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Wifi size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No portfolio items available.</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {portfolioItems.map((item, i) => (
                  <PortfolioCard key={item._id || i} item={item} onClick={() => setSelectedPortfolioItem(item)} />
                ))}
              </motion.div>
            )}

            {/* Stats */}
            {portfolioItems.length > 0 && (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Users} value={portfolioItems.length} label="Projects" />
                <StatCard icon={Star} value={new Set(portfolioItems.map(i => i.category)).size || 1} label="Categories" />
                <StatCard icon={CheckCircle} value="50+" label="Happy Clients" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Portfolio Modal */}
      <AnimatePresence>
        {selectedPortfolioItem && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-48 relative">
                {selectedPortfolioItem.imageUrl ? (
                  <img src={selectedPortfolioItem.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Wifi size={32} className="text-gray-400" />
                  </div>
                )}
                <button 
                  onClick={handleCloseModal}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPortfolioItem.title}</h3>
                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-blue-600">
                    {selectedPortfolioItem.category || 'General'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {selectedPortfolioItem.publishedAt ? new Date(selectedPortfolioItem.publishedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">
                  {selectedPortfolioItem.description || 'No description available.'}
                </p>
                <div className="flex gap-3">
                  <motion.button 
                    onClick={goToContact}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-bold text-sm"
                  >
                    Contact About Project
                  </motion.button>
                  <motion.button 
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.02 }}
                    className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button (matches Hero.jsx) */}
      <motion.a 
        initial={{ scale: 0 }} animate={{ scale: 1 }} 
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        href="https://wa.me/254741874200" 
        target="_blank" 
        className="fixed bottom-6 right-6 z-40 bg-[#25d366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center ring-4 ring-white/20"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382C17.112 14.022 15.344 13.153 14.984 13.064C14.624 12.974 14.384 13.153 14.144 13.513C13.904 13.873 13.243 14.653 13.003 14.893C12.763 15.133 12.523 15.193 12.163 15.013C11.803 14.833 10.642 14.453 9.26196 13.223C8.18196 12.263 7.45296 11.074 7.21296 10.654C6.97296 10.234 7.18796 10.012 7.36796 9.832C7.52496 9.676 7.71696 9.426 7.89696 9.186C8.07696 8.946 8.13696 8.766 8.25696 8.526C8.37696 8.286 8.31696 8.076 8.22696 7.896C8.13696 7.716 7.41696 5.946 7.11696 5.226C6.82396 4.529 6.53096 4.624 6.30996 4.636C6.10496 4.646 5.86496 4.646 5.62496 4.646C5.38496 4.646 4.99496 4.736 4.66496 5.096C4.33496 5.456 3.40496 6.326 3.40496 8.096C3.40496 9.866 4.69496 11.576 4.87496 11.816C5.05496 12.056 7.42496 15.716 11.055 17.276C11.918 17.647 12.593 17.868 13.12 18.035C14.075 18.338 14.95 18.297 15.642 18.194C16.415 18.079 18.025 17.219 18.355 16.289C18.685 15.359 18.685 14.579 18.595 14.429C18.505 14.279 18.265 14.149 17.905 13.969L17.472 14.382Z" />
        </svg>
      </motion.a>
    </div>
  );
};

export default About;