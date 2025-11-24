import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, X, Wifi, Star, Phone, Zap, Smartphone, 
  Shield, Clock, Globe, ArrowRight, Users, ChevronRight,
  Sun, Moon, Gauge, Server, Activity, Lock, Send, MessageSquare
} from 'lucide-react';

// --- CONTEXT REMOVAL: ThemeContext is no longer used for dynamic theming ---

const ThemeProvider = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

// --- CUSTOM ICONS ---
const WhatsAppIcon = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382C17.112 14.022 15.344 13.153 14.984 13.064C14.624 12.974 14.384 13.153 14.144 13.513C13.904 13.873 13.243 14.653 13.003 14.893C12.763 15.133 12.523 15.193 12.163 15.013C11.803 14.833 10.642 14.453 9.26196 13.223C8.18196 12.263 7.45296 11.074 7.21296 10.654C6.97296 10.234 7.18796 10.012 7.36796 9.832C7.52496 9.676 7.71696 9.426 7.89696 9.186C8.07696 8.946 8.13696 8.766 8.25696 8.526C8.37696 8.286 8.31696 8.076 8.22696 7.896C8.13696 7.716 7.41696 5.946 7.11696 5.226C6.82396 4.529 6.53096 4.624 6.30996 4.636C6.10496 4.646 5.86496 4.646 5.62496 4.646C5.38496 4.646 4.99496 4.736 4.66496 5.096C4.33496 5.456 3.40496 6.326 3.40496 8.096C3.40496 9.866 4.69496 11.576 4.87496 11.816C5.05496 12.056 7.42496 15.716 11.055 17.276C11.918 17.647 12.593 17.868 13.12 18.035C14.075 18.338 14.95 18.297 15.642 18.194C16.415 18.079 18.025 17.219 18.355 16.289C18.685 15.359 18.685 14.579 18.595 14.429C18.505 14.279 18.265 14.149 17.905 13.969L17.472 14.382Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12.008 21.821C10.229 21.821 8.563 21.353 7.112 20.53L6.804 20.347L3.921 21.103L4.699 18.291L4.498 17.971C3.606 16.551 3.134 14.908 3.134 13.197C3.134 8.303 7.115 4.322 12.008 4.322C14.378 4.322 16.607 5.245 18.283 6.921C19.959 8.597 20.882 10.826 20.882 13.197C20.882 18.091 16.901 21.821 12.008 21.821Z" fillOpacity="0.2"/>
  </svg>
);

// --- SLIDER CONFIGURATION ---
const SLIDE_INTERVAL = 5000; // 5 seconds

const HERO_SLIDES = [
  {
    id: 1,
    image: "/optic.jpeg",
    tagline: "FAST AFFORDABLE WIFI",
    title: "OPTIMAS HOME FIBER",
    subtitle: "Empowering Digital Connectivity",
    description: "A digital future is not possible without robust infrastructure. Switch to Optimas Fiber for enterprise-grade connectivity.",
    imageRight: "https://www.vox.co.za/wp-content/uploads/2025/05/Enterprise-connectivity_resized.png",
    ctaAction: () => document.getElementById("wifi-packages").scrollIntoView({ behavior: "smooth" }),
    isSupportSlide: false,
  },
  {
    id: 2,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDmSrnKyvP5kyxygJxblpk5vtnWdSPz03hFDcsNlDxUZD6BmmpTnIHt1CiDXZMRqFoKL0&usqp=CAU",
    tagline: "HIGH SPEED, LOW LATENCY",
    title: "FUTURE-PROOF CONNECTIVITY",
    subtitle: "Ideal for Streaming and Gaming",
    description: "Unleash the full potential of your smart home with lightning-fast speeds and unparalleled network stability, even during peak hours.",
    imageRight: "https://nhtc.coop/wp-content/uploads/2023/02/AdobeStock_516290951-RESIZED.jpeg",
    ctaAction: () => document.getElementById("wifi-packages").scrollIntoView({ behavior: "smooth" }),
    isSupportSlide: false,
  },
  {
    id: 3,
    image: "https://media.istockphoto.com/id/1494073880/photo/a-man-holding-icon-virtual-24-7-support-services-for-worldwide-nonstop-and-full-time.jpg?s=612x612&w=0&k=20&c=4YF-otaX3n8OiPOC4L_-_pAX1ibayzdvpkK1Ih2-p50=",
    tagline: "24/7 DEDICATED SUPPORT",
    title: "RELIABILITY YOU CAN TRUST",
    subtitle: "We're Always Here For You",
    description: "Need help? Our expert support team is available around the clock to ensure your connection remains stable and your digital life uninterrupted.",
    imageRight: "https://rivrtech.net/wp-content/uploads/2023/08/RT_ResWiFi_Command.jpg",
    ctaAction: () => window.open('https://wa.me/254741874200', '_blank'),
    isSupportSlide: true,
  },
];

