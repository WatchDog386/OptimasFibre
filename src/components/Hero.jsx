import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, X, Wifi, Star, Phone, Zap, Smartphone, 
  Shield, Globe, ArrowRight, Users, ChevronRight,
  Server, Activity, Send, MonitorPlay, Gamepad2, Briefcase, Download,
  Gauge, HardHat
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
      tagline: "text-purple-600",
      title: "text-[#182b5c]",
      description: "text-gray-800"
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
      tagline: "text-white",
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
      tagline: "text-purple-600",
      title: "text-[#182b5c]",
      description: "text-gray-800"
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

  const fontFamily = "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue, sans-serif";

  return (
    <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[85vh] flex items-center overflow-hidden bg-white" style={{ fontFamily }}>
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={`Background ${currentSlide.id}`}
            className="absolute inset-0 w-full h-full object-cover"
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ objectPosition: "center" }}
          />
        </AnimatePresence>
        {/* Clear background - Removed heavy overlay */}
        <div className="absolute inset-0 bg-white/30 md:bg-white/20"></div>
      </div>

      {/* CONTENT */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 h-full flex items-center justify-center">
        {/* Increased max-w to ensure text fits on one line */}
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
              <p className={`${currentSlide.textColors?.tagline || "text-purple-600"} text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 drop-shadow-sm`}>
                {currentSlide.tagline}
              </p>
              
              {/* Reduced font size and added whitespace-nowrap to force one line */}
              <h1 className={`${currentSlide.textColors?.title || "text-[#182b5c]"} text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase mb-3 tracking-tight leading-none drop-shadow-sm whitespace-nowrap`}>
                {currentSlide.title}
              </h1>
              
              <div className="inline-block bg-[#182b5c] px-4 py-1.5 md:px-6 md:py-2 mb-4 -skew-x-12 shadow-md">
                <h2 className="text-[10px] md:text-xs font-bold text-white tracking-wider uppercase skew-x-12">
                   {currentSlide.subtitle}
                </h2>
              </div>
              
              {/* Using gray-800 for description to match clean corporate theme */}
              <p className={`${currentSlide.textColors?.description || "text-gray-800"} text-xs sm:text-sm md:text-base max-w-xs md:max-w-xl mb-6 font-bold leading-relaxed`}>
                {currentSlide.description}
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(currentSlide.path)} 
                className="bg-[#182b5c] hover:bg-blue-900 text-white px-6 py-2.5 md:px-8 md:py-3 font-bold uppercase text-[10px] md:text-xs tracking-widest rounded-full shadow-xl flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4"/>
                {currentSlide.buttonText}
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

