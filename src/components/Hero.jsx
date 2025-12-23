import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, X, Wifi, Star, Phone, Zap, Smartphone, 
  Shield, Clock, Globe, ArrowRight, Users, ChevronRight,
  Sun, Moon, Gauge, Server, Activity, Lock, Send, MessageSquare,
  HardHat, MonitorPlay, Gamepad2, Briefcase, Download
} from 'lucide-react';

// --- CUSTOM ICONS ---
const WhatsAppIcon = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382C17.112 14.022 15.344 13.153 14.984 13.064C14.624 12.974 14.384 13.153 14.144 13.513C13.904 13.873 13.243 14.653 13.003 14.893C12.763 15.133 12.523 15.193 12.163 15.013C11.803 14.833 10.642 14.453 9.26196 13.223C8.18196 12.263 7.45296 11.074 7.21296 10.654C6.97296 10.234 7.18796 10.012 7.36796 9.832C7.52496 9.676 7.71696 9.426 7.89696 9.186C8.07696 8.946 8.13696 8.766 8.25696 8.526C8.37696 8.286 8.31696 8.076 8.22696 7.896C8.13696 7.716 7.41696 5.946 7.11696 5.226C6.82396 4.529 6.53096 4.624 6.30996 4.636C6.10496 4.646 5.86496 4.646 5.62496 4.646 4.99496 4.736 4.66496 5.096C4.33496 5.456 3.40496 6.326 3.40496 8.096C3.40496 9.866 4.69496 11.576 4.87496 11.816C5.05496 12.056 7.42496 15.716 11.055 17.276C11.918 17.647 12.593 17.868 13.12 18.035C14.075 18.338 14.95 18.297 15.642 18.194C16.415 18.079 18.025 17.219 18.355 16.289C18.685 15.359 18.685 14.579 18.595 14.429C18.505 14.279 18.265 14.149 17.905 13.969L17.472 14.382Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12.008 21.821C10.229 21.821 8.563 21.353 7.112 20.53L6.804 20.347L3.921 21.103L4.699 18.291L4.498 17.971C3.606 16.551 3.134 14.908 3.134 13.197C3.134 8.303 7.115 4.322 12.008 4.322C14.378 4.322 16.607 5.245 18.283 6.921C19.959 8.597 20.882 10.826 20.882 13.197C20.882 18.091 16.901 21.821 12.008 21.821Z" fillOpacity="0.2"/>
  </svg>
);

// --- SLIDER CONFIGURATION ---
const SLIDE_INTERVAL = 5000;

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://www.centurylink.com/content/dam/home/static/internet/couchfam-sm.png",
    tagline: "FAST AFFORDABLE WIFI",
    title: "OPTIMAS HOME FIBER",
    subtitle: "Empowering Digital Connectivity",
    description: "A digital future is not possible without robust infrastructure. Switch to Optimas Fiber for enterprise-grade connectivity.",
    imageRight: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE_bUnRvdSggNRAinqM6sQGTE_9JZknwTHQg&s",
    ctaAction: () => document.getElementById("wifi-packages").scrollIntoView({ behavior: "smooth" }),
    isSupportSlide: false,
  },
  {
    id: 2,
    image: "https://www.centurylink.com/content/dam/home/static/internet/couchfam-sm.png",
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
    image: "https://www.centurylink.com/content/dam/home/static/internet/couchfam-sm.png",
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
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };
    
  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 1.0 } },
    exit: { opacity: 0, transition: { duration: 0.8 } }
  };

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[85vh] flex items-center overflow-hidden bg-black">
      
      {/* BACKGROUND IMAGE WITH BETTER OBJECT-FIT */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={`Background ${currentSlide.id}`}
            className="absolute inset-0 w-full h-full object-cover md:object-center"
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ 
              objectPosition: "center 30%", // Centers the image better
            }}
          />
        </AnimatePresence>
        
        {/* DARK OVERLAY - ADJUSTED FOR BETTER VISIBILITY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/70 to-black/90 md:bg-gradient-to-r md:from-black/90 md:via-black/70 md:to-black/50"></div>
      </div>

      {/* CONTENT CONTAINER - ADJUSTED PADDING */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 md:px-6 h-full flex items-center justify-center py-12 md:py-0">
        
        {/* TEXT CONTENT - ALWAYS CENTERED */}
        <div className="w-full max-w-2xl flex flex-col items-center text-center relative z-30">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentSlide.id}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center"
            >
              <p className="text-yellow-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md">
                {currentSlide.tagline}
              </p>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-3 text-white tracking-tighter leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentSlide.title}
              </h1>
              
              <div className="inline-block bg-yellow-400 px-2 py-1 md:px-3 md:py-1.5 mb-3 -skew-x-12 origin-left shadow">
                <h2 className="text-[9px] md:text-[11px] font-black text-blue-950 tracking-wide uppercase skew-x-12">
                   {currentSlide.subtitle}
                </h2>
              </div>
              
              <p className="text-gray-200 text-[10px] md:text-[13px] max-w-[280px] md:max-w-md mb-5 leading-relaxed font-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {currentSlide.description}
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={currentSlide.ctaAction} 
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 px-4 py-2 md:px-6 md:py-3 font-bold uppercase text-[10px] md:text-[12px] tracking-widest rounded-full transition-all shadow-md flex items-center gap-2"
              >
                {currentSlide.isSupportSlide ? <WhatsAppIcon size={12}/> : <ArrowRight size={12}/>}
                {currentSlide.isSupportSlide ? "TALK TO US NOW" : "VIEW PACKAGES"}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>
    </section>
  );
};