// --- HERO SLIDER COMPONENT ---
const HeroSlider = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = HERO_SLIDES[currentSlideIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const contentVariants = {
    enter: { opacity: 0, x: -50 },
    center: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5 } }
  };
  
  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 1.0 } }
  };

  return (
    <section className="relative w-full min-h-[55vh] md:min-h-[60vh] flex items-center overflow-hidden bg-blue-950 pb-12">
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={`Background ${currentSlide.id}`}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
          />
        </AnimatePresence>
      </div>
      
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-blue-950 via-blue-900/90 to-transparent"></div>
      
      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 h-full flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 pt-20 md:pt-0">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentSlide.id}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <p className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-2">{currentSlide.tagline}</p>
              <h1 className="text-4xl md:text-5xl font-bold uppercase mb-1 text-white">{currentSlide.title}</h1>
              <h2 className="text-xl md:text-3xl font-bold text-black mb-4">{currentSlide.subtitle}</h2>
              <p className="text-black text-xs md:text-sm max-w-sm mb-6 leading-relaxed">
                {currentSlide.description}
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={currentSlide.ctaAction} 
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-full transition-all shadow-lg flex items-center gap-2"
              >
                {currentSlide.isSupportSlide ? 
                    <WhatsAppIcon size={14}/> : 
                    <ArrowRight size={14}/>}
                {currentSlide.isSupportSlide ? "TALK TO US NOW" : "VIEW PACKAGES"}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="hidden md:flex w-1/2 h-full items-end justify-end mt-12 md:mt-0 relative">
          <motion.img 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} 
            src={currentSlide.imageRight}
            alt="Optimas Team" 
            className="w-full max-w-md object-contain rounded-t-xl shadow-2xl relative z-20" 
            style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }} 
          />
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 md:bottom-10 z-30">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlideIndex ? 'bg-yellow-500 w-6' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- THEME & COLOR CONFIGURATION ---
const cardThemes = {
  blue: {
    gradient: "bg-gradient-to-b from-cyan-500 to-blue-600", 
    buttonBg: "bg-blue-600 text-white hover:bg-blue-700",
    featureIcon: "text-blue-500",
    shadow: "shadow-lg shadow-blue-500/10",
    border: "border-blue-100",
    textColor: "text-blue-900"
  },
  green: {
    gradient: "bg-gradient-to-b from-emerald-400 to-teal-600",
    buttonBg: "bg-teal-600 text-white hover:bg-teal-700", 
    featureIcon: "text-teal-500",
    shadow: "shadow-lg shadow-teal-500/10",
    border: "border-teal-100",
    textColor: "text-teal-900"
  },
  orange: {
    gradient: "bg-gradient-to-b from-amber-400 to-orange-600",
    buttonBg: "bg-orange-600 text-white hover:bg-orange-700",
    featureIcon: "text-orange-500",
    shadow: "shadow-lg shadow-orange-500/10",
    border: "border-orange-100",
    textColor: "text-orange-900"
  },
  purple: {
    gradient: "bg-gradient-to-b from-fuchsia-400 to-purple-600",
    buttonBg: "bg-purple-600 text-white hover:bg-purple-700",
    featureIcon: "text-purple-500",
    shadow: "shadow-lg shadow-purple-500/10",
    border: "border-purple-100",
    textColor: "text-purple-900"
  },
  red: {
    gradient: "bg-gradient-to-b from-rose-400 to-red-600",
    buttonBg: "bg-red-600 text-white hover:bg-red-700",
    featureIcon: "text-red-500",
    shadow: "shadow-lg shadow-red-500/10",
    border: "border-red-100",
    textColor: "text-rose-900"
  }
};

