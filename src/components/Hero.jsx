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
    <section className="relative w-full min-h-[55vh] md:min-h-[60vh] flex items-center overflow-hidden bg-blue-950 pb-16">
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
              {/* TAGLINE: Small, Yellow, Spaced out */}
              <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-3 pl-1">
                {currentSlide.tagline}
              </p>

              {/* TITLE: Shrunk, White, One Line, Non-overlapping */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-3 text-white tracking-tighter whitespace-nowrap leading-none">
                {currentSlide.title}
              </h1>

              {/* SUBTITLE: Black text on Yellow BG, slightly rotated, smaller text */}
              <div className="inline-block bg-yellow-400 px-3 py-1 mb-5 -skew-x-12 origin-left">
                <h2 className="text-xs md:text-sm font-black text-blue-950 tracking-wide uppercase skew-x-12">
                   {currentSlide.subtitle}
                </h2>
              </div>

              {/* DESCRIPTION: Small text, light gray, fixed width */}
              <p className="text-gray-300 text-xs max-w-xs mb-6 leading-relaxed font-light">
                {currentSlide.description}
              </p>

              {/* BUTTON: Yellow Background, Blue Text */}
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={currentSlide.ctaAction} 
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 px-6 py-2.5 font-bold uppercase text-[10px] tracking-widest rounded-full transition-all shadow-lg flex items-center gap-2"
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
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlideIndex ? 'bg-yellow-400 w-6' : 'bg-white/30 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
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
  "Jumbo": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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

  return (
    <div className={`min-h-screen bg-white`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* HEADER LOGO */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-black text-lg text-white tracking-tighter pointer-events-auto drop-shadow-md">
          OPTIMAS<span className="text-yellow-500">FIBER</span>
        </motion.div>
      </div>
       
      <HeroSlider />

      {/* ======== FEATURE STRIP ======== */}
      <div className="relative z-30 w-full -mt-8">
        <div className="max-w-6xl mx-auto px-4">
           <div className="bg-white rounded-xl shadow-2xl border-b-4 border-yellow-500 py-6 px-4 md:px-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center justify-between text-center divide-x-0 md:divide-x divide-gray-100">
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 group">
                   <Phone className="w-5 h-5 text-blue-900" strokeWidth={2.5} />
                   <div className="text-left">
                     <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support</span>
                     <span className="block text-xs font-black text-blue-950 uppercase tracking-tight">24/7 Active</span>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 group">
                   <Globe className="w-5 h-5 text-blue-900" strokeWidth={2.5} />
                   <div className="text-left">
                     <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network</span>
                     <span className="block text-xs font-black text-blue-950 uppercase tracking-tight">Wide Cover</span>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 group">
                   <HardHat className="w-5 h-5 text-blue-900" strokeWidth={2.5} />
                   <div className="text-left">
                     <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Install</span>
                     <span className="block text-xs font-black text-blue-950 uppercase tracking-tight">Expert Team</span>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 group">
                   <Gauge className="w-5 h-5 text-blue-900" strokeWidth={2.5} />
                   <div className="text-left">
                     <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speed</span>
                     <span className="block text-xs font-black text-blue-950 uppercase tracking-tight">High Bandwidth</span>
                   </div>
                </div>

              </div>
           </div>
        </div>
      </div>

      {/* ======== WI-FI PACKAGES ======== */}
      <section id="wifi-packages" className="py-24 relative overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-yellow-600 text-[10px] font-bold uppercase tracking-[0.25em] mb-2">Choose Your Speed</p>
            {/* UPDATED: Lowercase, Black & Blue text */}
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-black tracking-tight lowercase">
              unlimited <span className="text-blue-600">fiber internet</span>
            </h2>
            <p className="text-slate-500 text-sm font-light max-w-lg mx-auto">Enterprise-grade speeds for your home. No contracts, cancel anytime.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  className="relative rounded-2xl overflow-hidden shadow-xl group bg-white border border-gray-100"
                >
                  {/* Top Image Section */}
                  <div className="h-52 relative">
                      {/* RESTORED: Original High Opacity + Multiply Blend for Vibrant Color */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-90 mix-blend-multiply z-10`} />
                      <img src={plan.image} alt={plan.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-700" />
                      
                      {/* Speed Display - UPDATED: No Padding, Just Black Text + Glow for Visibility */}
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-8">
                          {/* Black Text with Strong White Shadow so it's readable on dark color */}
                          <h2 className="text-5xl font-black text-black tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
                            {plan.speed}
                          </h2>
                      </div>

                      {plan.isPopular && (
                        <div className="absolute top-4 right-4 z-30 bg-yellow-400 text-blue-900 text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg uppercase">
                           Popular
                        </div>
                      )}
                  </div>

                  {/* Bottom Content Section */}
                  <div className="relative -mt-12 bg-white rounded-t-[24px] p-6 pt-0 z-30">
                      
                      {/* Badge Pill */}
                      <div className="flex justify-center -mt-4 mb-4">
                        <div className={`shadow-lg px-6 py-2 rounded-full text-white font-bold text-[10px] tracking-[0.2em] uppercase bg-gradient-to-r ${theme.gradient}`}>
                           {plan.name}
                        </div>
                      </div>

                      {/* Price - UPDATED to Black */}
                      <div className="text-center mb-6 border-b border-gray-100 pb-4">
                        <span className="text-2xl font-black text-black tracking-tight">{plan.price}</span>
                        <span className="text-gray-400 font-bold text-[10px] uppercase ml-1">/month</span>
                      </div>

                      {/* Features Grid - Clean & Small */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                           <div key={i} className={`flex items-center gap-2 p-1.5 rounded-md ${theme.light} bg-opacity-20`}>
                              <feature.icon size={14} className={`flex-shrink-0`} strokeWidth={2.5} />
                              <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide leading-none">{feature.text}</span>
                           </div>
                        ))}
                      </div>

                      {/* Action Button - UPDATED: Curved Edges & Default Theme Color */}
                      <button 
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-3 rounded-full font-black text-white uppercase tracking-widest text-[10px] shadow-md transition-all hover:shadow-xl active:scale-95 bg-gradient-to-r ${theme.gradient} flex items-center justify-center gap-2`}
                      >
                        Get Connected <ChevronRight size={14} />
                      </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ======== HOTSPOT SECTION (UPDATED with Unsplash Background) ======== */}
      <section id="hotspot-section" className="py-20 relative overflow-hidden">
        {/* Background Image - Unsplash Tech/Connection Vibe */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop" 
            alt="Hotspot Background" 
            className="w-full h-full object-cover"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-blue-950/90 mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-white/10 pb-6">
            <div>
               <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-1">Public Zones</p>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                 Wifi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Hotspot</span> Passes
               </h2>
            </div>
            <button onClick={handleHotspotSelect} className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-yellow-400 transition-all border border-white/20 px-4 py-2 rounded-full hover:bg-white/5">
               View All Zones <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
             {hotspotPlans.map((plan, index) => (
                <motion.div
                   key={index}
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ delay: index * 0.1 }}
                   whileHover={{ y: -5 }}
                   onClick={handleHotspotSelect}
                   className={`rounded-xl p-4 cursor-pointer relative overflow-hidden group bg-gradient-to-br ${plan.color}`}
                >
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Wifi size={50} className="text-white" />
                   </div>

                   <div className="relative z-10 text-white h-full flex flex-col justify-between min-h-[110px]">
                      <div>
                          <h3 className="font-bold text-xs uppercase tracking-wide leading-tight mb-2">{plan.name}</h3>
                          <span className="inline-block bg-black/20 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                             {plan.duration}
                          </span>
                      </div>
                      
                      <div className="mt-3">
                          <p className="text-[10px] opacity-75 uppercase tracking-widest mb-0">Only</p>
                          <p className="text-xl font-black tracking-tight">Ksh {plan.price}</p>
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
        initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        href="https://wa.me/254741874200" 
        target="_blank" 
        className="fixed bottom-6 right-6 z-40 bg-[#25d366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center ring-4 ring-white/20"
      >
        <WhatsAppIcon size={28} />
      </motion.a>
    </div>
  );
};

// --- MODALS (Updated to be cleaner/sharper) ---
const BookingModal = ({ show, onClose, plan, formData, onChange, onSubmit, isLoading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">New Order</span>
            <h3 className={`text-xl font-black text-blue-950 uppercase tracking-tight`}>Get Connected</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={18} className={'text-black'}/></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-wide`}>Full Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={onChange} 
              required 
              className={`w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`} 
              placeholder="Enter your full name" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-wide`}>Phone *</label>
               <input 
                 type="tel" 
                 name="phone" 
                 value={formData.phone} 
                 onChange={onChange} 
                 required 
                 className={`w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`} 
                 placeholder="07..." 
               />
             </div>
             <div className="space-y-1">
               <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-wide`}>Email</label>
               <input 
                 type="email" 
                 name="email" 
                 value={formData.email} 
                 onChange={onChange} 
                 className={`w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`} 
                 placeholder="Optional" 
               />
             </div>
          </div>
          <div className="space-y-1">
            <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-wide`}>Location *</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={onChange} 
              required 
              className={`w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`} 
              placeholder="Building, Road, Estate" 
            />
          </div>
          <div className="space-y-1">
            <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-wide`}>Selected Package</label>
            <div className="w-full px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 flex justify-between items-center">
               <span className="text-sm font-bold text-blue-900">{plan?.name || 'Not Selected'}</span>
               <span className="text-xs font-bold text-blue-600">{plan?.speed}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={onClose} 
              className="w-1/3 py-3 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition"
            >
              Cancel
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-2/3 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : "Confirm Order"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const SuccessPopup = ({ onClose }) => (
  <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="text-green-500 w-8 h-8" />
      </div>
      <h3 className="text-xl font-black text-blue-950 uppercase mb-2">Order Received!</h3>
      <p className="text-gray-500 text-sm mb-6">Redirecting you to WhatsApp to finalize your connection...</p>
      <button onClick={onClose} className="bg-blue-950 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-900 transition shadow-lg">
        Close
      </button>
    </motion.div>
  </div>
);

export default MainContent;