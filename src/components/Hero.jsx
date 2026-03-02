import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, X, Wifi, Star, Phone, Zap, Smartphone, 
  Shield, ArrowRight, Users, ChevronRight,
  Server, Activity, Send, MonitorPlay, Gamepad2, Briefcase, Download,
  Gauge
} from 'lucide-react';

// --- CUSTOM ICONS ---
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 14.5C17.1 14.1 15.3 13.2 14.9 13.1C14.5 13 14.3 13.2 14.1 13.5C13.9 13.9 13.2 14.7 13 14.9C12.8 15.1 12.5 15.2 12.2 15C11.8 14.8 10.6 14.4 9.3 13.2C8.2 12.2 7.5 11 7.2 10.6C7 10.2 7.2 10 7.4 9.8C7.5 9.7 7.7 9.4 7.9 9.2C8.1 8.9 8.2 8.8 8.3 8.5C8.4 8.2 8.3 8.1 8.2 7.9C8.1 7.7 7.4 5.9 7.1 5.2C6.8 4.5 6.5 4.6 6.3 4.6C6.1 4.6 5.9 4.6 5.6 4.6C5 4.7 4.7 5.1 4.3 5.4C4 5.8 3.4 6.3 3.4 8.1C3.4 9.9 4.7 11.5 4.9 11.8C5 12 7.4 15.7 11.1 17.3C11.9 17.6 12.6 17.9 13.1 18C14.1 18.3 14.9 18.3 15.6 18.2C16.4 18.1 18 17.2 18.3 16.3C18.7 15.4 18.7 14.6 18.6 14.4C18.5 14.3 18.3 14.2 17.9 14L17.5 14.5Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24ZM12 21.8C10.2 21.8 8.5 21.3 7.1 20.5L6.8 20.3L3.9 21.1L4.7 18.3L4.5 17.9C3.6 16.5 3.1 14.9 3.1 13.2C3.1 8.3 7.1 4.3 12 4.3C14.4 4.3 16.6 5.2 18.3 6.9C19.9 8.6 20.9 10.8 20.9 13.2C20.9 18.1 16.9 21.8 12 21.8Z" fillOpacity="0.2" />
  </svg>
);

// --- SLIDER CONFIGURATION ---
const SLIDE_INTERVAL = 5000;

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://www.centurylink.com/content/dam/home/static/internet/couchfam-sm.png",
    tagline: "THE BEST INTERNET",
    title: "OPTIMAS HOME FIBER",
    subtitle: "Fast & Reliable",
    description: "Experience the speed of light in your home today.",
    path: "/services",
    buttonText: "View Services",
    textColors: {
      tagline: "text-[#FF6B35]",
      title: "text-white",
      description: "text-white"
    }
  },
  {
    id: 2,
    image: "https://itel.com/wp-content/uploads/2015/09/iStock_000012499607_XXXLarge-1024x576.jpg",
    tagline: "CONNECTING YOU",
    title: "FUTURE-PROOF CONNECTIVITY",
    subtitle: "Streaming & Gaming",
    description: "Low latency and high speeds for all your needs.",
    path: "/coverage",
    buttonText: "Check Coverage",
    textColors: {
      tagline: "text-[#FF6B35]",
      title: "text-white",
      description: "text-white"
    }
  },
  {
    id: 3,
    image: "https://internet.safaricom.co.ke/static/media/IntroV2.26c9848af54c765e0749.jpg",
    tagline: "ALWAYS HERE",
    title: "24/7 SUPPORT",
    subtitle: "We Care",
    description: "Our team is available around the clock to assist you.",
    path: "/contact",
    buttonText: "Contact Us",
    textColors: {
      tagline: "text-[#FF6B35]",
      title: "text-white",
      description: "text-white"
    }
  },
];