const PACKAGE_THEMES = [
  { name: 'pink', gradient: 'from-[#ec008c] to-[#fc6767]', light: 'bg-pink-50 text-pink-600' },
  { name: 'blue', gradient: 'from-[#0061a8] to-[#6dd5fa]', light: 'bg-blue-50 text-blue-600' },
  { name: 'purple', gradient: 'from-[#662d91] to-[#9b59b6]', light: 'bg-purple-50 text-purple-600' },
  { name: 'orange', gradient: 'from-[#f12711] to-[#f5af19]', light: 'bg-orange-50 text-orange-600' },
  { name: 'cyan', gradient: 'from-[#00c6ff] to-[#0072ff]', light: 'bg-cyan-50 text-cyan-600' },
  { name: 'green', gradient: 'from-[#11998e] to-[#38ef7d]', light: 'bg-green-50 text-green-600' },
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
  "Jumbo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLtDRuk2QhRzgJFqmA7jIrUxFwQb470KLtVeLuGb4vwlMhBSOoiK8soiuQEj9JsYFORWw&usqp=CAU",
  "Buffalo": "https://www.travelbutlers.com/images/450px/dreamstimemaximum_20395360_KRUGER.jpg",
  "Ndovu": "https://static.wixstatic.com/media/4c001d_b2c8ccb2a4834f539eeaa2e5c6859985~mv2.png/v1/fill/w_1000,h_567,al_c,q_90,usm_0.66_1.00_0.01/4c001d_b2c8ccb2a4834f539eeaa2e5c6859985~mv2.png",
  "Gazzelle": "https://www.tanzania-experience.com/wp-content/uploads/2015/09/gazelles-antilope-featured.jpg",
  "Tiger": "https://transforms.stlzoo.org/production/animals/amur-tiger-01-01.jpg?w=1200&h=1200&auto=compress%2Cformat&fit=crop&dm=1658935145&s=95d03aceddd44dc8271beed46eae30bc",
  "Chui": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Leopard_on_a_horizontal_tree_trunk.jpg",
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
  { name: "Quick Access", price: "15", duration: "2hrs", color: "from-amber-400 to-orange-500" },
  { name: "All Day", price: "30", duration: "12hrs", color: "from-orange-500 to-red-500" },
  { name: "Daily Pro", price: "40", duration: "24hrs", color: "from-pink-500 to-rose-500" },
  { name: "Weekly", price: "250", duration: "7 Days", color: "from-purple-500 to-indigo-500" },
  { name: "Monthly", price: "610", duration: "30 Days", color: "from-blue-500 to-cyan-500" },
  { name: "Power Dual", price: "1000", duration: "30 Days", color: "from-emerald-500 to-teal-500" }
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
      const msg = `*NEW CONNECTION REQUEST*
👤 Name: ${formData.name}
📱 Phone: ${formData.phone}
📧 Email: ${formData.email}
📍 Location: ${formData.location}
📦 Package: ${selectedPlan.name} (${selectedPlan.speed})
💰 Price: Ksh ${selectedPlan.price.match(/[\d,]+/)?.[0] || 'Custom'}`;
      window.open(`https://api.whatsapp.com/send?phone=254741874200&text=${encodeURIComponent(msg)}`, '_blank');
      setIsLoading(false);
      setShowForm(false);
      setShowSuccess(true);
      setFormData({ name: "", email: "", phone: "", location: "", connectionType: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-black text-base md:text-xl text-black tracking-tighter pointer-events-auto drop-shadow-md bg-white/80 backdrop-blur-md px-3 py-1 rounded-full">
          OPTIMAS<span className="text-blue-600">FIBER</span>
        </motion.div>
      </div>
        
      <HeroSlider />

      {/* FEATURE STRIP - COMPACT MOBILE */}
      <div className="relative z-30 w-full bg-white border-b border-gray-100 py-4 md:py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
             {[
               { icon: Phone, text: "24/7 Support", sub: "Always Active", color: "blue" },
               { icon: Globe, text: "Wide Network", sub: "Full Coverage", color: "green" },
               { icon: HardHat, text: "Free Install", sub: "Expert Team", color: "orange" },
               { icon: Gauge, text: "High Speed", sub: "Low Latency", color: "purple" },
             ].map((feat, i) => (
                <div key={i} className="flex flex-col items-center w-[70px] sm:w-20 md:w-24">
                  <div className={`w-9 h-9 md:w-12 md:h-12 bg-${feat.color}-100 rounded-full flex items-center justify-center mb-1.5 md:mb-2`}>
                    <feat.icon className={`w-4 h-4 md:w-6 md:h-6 text-${feat.color}-600`} />
                  </div>
                  <span className="text-[10px] md:text-sm font-bold text-gray-800 leading-tight text-center">{feat.text}</span>
                  <span className="text-[8px] md:text-[9px] text-gray-400 font-medium uppercase hidden sm:block">{feat.sub}</span>
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* WI-FI PACKAGES */}
      <section id="wifi-packages" className="py-10 md:py-20 relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16">
            <p className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.25em] mb-1">Choose Speed</p>
            <h2 className="text-2xl md:text-4xl font-black mb-2 text-black tracking-tight">
              UNLIMITED <span className="text-blue-600">FIBER</span>
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">Enterprise-grade speeds. No contracts.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8"
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
                  className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-white border border-gray-100"
                >
                  <div className="h-40 md:h-48 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-80 mix-blend-multiply z-10`} />
                      <img src={plan.image} alt={plan.name} className="w-full h-full object-cover grayscale opacity-70" />
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-4">
                          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter drop-shadow-md">
                            {plan.speed}
                          </h2>
                      </div>
                      {plan.isPopular && (
                        <div className="absolute top-3 right-3 z-30 bg-yellow-400 text-blue-950 text-[9px] font-black tracking-widest px-2 py-1 rounded-full shadow-sm">
                           POPULAR
                        </div>
                      )}
                  </div>

                  <div className="relative -mt-8 bg-white rounded-t-[20px] p-5 pt-0 z-30">
                      <div className="flex justify-center -mt-3 mb-3">
                        <div className={`px-4 py-1.5 rounded-full text-white font-bold text-[10px] tracking-widest uppercase bg-gradient-to-r ${theme.gradient} shadow-sm`}>
                           {plan.name}
                        </div>
                      </div>

                      <div className="text-center mb-4 border-b border-gray-100 pb-3">
                        <span className="text-xl md:text-2xl font-black text-gray-900">{plan.price}</span>
                        <span className="text-gray-400 font-bold text-[9px] uppercase ml-1">/mo</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {plan.features.map((feature, i) => (
                           <div key={i} className={`flex items-center gap-1.5 p-1.5 rounded-lg ${theme.light} bg-opacity-20`}>
                             <feature.icon className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                             <span className="text-[9px] md:text-[10px] font-bold text-gray-700 uppercase leading-none">{feature.text}</span>
                           </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-2.5 md:py-3 rounded-xl font-black text-white uppercase text-[10px] md:text-xs tracking-widest shadow hover:opacity-90 transition-opacity bg-gradient-to-r ${theme.gradient} flex items-center justify-center gap-2`}
                      >
                        Get Connected <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOTSPOT SECTION */}
      <section id="hotspot-section" className="py-10 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-row justify-between items-end border-b border-gray-100 pb-4 mb-6">
            <div>
               <p className="text-blue-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1">Public Zones</p>
               <h2 className="text-lg md:text-3xl font-black text-blue-950 uppercase">
                 Wifi <span className="text-blue-500">Hotspots</span>
               </h2>
            </div>
            <button onClick={handleHotspotSelect} className="text-[10px] md:text-xs font-bold uppercase bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-100">
               View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
             {hotspotPlans.map((plan, index) => (
                <motion.div
                   key={index}
                   whileHover={{ y: -3 }}
                   onClick={handleHotspotSelect}
                   className={`rounded-xl p-3 md:p-4 cursor-pointer relative overflow-hidden bg-gradient-to-br ${plan.color} shadow-sm`}
                >
                   <Wifi className="absolute top-0 right-0 w-8 h-8 md:w-12 md:h-12 text-black opacity-10 m-1" />
                   <div className="relative z-10 text-blue-950 h-20 md:h-28 flex flex-col justify-between">
                       <div>
                           <h3 className="font-bold text-[10px] md:text-xs uppercase tracking-tight mb-1">{plan.name}</h3>
                           <span className="inline-block bg-white/60 text-[9px] font-black px-1.5 py-0.5 rounded">
                              {plan.duration}
                           </span>
                       </div>
                       <div>
                           <p className="text-[9px] opacity-70 uppercase font-bold">Only</p>
                           <p className="text-lg md:text-xl font-black leading-none">Ksh {plan.price}</p>
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
        href="https://wa.me/254741874200" 
        target="_blank" 
        className="fixed bottom-4 right-4 z-40 bg-[#25d366] text-white p-3 md:p-4 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <WhatsAppIcon className="w-6 h-6 md:w-7 md:h-7" />
      </motion.a>
    </div>
  );
};

// --- SUB COMPONENTS ---
const BookingModal = ({ show, onClose, plan, formData, onChange, onSubmit, isLoading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-black text-blue-950 uppercase">Order Connection</h3>
          <button onClick={onClose} className="p-1 bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase">Name</label>
            <input name="name" value={formData.name} onChange={onChange} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50" placeholder="Full Name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={onChange} required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50" placeholder="07..." />
             </div>
             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Email</label>
                <input type="email" name="email" value={formData.email} onChange={onChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50" placeholder="Optional" />
             </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase">Location</label>
            <textarea name="location" value={formData.location} onChange={onChange} required rows="2" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50" placeholder="Building, Road, Estate..."></textarea>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
             <span className="text-xs font-bold text-blue-800">{plan?.name} Package</span>
             <span className="text-xs font-black text-blue-900">{plan?.speed}</span>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl font-black text-white uppercase text-xs tracking-widest bg-blue-600 flex items-center justify-center gap-2">
            {isLoading ? "Sending..." : "Confirm Request"} <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SuccessPopup = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-xs w-full">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <h3 className="text-lg font-black text-gray-800">Request Sent!</h3>
      <p className="text-xs text-gray-500 mb-4 mt-1">We will contact you shortly via WhatsApp.</p>
      <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase w-full">Okay</button>
    </motion.div>
  </div>
);

export default MainContent;