// --- PLANS DATA ---
const plans = [
  { id: 1, name: "Jumbo", price: "1,500", speed: "6", unit: "Mbps", users: "1-2 Devices", features: ["Uncapped Fibre", "Standard Router", "24/7 Support"], theme: "blue" },
  { id: 2, name: "Buffalo", price: "2,000", speed: "12", unit: "Mbps", users: "3-4 Devices", features: ["HD Streaming Ready", "Standard Router", "Low Latency"], theme: "green" },
  { id: 3, name: "Ndovu", price: "2,500", speed: "20", unit: "Mbps", users: "Home Office", features: ["Dedicated Line", "Priority Support", "Video Conferencing"], theme: "orange", popular: true },
  { id: 4, name: "Gazzelle", price: "3,000", speed: "30", unit: "Mbps", users: "Smart Home", features: ["4K Streaming", "Gaming Optimized", "Free Installation*"], theme: "purple" },
  { id: 5, name: "Tiger", price: "4,000", speed: "40", unit: "Mbps", users: "Heavy Usage", features: ["Ultra-Low Latency", "Pro Gaming", "Dedicated Account Manager"], theme: "red" },
  { id: 6, name: "Chui", price: "6,000", speed: "60", unit: "Mbps", users: "Power User", features: ["Maximum Throughput", "Multiple 4K Streams", "Premium SLA"], theme: "blue" },
];

const mobilePlans = [
  { id: 1, name: "Quick Access", price: "15", duration: "2 Hours", devices: "1 Device", features: ["Browsing", "Socials"], link: "http://wifi.optimassys.co.ke/index.php?_route=main", theme: "blue" },
  { id: 2, name: "All Day", price: "30", duration: "12 Hours", devices: "1 Device", features: ["Music", "Socials"], link: "http://wifi.optimassys.co.ke/index.php?_route=main", theme: "green" },
  { id: 3, name: "Daily Pro", price: "40", duration: "24 Hours", devices: "1 Device", features: ["Full Access", "Stream"], popular: true, link: "http://wifi.optimassys.co.ke/index.php?_route=main", theme: "orange" },
  { id: 4, name: "Weekly", price: "250", duration: "7 Days", devices: "2 Devices", features: ["Unlimited", "HD Video"], link: "http://wifi.optimassys.co.ke/index.php?_route=main", theme: "purple" },
  { id: 5, name: "Monthly", price: "610", duration: "30 Days", devices: "1 Device", features: ["Priority", "Access"], link: "http://wifi.optimassys.co.ke/index.php?_route=main", theme: "red" },
  { id: 6, name: "Power Dual", price: "1000", duration: "30 Days", devices: "2 Devices", features: ["4K Ready", "Dual User"], link: "http://wifi.optimassys.co.ke/index.php?_route=main", theme: "blue" },
];