// --- HERO SLIDER COMPONENT ---
const HeroSlider = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = HERO_SLIDES[currentSlideIndex];
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const contentVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4, ease: "easeIn" } }
  };
    
  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.8 } },
    exit: { opacity: 0, transition: { duration: 0.8 } }
  };

  const fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  return (
    <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[85vh] flex items-center overflow-hidden bg-white" style={{ fontFamily }}>
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={`Background ${currentSlide.id}`}
            className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110 saturate-110"
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ objectPosition: "center" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#004080]/45 via-[#004080]/25 to-black/20"></div>
      </div>

      {/* CONTENT */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 h-full flex items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center text-center">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentSlide.id}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center"
            >
              <p className={`${currentSlide.textColors?.tagline} text-[8px] md:text-xs font-black uppercase tracking-widest mb-2 drop-shadow-sm`}>
                {currentSlide.tagline}
              </p>
              
              <h1 className={`${currentSlide.textColors?.title} text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-3 tracking-tight leading-none drop-shadow-sm whitespace-nowrap`}>
                {currentSlide.title}
              </h1>
              
              <div className="inline-block bg-[#004080] px-4 py-1.5 md:px-6 md:py-2 mb-4 rounded-full shadow-lg">
                <h2 className="text-[8px] md:text-xs font-black text-white tracking-widest uppercase">
                   {currentSlide.subtitle}
                </h2>
              </div>
              
              <p className={`${currentSlide.textColors?.description} text-xs sm:text-sm md:text-base max-w-xs md:max-w-xl mb-6 font-bold leading-relaxed`}>
                {currentSlide.description}
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(currentSlide.path)} 
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-6 py-2.5 md:px-8 md:py-3 font-black uppercase text-[10px] md:text-xs tracking-widest rounded-full shadow-xl flex items-center gap-2 transition-colors duration-300"
              >
                {currentSlide.buttonText}
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4"/>
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

// ================================
// 🔥 DATA & CONFIG
// ================================

// Replaced dull grays with vibrant, clean Vuma-style bright colors
const PACKAGE_THEMES = [
  { name: 'pink', gradient: 'from-[#E6007E] to-[#FF3399]', light: 'bg-[#FCE5F0] text-[#E6007E]' },
  { name: 'purple', gradient: 'from-[#8E24AA] to-[#AB47BC]', light: 'bg-purple-100 text-purple-700' },
  { name: 'blue', gradient: 'from-[#0288D1] to-[#29B6F6]', light: 'bg-blue-100 text-blue-700' },
  { name: 'green', gradient: 'from-[#43A047] to-[#66BB6A]', light: 'bg-green-100 text-green-700' },
  { name: 'orange', gradient: 'from-[#FB8C00] to-[#FFA726]', light: 'bg-orange-100 text-orange-700' },
  { name: 'teal', gradient: 'from-[#00897B] to-[#26A69A]', light: 'bg-teal-100 text-teal-700' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
};

const PLAN_IMAGES = {
  "Jumbo": "https://static.vecteezy.com/system/resources/thumbnails/032/949/099/small/young-elephant-calf-walking-in-tropical-wilderness-free-photo.jpg",
  "Buffalo": "https://www.travelbutlers.com/images/450px/dreamstimemaximum_20395360_KRUGER.jpg  ",
  "Ndovu": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1200&q=80",
  "Gazzelle": "https://www.tanzania-experience.com/wp-content/uploads/2015/09/gazelles-antilope-featured.jpg  ",
  "Tiger": "https://transforms.stlzoo.org/production/animals/amur-tiger-01-01.jpg?w=1200&h=1200&auto=compress%2Cformat&fit=crop&dm=1658935145&s=95d03aceddd44dc8271beed46eae30bc  ",
  "Chui": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Leopard_on_a_horizontal_tree_trunk.jpg  ",
};

const plans = [
  { name: "Jumbo", price: "Ksh 1,500", speed: "8 Mbps", image: PLAN_IMAGES["Jumbo"], features: [{ text: "Uncapped", icon: Download }, { text: "1-2 Devices", icon: Users }, { text: "Free Install", icon: CheckCircle }, { text: "24/7 Support", icon: Phone }], isPopular: false },
  { name: "Buffalo", price: "Ksh 2,000", speed: "15 Mbps", image: PLAN_IMAGES["Buffalo"], features: [{ text: "HD Stream", icon: MonitorPlay }, { text: "Low Latency", icon: Zap }, { text: "Free Install", icon: CheckCircle }, { text: "24/7 Support", icon: Phone }], isPopular: false },
  { name: "Ndovu", price: "Ksh 2,500", speed: "20 Mbps", image: PLAN_IMAGES["Ndovu"], features: [{ text: "Dedicated", icon: Server }, { text: "Home Office", icon: Briefcase }, { text: "Free Install", icon: CheckCircle }, { text: "Priority Help", icon: Star }], isPopular: true },
  { name: "Gazzelle", price: "Ksh 3,000", speed: "30 Mbps", image: PLAN_IMAGES["Gazzelle"], features: [{ text: "4K Stream", icon: MonitorPlay }, { text: "Gaming Ready", icon: Gamepad2 }, { text: "Smart Home", icon: Smartphone }, { text: "Free Install", icon: CheckCircle }], isPopular: false },
  { name: "Tiger", price: "Ksh 4,000", speed: "40 Mbps", image: PLAN_IMAGES["Tiger"], features: [{ text: "Low Ping", icon: Activity }, { text: "Pro Gaming", icon: Gamepad2 }, { text: "Dedicated Mgr", icon: Users }, { text: "Free Install", icon: CheckCircle }], isPopular: false },
  { name: "Chui", price: "Ksh 5,000", speed: "60 Mbps", image: PLAN_IMAGES["Chui"], features: [{ text: "Max Speed", icon: Gauge }, { text: "Multi 4K", icon: MonitorPlay }, { text: "Premium SLA", icon: Shield }, { text: "Free Install", icon: CheckCircle }], isPopular: false },
];

const hotspotPlans = [
  { name: "Quick Access", price: "15", duration: "2hrs", color: "from-[#E6007E] to-[#FF3399]" },
  { name: "All Day", price: "30", duration: "12hrs", color: "from-[#8E24AA] to-[#AB47BC]" },
  { name: "Daily Pro", price: "40", duration: "24hrs", color: "from-[#0288D1] to-[#29B6F6]" },
  { name: "Weekly", price: "250", duration: "7 Days", color: "from-[#43A047] to-[#66BB6A]" },
  { name: "Monthly", price: "610", duration: "30 Days", color: "from-[#FB8C00] to-[#FFA726]" },
  { name: "Power Dual", price: "1000", duration: "30 Days", color: "from-[#00897B] to-[#26A69A]" }
];

// ================================
// MAIN CONTENT
// ================================

const MainContent = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", location: "", connectionType: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData(p => ({ ...p, connectionType: plan.name }));
    setShowForm(true);
  };

  const handleHotspotSelect = () => {
    window.open("http://wifi.optimassys.co.ke/index.php?_route=main", "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const composeBaseUrl = "https://pld109.truehost.cloud:2096/cpsess2481723632/3rdparty/roundcube/?_task=mail&_action=compose&_id=205935968069a5dd54cd56d";
      const composeUrl = formData.email
        ? `${composeBaseUrl}&_to=${encodeURIComponent(formData.email)}`
        : composeBaseUrl;
      window.location.href = composeUrl;
      setIsLoading(false);
      setShowForm(false);
      setShowSuccess(true);
      setFormData({ name: "", email: "", phone: "", location: "", connectionType: "" });
    }, 1500);
  };

  const fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily }}>
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-black text-xl md:text-2xl text-[#004080] tracking-tighter pointer-events-auto drop-shadow-md bg-white/90 backdrop-blur-md px-5 py-2 rounded-full shadow-sm">
          OPTIMAS<span className="text-[#FF6B35]">FIBER</span>
        </motion.div>
      </div>
        
      <HeroSlider />

      {/* WI-FI PACKAGES */}
        <section id="wifi-packages" className="pt-10 md:pt-14 pb-16 md:pb-24 relative bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-[#2562AE] text-[11px] font-bold lowercase tracking-[0.08em] mb-1">choose speed</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-[#2562AE] tracking-tight lowercase">
              unlimited fiber
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-bold">Enterprise-grade speeds. No contracts.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {plans.map((plan, index) => {
              const theme = PACKAGE_THEMES[index % PACKAGE_THEMES.length];
              return (
                <motion.div
                  key={plan.name}
                  variants={cardVariants}
                  className="rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-32 md:h-40 relative overflow-hidden">
                      <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/25 z-10" />
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-1">
                          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                            {plan.speed}
                          </h2>
                      </div>
                      {plan.isPopular && (
                        <div className="absolute top-4 right-4 z-30 bg-[#1A1A24] text-[#E6007E] text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-md">
                           POPULAR
                        </div>
                      )}
                  </div>

                  <div className="relative -mt-4 bg-white rounded-t-[18px] p-3.5 md:p-4 pt-0 z-30">
                      <div className="flex justify-center -mt-2.5 mb-2.5">
                        <div className={`px-4 py-1.5 rounded-full text-white font-black text-[10px] tracking-widest uppercase bg-gradient-to-r ${theme.gradient} shadow-md`}>
                           {plan.name}
                        </div>
                      </div>

                      <div className="text-center mb-3 border-b border-gray-100 pb-2.5">
                        <span className="text-lg md:text-xl font-black text-[#1A1A24]">{plan.price}</span>
                        <span className="text-gray-400 font-black text-[10px] uppercase ml-1">/mo</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mb-3.5">
                        {plan.features.map((feature, i) => (
                           <div key={i} className={`flex items-center gap-1.5 p-2 rounded-lg ${theme.light}`}>
                             <feature.icon className="w-3.5 h-3.5 flex-shrink-0" />
                             <span className="text-[9px] md:text-[10px] font-black uppercase leading-none">{feature.text}</span>
                           </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-2 md:py-2.5 rounded-full font-black text-white uppercase text-[10px] tracking-widest shadow-md hover:shadow-lg hover:opacity-90 transition-all bg-gradient-to-r ${theme.gradient} flex items-center justify-center gap-2`}
                      >
                        Get Connected <ChevronRight className="w-4 h-4" />
                      </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOTSPOT SECTION */}
      <section id="hotspot-section" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-row justify-between items-end border-b border-gray-100 pb-5 mb-8">
            <div>
               <p className="text-[#E6007E] text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">Public Zones</p>
               <h2 className="text-2xl md:text-4xl font-black text-[#1A1A24] uppercase tracking-tight">
                 Wifi <span className="text-[#E6007E]">Hotspots</span>
               </h2>
            </div>
            <button onClick={handleHotspotSelect} className="text-[10px] md:text-xs font-black uppercase bg-[#FCE5F0] text-[#E6007E] px-4 py-2 rounded-full flex items-center gap-1 hover:bg-[#E6007E] hover:text-white transition-colors">
               View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
             {hotspotPlans.map((plan, index) => (
                <motion.div
                   key={index}
                   whileHover={{ y: -5 }}
                   onClick={handleHotspotSelect}
                   className={`rounded-2xl p-4 md:p-5 cursor-pointer relative overflow-hidden bg-gradient-to-br ${plan.color} shadow-md`}
                >
                   <Wifi className="absolute top-0 right-0 w-10 h-10 md:w-16 md:h-16 text-white opacity-20 m-2" />
                   <div className="relative z-10 text-white h-24 md:h-32 flex flex-col justify-between">
                       <div>
                           <h3 className="font-black text-[11px] md:text-xs uppercase tracking-tight mb-1.5">{plan.name}</h3>
                           <span className="inline-block bg-white/30 backdrop-blur-sm text-[10px] font-black px-2 py-1 rounded-md">
                              {plan.duration}
                           </span>
                       </div>
                       <div>
                           <p className="text-[10px] opacity-80 uppercase font-bold mb-0.5">Only</p>
                           <p className="text-xl md:text-2xl font-black leading-none">Ksh {plan.price}</p>
                       </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* MODALS */}
      <AnimatePresence>
        {showForm && <BookingModal show={showForm} onClose={() => setShowForm(false)} plan={selectedPlan} formData={formData} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} onSubmit={handleSubmit} isLoading={isLoading} />}
        {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
      </AnimatePresence>
      
      <motion.a 
        href="https://wa.me/254741874200  " 
        target="_blank" 
        className="fixed bottom-6 right-6 z-40 bg-[#25d366] text-white p-4 md:p-5 rounded-full shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <WhatsAppIcon className="w-7 h-7 md:w-8 md:h-8" />
      </motion.a>
    </div>
  );
};

// --- SUB COMPONENTS ---
const BookingModal = ({ show, onClose, plan, formData, onChange, onSubmit, isLoading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-[#1A1A24]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-[#1A1A24] uppercase">Order Connection</h3>
          <button onClick={onClose} className="p-1.5 bg-[#FCE5F0] text-[#E6007E] rounded-full hover:bg-[#E6007E] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">Name</label>
            <input name="name" value={formData.name} onChange={onChange} required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm bg-gray-50 focus:border-[#E6007E] focus:outline-none transition-colors font-bold" placeholder="Full Name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-[11px] font-black text-gray-500 uppercase ml-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={onChange} required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm bg-gray-50 focus:border-[#E6007E] focus:outline-none transition-colors font-bold" placeholder="07..." />
             </div>
             <div>
                <label className="text-[11px] font-black text-gray-500 uppercase ml-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={onChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm bg-gray-50 focus:border-[#E6007E] focus:outline-none transition-colors font-bold" placeholder="Optional" />
             </div>
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">Location</label>
            <textarea name="location" value={formData.location} onChange={onChange} required rows="2" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm bg-gray-50 focus:border-[#E6007E] focus:outline-none transition-colors font-bold" placeholder="Building, Road, Estate..."></textarea>
          </div>
          <div className="p-4 bg-[#FCE5F0] rounded-xl flex justify-between items-center border border-pink-100">
             <span className="text-xs font-black text-[#E6007E]">{plan?.name} Package</span>
             <span className="text-sm font-black text-[#1A1A24]">{plan?.speed}</span>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 mt-2 rounded-full font-black text-white uppercase text-xs tracking-widest bg-[#E6007E] hover:bg-[#C9006B] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
            {isLoading ? "Sending..." : "Confirm Request"} <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SuccessPopup = ({ onClose }) => (
  <div className="fixed inset-0 bg-[#1A1A24]/80 flex items-center justify-center z-[110] p-4 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-xs w-full">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-black text-[#1A1A24] uppercase">Request Sent!</h3>
      <p className="text-sm text-gray-500 mb-6 mt-2 font-bold">We will contact you shortly via WhatsApp.</p>
      <button onClick={onClose} className="bg-[#E6007E] text-white px-8 py-3 rounded-full font-black text-xs tracking-widest uppercase w-full hover:bg-[#C9006B] transition-colors">Okay</button>
    </motion.div>
  </div>
);

export default MainContent;