// ================================
// 🔥 THEMES & PLANS
// ================================

const PACKAGE_THEMES = [
  { name: 'pink', gradient: 'from-[#ec008c] to-[#fc6767]', accent: '#ec008c', light: 'bg-pink-50 text-pink-600' },
  { name: 'blue', gradient: 'from-[#0061a8] to-[#6dd5fa]', accent: '#0061a8', light: 'bg-blue-50 text-blue-600' },
  { name: 'purple', gradient: 'from-[#662d91] to-[#9b59b6]', accent: '#662d91', light: 'bg-purple-50 text-purple-600' },
  { name: 'orange', gradient: 'from-[#f12711] to-[#f5af19]', accent: '#f12711', light: 'bg-orange-50 text-orange-600' },
  { name: 'cyan', gradient: 'from-[#00c6ff] to-[#0072ff]', accent: '#00c6ff', light: 'bg-cyan-50 text-cyan-600' },
  { name: 'green', gradient: 'from-[#11998e] to-[#38ef7d]', accent: '#11998e', light: 'bg-green-50 text-green-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
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
  {
    name: "Jumbo",
    price: "Ksh 1,500",
    speed: "8 Mbps",
    image: PLAN_IMAGES["Jumbo"],
    features: [
      { text: "Uncapped Data", icon: Download },
      { text: "1-2 Devices", icon: Users },
      { text: "Free Install", icon: CheckCircle },
      { text: "24/7 Support", icon: Phone }
    ],
    isPopular: false
  },
  {
    name: "Buffalo",
    price: "Ksh 2,000",
    speed: "15 Mbps",
    image: PLAN_IMAGES["Buffalo"],
    features: [
      { text: "HD Streaming", icon: MonitorPlay },
      { text: "Low Latency", icon: Zap },
      { text: "Free Install", icon: CheckCircle },
      { text: "24/7 Support", icon: Phone }
    ],
    isPopular: false
  },
  {
    name: "Ndovu",
    price: "Ksh 2,500",
    speed: "20 Mbps",
    image: PLAN_IMAGES["Ndovu"],
    features: [
      { text: "Dedicated Line", icon: Server },
      { text: "Home Office", icon: Briefcase },
      { text: "Free Install", icon: CheckCircle },
      { text: "Priority Help", icon: Star }
    ],
    isPopular: true
  },
  {
    name: "Gazzelle",
    price: "Ksh 3,000",
    speed: "30 Mbps",
    image: PLAN_IMAGES["Gazzelle"],
    features: [
      { text: "4K Streaming", icon: MonitorPlay },
      { text: "Gaming Ready", icon: Gamepad2 },
      { text: "Smart Home", icon: Smartphone },
      { text: "Free Install", icon: CheckCircle }
    ],
    isPopular: false
  },
  {
    name: "Tiger",
    price: "Ksh 4,000",
    speed: "40 Mbps",
    image: PLAN_IMAGES["Tiger"],
    features: [
      { text: "Ultra Low Ping", icon: Activity },
      { text: "Pro Gaming", icon: Gamepad2 },
      { text: "Dedicated Mgr", icon: Users },
      { text: "Free Install", icon: CheckCircle }
    ],
    isPopular: false
  },
  {
    name: "Chui",
    price: "Ksh 5,000",
    speed: "60 Mbps",
    image: PLAN_IMAGES["Chui"],
    features: [
      { text: "Max Speed", icon: Gauge },
      { text: "Multi 4K", icon: MonitorPlay },
      { text: "Premium SLA", icon: Shield },
      { text: "Free Install", icon: CheckCircle }
    ],
    isPopular: false
  },
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

  const BackgroundPattern = () => (
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-[#015B97]">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#d0b216] opacity-10"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-[#d0b216] opacity-10"
          animate={{ scale: [1.2, 1, 1.2], rotate: [180, 270, 180] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-white`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center pointer-events-none">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-black text-base md:text-lg text-white tracking-tighter pointer-events-auto drop-shadow">
          OPTIMAS<span className="text-yellow-500">FIBER</span>
        </motion.div>
      </div>
        
      <HeroSlider />

      {/* Feature Strip - IMPROVED ICONS */}
      <div className="relative z-30 w-full bg-white border-b border-gray-100 py-5 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
           <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
             <div className="flex flex-col items-center group cursor-default transition-all w-20 md:w-24">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-blue-600" strokeWidth={2} />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-800 tracking-tight text-center">24/7 Support</span>
                <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Always Active</span>
             </div>
             
             <div className="flex flex-col items-center group cursor-default transition-all w-20 md:w-24">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200 transition-colors">
                  <Globe className="w-5 h-5 md:w-6 md:h-6 text-green-600" strokeWidth={2} />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-800 tracking-tight text-center">Wide Network</span>
                <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Full Coverage</span>
             </div>
             
             <div className="flex flex-col items-center group cursor-default transition-all w-20 md:w-24">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-200 transition-colors">
                  <HardHat className="w-5 h-5 md:w-6 md:h-6 text-orange-600" strokeWidth={2} />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-800 tracking-tight text-center">Free Install</span>
                <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Expert Team</span>
             </div>
             
             <div className="flex flex-col items-center group cursor-default transition-all w-20 md:w-24">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                  <Gauge className="w-5 h-5 md:w-6 md:h-6 text-purple-600" strokeWidth={2} />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-800 tracking-tight text-center">High Speed</span>
                <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Low Latency</span>
             </div>
           </div>
        </div>
      </div>

      {/* WI-FI PACKAGES */}
      <section id="wifi-packages" className="py-20 md:py-24 relative overflow-hidden bg-gray-50 text-gray-800">
        <BackgroundPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <p className="text-yellow-600 text-[10px] font-bold uppercase tracking-[0.25em] mb-2">Choose Your Speed</p>
            <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 text-black tracking-tight">
              unlimited <span className="text-blue-600">fiber internet</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">Enterprise-grade speeds for your home. No contracts, cancel anytime.</p>
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
                  whileHover={{ y: -5 }}
                  className="relative rounded-2xl overflow-hidden shadow-lg group bg-white border border-gray-100"
                >
                  <div className="h-48 md:h-52 relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-80 mix-blend-multiply z-10`} />
                      <img src={plan.image} alt={plan.name} className="w-full h-full object-cover grayscale opacity-70 group-hover:scale-105 transition-transform" />
                      
                      {/* SPEED IN BLACK (NOT WHITE) */}
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-6 md:pb-8">
                          <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                            {plan.speed}
                          </h2>
                      </div>

                      {plan.isPopular && (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30 bg-yellow-400 text-blue-950 text-[9px] md:text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full shadow">
                           Popular
                        </div>
                      )}
                  </div>

                  <div className="relative -mt-10 md:-mt-12 bg-white rounded-t-[20px] md:rounded-t-[24px] p-5 md:p-6 pt-0 z-30">
                      <div className="flex justify-center -mt-3 md:-mt-4 mb-3 md:mb-4">
                        <div className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-white font-bold text-[9px] md:text-[10px] tracking-[0.15em] uppercase bg-gradient-to-r ${theme.gradient}`}>
                           {plan.name}
                        </div>
                      </div>

                      <div className="text-center mb-4 md:mb-6 border-b border-gray-100 pb-3 md:pb-4">
                        <span className="text-xl md:text-2xl font-black text-black">{plan.price}</span>
                        <span className="text-gray-500 font-bold text-[9px] md:text-[10px] uppercase ml-1">/month</span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-1.5 gap-y-2.5 md:gap-3 mb-4 md:mb-6">
                        {plan.features.map((feature, i) => (
                           <div key={i} className={`flex items-center gap-1.5 p-1 rounded-md ${theme.light} bg-opacity-20`}>
                             <feature.icon size={12} md={14} className="flex-shrink-0" strokeWidth={2.5} />
                             <span className="text-[9px] md:text-[10px] font-bold text-gray-700 uppercase tracking-wide">{feature.text}</span>
                           </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-2.5 md:py-3 rounded-full font-black text-white uppercase text-[9px] md:text-[10px] tracking-widest shadow transition-all bg-gradient-to-r ${theme.gradient} flex items-center justify-center gap-1.5`}
                      >
                        Get Connected <ChevronRight size={12} md={14} />
                      </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOTSPOT SECTION */}
      <section id="hotspot-section" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-3 md:gap-4 border-b border-gray-200 pb-4 md:pb-6 mb-6 md:mb-8">
            <div>
               <p className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Public Zones</p>
               <h2 className="text-xl md:text-2xl font-black text-blue-950 uppercase">
                 Wifi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Hotspot</span> Passes
               </h2>
            </div>
            <button onClick={handleHotspotSelect} className="text-[11px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-white/80">
               View All Zones <ArrowRight size={12} md={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3">
             {hotspotPlans.map((plan, index) => (
                <motion.div
                   key={index}
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ delay: index * 0.08 }}
                   whileHover={{ y: -4 }}
                   onClick={handleHotspotSelect}
                   className={`rounded-lg md:rounded-xl p-3 md:p-4 cursor-pointer relative overflow-hidden group bg-gradient-to-br ${plan.color} shadow`}
                >
                   <div className="absolute top-0 right-0 p-1.5 opacity-15">
                      <Wifi size={36} md={44} className="text-black" />
                   </div>
                   <div className="relative z-10 text-blue-950 min-h-[90px] md:min-h-[110px] flex flex-col justify-between">
                      <div>
                          <h3 className="font-bold text-[10px] md:text-xs uppercase tracking-wide mb-1.5">{plan.name}</h3>
                          <span className="inline-block bg-white/60 text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded backdrop-blur-sm">
                             {plan.duration}
                          </span>
                      </div>
                      <div>
                          <p className="text-[9px] md:text-[10px] opacity-80 uppercase tracking-wider font-bold">Only</p>
                          <p className="text-lg md:text-xl font-black">Ksh {plan.price}</p>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* MODALS & WHATSAPP BUTTON */}
      <AnimatePresence>
        {showForm && <BookingModal show={showForm} onClose={() => setShowForm(false)} plan={selectedPlan} formData={formData} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} onSubmit={handleSubmit} isLoading={isLoading} />}
        {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
      </AnimatePresence>
      
      <motion.a 
        href="https://wa.me/254741874200" 
        target="_blank" 
        className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-40 bg-[#25d366] text-white p-3 md:p-4 rounded-full shadow-xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <WhatsAppIcon size={24} md={28} />
      </motion.a>
    </div>
  );
};

// --- MODALS ---
const BookingModal = ({ show, onClose, plan, formData, onChange, onSubmit, isLoading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md md:max-w-lg rounded-2xl bg-white p-5 md:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
          <div>
            <span className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest">New Order</span>
            <h3 className="text-lg md:text-xl font-black text-blue-950 uppercase">Get Connected</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={16} md={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5 md:space-y-4">
          <div className="space-y-1">
            <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-wide">Full Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              required 
              className="w-full px-3.5 py-2.5 md:px-4 md:py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1">
              <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-wide">Phone *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={onChange} 
                required 
                className="w-full px-3.5 py-2.5 md:px-4 md:py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="07..." 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-wide">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={onChange} 
                className="w-full px-3.5 py-2.5 md:px-4 md:py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@mail.com" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-wide">Installation Location *</label>
            <textarea 
              name="location" 
              value={formData.location} 
              onChange={onChange} 
              required 
              rows="2"
              className="w-full px-3.5 py-2.5 md:px-4 md:py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Building name, Road, Floor..." 
            ></textarea>
          </div>
          <div className="p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-[9px] md:text-[10px] text-blue-600 font-bold uppercase tracking-wider">Selected Plan</p>
            <p className="font-black text-blue-900 text-sm md:text-base">{plan?.name} ({plan?.speed})</p>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 md:py-4 rounded-xl font-black text-white uppercase text-[10px] md:text-xs tracking-widest bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow"
          >
            {isLoading ? "Processing..." : "Confirm & Send Request"}
            {!isLoading && <Send size={14} md={16} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SuccessPopup = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] backdrop-blur" onClick={onClose}>
    <motion.div 
      initial={{ scale: 0.6, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      exit={{ scale: 0.6, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl text-center max-w-xs md:max-w-sm mx-4"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
        <CheckCircle size={28} md={32} className="text-green-600" />
      </div>
      <h3 className="text-lg md:text-xl font-black text-gray-800 mb-2">Request Sent!</h3>
      <p className="text-[12px] md:text-sm text-gray-600 mb-4 md:mb-6 font-medium">
        We have received your details. Our team will contact you shortly via WhatsApp.
      </p>
      <button 
        onClick={onClose} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest"
      >
        Awesome
      </button>
    </motion.div>
  </div>
);

export default MainContent;