// --- VUMA STYLE CARD (FIBER) ---
const VumaCard = ({ plan, onSelect }) => {
  const theme = cardThemes[plan.theme] || cardThemes.blue;

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ 
        y: -10,
        transition: { type: "spring", stiffness: 200, damping: 20 } 
      }}
      className={`group relative flex flex-col bg-white rounded-3xl overflow-visible h-full ${theme.shadow} border border-gray-100 hover:shadow-2xl transition-all duration-300`}
    >
      {/* CARD HEADER */}
      <div className={`relative h-[220px] ${theme.gradient} rounded-t-3xl rounded-b-[40px] flex flex-col items-center justify-center text-white z-10 overflow-hidden`}>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        {/* Popular Badge */}
        {plan.popular && (
          <div className="absolute top-4 right-4 z-20">
             <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider">
               <Star size={10} fill="currentColor" /> Best Seller
             </span>
          </div>
        )}

        {/* Plan Name */}
        <h3 className="relative z-10 text-sm font-bold tracking-[0.2em] uppercase text-white/90 mb-2">{plan.name}</h3>
        
        {/* Speed - The Hero Element */}
        <div className="relative z-10 flex items-baseline justify-center mb-1">
            <span className="text-7xl font-black tracking-tighter drop-shadow-sm">{plan.speed}</span>
            <span className="text-xl font-bold ml-1 opacity-90">{plan.unit}</span>
        </div>

        {/* Price */}
        <p className="relative z-10 text-lg font-medium opacity-90">
            Ksh {plan.price} <span className="text-sm font-normal">/mo</span>
        </p>

        {/* FLOATING ACTION BUTTON */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-center z-30">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => onSelect(plan)}
               className={`${theme.buttonBg} py-3 px-8 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 border-4 border-white transition-colors`}
             >
               Get Connected <ChevronRight size={14} strokeWidth={3} />
             </motion.button>
        </div>
      </div>

      {/* CARD BODY (FEATURES) */}
      <div className="pt-10 pb-8 px-8 flex-grow flex flex-col items-center w-full">
         <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full text-xs font-semibold text-gray-500 border border-gray-100">
             <Users size={12} /> {plan.users}
         </div>
        
        <ul className="space-y-4 w-full text-center">
          {plan.features.map((feat, i) => (
            <li key={i} className="flex items-center justify-center gap-3 text-sm text-gray-600 font-medium">
              <CheckCircle size={16} className={`${theme.featureIcon} flex-shrink-0`} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// --- UPDATED HOTSPOT CARD (DataPass) - MATCHING FIBER CARD EXACTLY ---
const DataPassCard = ({ plan }) => {
  const theme = cardThemes[plan.theme] || cardThemes.blue;
  
  // Helper to split duration (e.g., "2 Hours" -> ["2", "Hours"])
  const splitDuration = plan.duration.split(' ');
  const value = splitDuration[0];
  const unit = splitDuration.slice(1).join(' ');

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ 
        y: -10, 
        transition: { type: "spring", stiffness: 300 } 
      }}
      className={`relative flex flex-col bg-white rounded-3xl overflow-visible h-full ${theme.shadow} border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer`}
      onClick={() => window.open(plan.link, '_blank')}
    >
      {/* Header - Identical to VumaCard */}
      <div className={`relative h-[200px] ${theme.gradient} rounded-t-3xl rounded-b-[40px] flex flex-col items-center justify-center text-white px-3 z-10 overflow-hidden`}>
        
        {/* Abstract Noise */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>

        {plan.popular && (
          <div className="absolute top-4 right-4">
             <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
               <Zap size={10} fill="currentColor" /> HOT
             </span>
          </div>
        )}

        <h3 className="relative z-10 text-xs font-bold tracking-[0.2em] uppercase mb-1 opacity-90">{plan.name}</h3>
        
        {/* DURATION - Styled as HERO like Speed */}
        <div className="relative z-10 flex items-baseline justify-center">
            <span className="text-6xl font-black tracking-tighter drop-shadow-sm leading-none">{value}</span>
            <span className="text-lg font-bold ml-1 opacity-90 uppercase">{unit}</span>
        </div>

        <div className="relative z-10 text-center mt-1">
             <span className="text-xl font-bold text-white drop-shadow-md">Ksh {plan.price}</span>
        </div>

        {/* Floating Button */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-center z-20">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className={`bg-gray-900 text-white hover:bg-black px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 border-4 border-white transition-colors`}
             >
               Buy Now <ChevronRight size={12} />
             </motion.button>
        </div>
      </div>

      {/* Body */}
      <div className="pt-10 pb-6 px-4 flex-grow flex flex-col items-center">
         <div className={`mb-4 flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-full bg-gray-50 text-gray-500`}>
             <Smartphone size={12} /> {plan.devices}
         </div>
        
        <ul className="space-y-3 w-full flex flex-col items-center">
          {plan.features.map((feat, i) => (
            <li key={i} className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${theme.buttonBg}`}></div>
               <span className={`text-xs font-medium text-gray-600`}>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const BookingModal = ({ show, onClose, plan, formData, onChange, onSubmit, isLoading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-white p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold text-gray-900`}>Request Your Connection</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={18} className={'text-black'}/></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className={`block text-sm font-semibold text-black`}>Full Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              required 
              className={`w-full px-4 py-3 rounded-lg border bg-white border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`} 
              placeholder="Enter your full name" 
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-sm font-semibold text-black`}>Phone Number *</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={onChange} 
              required 
              className={`w-full px-4 py-3 rounded-lg border bg-white border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`} 
              placeholder="Enter your WhatsApp number" 
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-sm font-semibold text-black`}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={onChange} 
              className={`w-full px-4 py-3 rounded-lg border bg-white border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`} 
              placeholder="Enter your email address" 
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-sm font-semibold text-black`}>Location *</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={onChange} 
              required 
              className={`w-full px-4 py-3 rounded-lg border bg-white border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`} 
              placeholder="Enter your location" 
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-sm font-semibold text-black`}>Package</label>
            <input 
              type="text" 
              value={plan?.name || 'Not Selected'}
              readOnly
              className={`w-full px-4 py-3 rounded-lg bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed`} 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading} 
              className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <>
                  <Send size={16} /> Submit Request
                </>
              )}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => window.open('https://wa.me/254741874200', '_blank')}
              className="flex-1 py-3 border-2 border-blue-900 text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all"
            >
              Contact Sales
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const SuccessPopup = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110]" onClick={onClose}>
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl bg-white text-gray-900`} onClick={(e) => e.stopPropagation()}>
      <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
      <h3 className="text-2xl font-black mb-2">Order Received</h3>
      <p className="text-sm opacity-60 mb-8 leading-relaxed">Your connection request has been generated. Redirecting you to our WhatsApp channel.</p>
      <button onClick={onClose} className="w-full py-3 rounded-xl bg-gray-100 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">Dismiss</button>
    </motion.div>
  </div>
);

// --- MAIN CONTENT ---
const MainContent = () => {
  const navigate = useNavigate();
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const msg = `*NEW CONNECTION REQUEST*\n\n👤 Name: ${formData.name}\n📱 Phone: ${formData.phone}\n📧 Email: ${formData.email}\n📍 Location: ${formData.location}\n\n📦 Package: ${selectedPlan.name} (${selectedPlan.speed}${selectedPlan.unit})\n💰 Price: Ksh ${selectedPlan.price}`;
      window.open(`https://api.whatsapp.com/send?phone=254741874200&text=${encodeURIComponent(msg)}`, '_blank');
      setIsLoading(false);
      setShowForm(false);
      setShowSuccess(true);
      setFormData({ name: "", email: "", phone: "", location: "", connectionType: "" });
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-gray-50`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-black text-lg text-white tracking-tighter pointer-events-auto drop-shadow-md">
          OPTIMAS<span className="text-blue-400">FIBER</span>
        </motion.div>
      </div>

      <HeroSlider />

      <div className={`relative z-30 -mt-12 md:-mt-10 px-4 mb-8 hidden sm:block`}>
        <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className={`max-w-5xl mx-auto rounded-full shadow-2xl bg-white/95 backdrop-blur-md py-4 px-8 overflow-hidden`}
        >
          <div className="flex flex-wrap justify-between items-center divide-x divide-gray-200">
            {[
              { icon: Gauge, t: "99.9%", d: "Uptime" },
              { icon: Activity, t: "< 5ms", d: "Ping" },
              { icon: Server, t: "1:1", d: "Contention" },
              { icon: Lock, t: "AES-256", d: "Security" }
            ].map((f, i) => (
              <div key={i} className="flex-1 flex flex-col md:flex-row items-center justify-center gap-3 px-2 md:px-6 text-center md:text-left group">
                <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition">
                  <f.icon size={16} className="text-blue-600" />
                </div>
                <div>
                  <h4 className={`font-black text-sm md:text-base leading-none text-gray-900`}>{f.t}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <section id="wifi-packages" className={`py-16 px-4 bg-gray-50`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                className={`text-4xl font-black mb-3 text-gray-900`}
              >
                Fiber <span className="text-blue-600">Plans</span>
              </motion.h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto font-medium">Symmetrical speeds. Uncapped. Unshaped.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16"
          >
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}>
                <VumaCard plan={plan} onSelect={handlePlanSelect} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DATA PASS SECTION */}
      <section className={`py-16 px-4 bg-white`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-black mb-3 text-gray-900`}>
              Hotspot <span className="text-blue-600">Passes</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto font-medium">Instant access to our public Wi-Fi zones.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 gap-y-12"
          >
            {mobilePlans.map((plan) => (
              <motion.div key={plan.id} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}>
                <DataPassCard plan={plan} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-950 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black tracking-tighter mb-4">OPTIMAS<span className="text-blue-400">FIBER</span></h3>
            <p className="text-blue-200/60 text-sm max-w-xs leading-relaxed">
              Connecting homes and businesses with next-generation fiber optics. Experience the speed of light.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-blue-400">Contact</h4>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li className="flex items-center gap-2"><Phone size={14}/> +254 741 874 200</li>
              <li className="flex items-center gap-2"><Globe size={14}/> www.optimas.co.ke</li>
              <li className="flex items-center gap-2"><Clock size={14}/> Mon - Sat: 8am - 6pm</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-blue-400">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li className="hover:text-white cursor-pointer transition">Client Portal</li>
              <li className="hover:text-white cursor-pointer transition">Coverage Map</li>
              <li className="hover:text-white cursor-pointer transition">Speed Test</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-blue-900 flex flex-col md:flex-row justify-between items-center text-xs text-blue-500">
          <p>© 2025 Optimas Systems Limited. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
             <span>Privacy Policy</span>
             <span>Terms of Service</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showForm && (
          <BookingModal 
            show={showForm} 
            onClose={() => setShowForm(false)} 
            plan={selectedPlan}
            formData={formData}
            onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
        {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default MainContent;