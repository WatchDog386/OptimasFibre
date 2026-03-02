import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowRight, Wifi, Shield, Zap, Globe 
} from 'lucide-react';

// --- CONFIG ---
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.DEV) return 'http://localhost:10000';
  return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
};

// --- CUSTOM COMPONENTS ---

const ServiceCard = ({ title, description, icon: Icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
  >
    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Icon className="text-secondary" size={20} />
    </div>
    <h3 className="font-bold text-primary text-base mb-2">{title}</h3>
    <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
  </motion.div>
);

// --- COMPACT PROJECT ROW (UPDATED) ---
const ProjectRow = ({ item, index, onClick }) => {
  const isEven = index % 2 === 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      // Reduced min-height and border styling
      className={`flex flex-col md:flex-row w-full group cursor-pointer border-b border-gray-100 last:border-0 h-auto md:h-48 overflow-hidden ${isEven ? '' : 'md:flex-row-reverse'}`}
      onClick={onClick}
    >
      {/* Image Side - Strictly sized to 48 (12rem/192px) on desktop to force compactness */}
      <div className="w-full md:w-1/2 h-40 md:h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors z-10 duration-500" />
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
             <Wifi size={24} />
          </div>
        )}
      </div>

      {/* Text Side - Reduced padding and font sizes */}
      <div className="w-full md:w-1/2 bg-white p-6 md:px-8 md:py-0 flex flex-col justify-center items-start hover:bg-gray-50 transition-colors duration-300 h-auto md:h-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-4 h-[1px] bg-secondary"></span>
          <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">
            {item.category || 'Infrastructure'}
          </span>
        </div>
        
        {/* Compact Heading */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {item.title}
        </h3>
        
        {/* Compact Description (Line clamped to 2 lines max) */}
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2 max-w-sm">
          {item.description || "Comprehensive fibre infrastructure solution delivered with precision engineering."}
        </p>
        
        <div className="text-[10px] font-bold text-gray-900 uppercase tracking-widest flex items-center group/btn">
          View <ArrowRight size={12} className="ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

const About = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const navigate = useNavigate();

  const handleServicesClick = () => navigate('/services');
  const handleAddPortfolio = () => navigate('/admin/login');
  const handleCloseModal = () => setSelectedPortfolioItem(null);
  const goToContact = () => navigate('/contact');

  const services = [
    { title: "Fibre Internet", description: "High-speed connectivity.", icon: Wifi },
    { title: "Network Design", description: "Custom architecture.", icon: Globe },
    { title: "Installation", description: "Professional setup.", icon: Zap },
    { title: "Security", description: "Secure systems.", icon: Shield }
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${getApiBaseUrl()}/api/portfolio`);
        if (!res.ok) throw new Error('Failed to load portfolio');
        const data = await res.json();
        setPortfolioItems(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-black text-xl tracking-tighter">
            OPTIMAS
          </div>
          <button className="bg-primary hover:bg-gray-800 text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-wide transition-colors">
            Get Quote
          </button>
        </div>
      </header>

      {/* --- HERO TITLE --- */}
      <section className="pt-28 pb-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 text-center">
           <h1 className="text-3xl font-bold text-primary mb-2">About Optimas</h1>
           <p className="text-gray-500 text-sm max-w-xl mx-auto">Connecting communities with next-generation technology.</p>
        </div>
      </section>

      {/* --- MAIN CONTENT (Zig Zag) --- */}
      <section className="pb-16 pt-12">
        <div className="container mx-auto px-6 max-w-6xl">
            
          {/* ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-primary mb-4">What to know of Optimas</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                <p>
                  Founded by an experienced team, <span className="font-bold text-gray-900">Optimas</span> offers simple, affordable access to its <span className="font-bold text-gray-900">full-fibre</span> network for everyone.
                </p>
                <p>
                  We deliver the fastest broadband in the outskirts of Nairobi and Kiambu, ensuring homes and businesses experience life-changing connectivity.
                </p>
              </div>
              <div className="h-px bg-gray-200 w-full mt-6"></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-tl-[80px] rounded-br-[80px] rounded-bl-[30px] rounded-tr-[10px] transform translate-x-3 translate-y-3 -z-10 h-full w-full"></div>
              <div className="relative rounded-tl-[80px] rounded-br-[80px] rounded-bl-[30px] rounded-tr-[10px] overflow-hidden h-[300px] w-full bg-gray-200 shadow-lg">
                <img src="/connection.jpg" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1531297461136-82lw8?q=80&w=2070&auto=format&fit=crop"; }} alt="Happy customer" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1">
                <div className="rounded-[2rem] overflow-hidden shadow-xl h-[300px]">
                  <img src="/family-laptop.jpg" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"; }} alt="Family" className="w-full h-full object-cover" />
                </div>
             </motion.div>

             <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2">
                <h2 className="text-2xl font-bold text-primary mb-4">Our Goal and Plan</h2>
                <div className="space-y-3 text-gray-600 leading-relaxed text-sm mb-6">
                  <p>Optimas plans to open its network to more areas across Nairobi & Kiambu over the next 5 years.</p>
                  <p>We believe reliable internet is a fundamental right, bridging the digital divide for education and business.</p>
                </div>
                <button onClick={goToContact} className="bg-primary hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-full shadow-lg text-xs transition-transform transform hover:scale-105">
                  Get Connected
                </button>
             </motion.div>
          </div>
        </div>
      </section>

      {/* --- SERVICES --- */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
                <p className="text-gray-500 text-xs mt-1">Connectivity solutions.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {services.map((s, i) => (
                    <ServiceCard key={i} {...s} />
                ))}
            </div>
        </div>
      </section>

      {/* --- RECENT PROJECTS (SMALLER & COMPACT) --- */}
      <section className="py-0 bg-white">
        <div className="w-full">
            <div className="container mx-auto px-6 max-w-5xl pt-16 pb-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Selected Works</h2>
                    </div>
                    <button onClick={handleAddPortfolio} className="hidden md:block text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">
                        + Add Project
                    </button>
                </div>
            </div>
            
            {loading ? (
                 <div className="text-center py-12 text-xs text-gray-400">Loading...</div>
            ) : (
                <div className="flex flex-col border-t border-gray-100 max-w-6xl mx-auto">
                    {portfolioItems.length > 0 ? portfolioItems.map((item, i) => (
                        <ProjectRow key={i} index={i} item={item} onClick={() => setSelectedPortfolioItem(item)} />
                    )) : (
                        <div className="text-center text-gray-400 py-12 text-xs">No projects added yet.</div>
                    )}
                </div>
            )}
        </div>
      </section>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {selectedPortfolioItem && (
          <motion.div 
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="bg-white w-full max-w-lg overflow-hidden shadow-2xl rounded-none"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
               <div className="relative h-48 bg-gray-200">
                  {selectedPortfolioItem.imageUrl && (
                      <img src={selectedPortfolioItem.imageUrl} className="w-full h-full object-cover" alt="" />
                  )}
                  <button onClick={handleCloseModal} className="absolute top-3 right-3 bg-black/50 text-white p-1.5 hover:bg-black transition-colors">
                      <X size={16} />
                  </button>
               </div>
               <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                     <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {selectedPortfolioItem.category || 'Project'}
                     </span>
                     <span className="text-[10px] text-gray-400">
                        {selectedPortfolioItem.publishedAt ? new Date(selectedPortfolioItem.publishedAt).toLocaleDateString() : ''}
                     </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPortfolioItem.title}</h3>
                  <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                    {selectedPortfolioItem.description || "No description available."}
                  </p>
                  <div className="flex gap-3">
                      <button onClick={goToContact} className="flex-1 bg-primary text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                        Inquire
                      </button>
                      <button onClick={handleCloseModal} className="px-5 border border-gray-300 text-gray-600 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
                        Close
                      </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default About;