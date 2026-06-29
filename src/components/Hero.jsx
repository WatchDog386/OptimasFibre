import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, X, Wifi, Star, Phone, Zap, Smartphone, 
  Shield, ArrowRight, Users, ChevronRight,
  Server, Activity, Send, MonitorPlay, Gamepad2, Briefcase, Download,
  Gauge, Search, MapPin, ChevronDown,
  BarChart2, Rocket, Globe, Cloud, Cpu, HardHat, Headset
} from 'lucide-react';

// --- CUSTOM ICONS ---
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 14.5C17.1 14.1 15.3 13.2 14.9 13.1C14.5 13 14.3 13.2 14.1 13.5C13.9 13.9 13.2 14.7 13 14.9C12.8 15.1 12.5 15.2 12.2 15C11.8 14.8 10.6 14.4 9.3 13.2C8.2 12.2 7.5 11 7.2 10.6C7 10.2 7.2 10 7.4 9.8C7.5 9.7 7.7 9.4 7.9 9.2C8.1 8.9 8.2 8.8 8.3 8.5C8.4 8.2 8.3 8.1 8.2 7.9C8.1 7.7 7.4 5.9 7.1 5.2C6.8 4.5 6.5 4.6 6.3 4.6C6.1 4.6 5.9 4.6 5.6 4.6C5 4.7 4.7 5.1 4.3 5.4C4 5.8 3.4 6.3 3.4 8.1C3.4 9.9 4.7 11.5 4.9 11.8C5 12 7.4 15.7 11.1 17.3C11.9 17.6 12.6 17.9 13.1 18C14.1 18.3 14.9 18.3 15.6 18.2C16.4 18.1 18 17.2 18.3 16.3C18.7 15.4 18.7 14.6 18.6 14.4C18.5 14.3 18.3 14.2 17.9 14L17.5 14.5Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24ZM12 21.8C10.2 21.8 8.5 21.3 7.1 20.5L6.8 20.3L3.9 21.1L4.7 18.3L4.5 17.9C3.6 16.5 3.1 14.9 3.1 13.2C3.1 8.3 7.1 4.3 12 4.3C14.4 4.3 16.6 5.2 18.3 6.9C19.9 8.6 20.9 10.8 20.9 13.2C20.9 18.1 16.9 21.8 12 21.8Z" fillOpacity="0.2" />
  </svg>
);

// --- HERO SECTION ---
const heroImages = ["/hero.png", "/hero1.png", "/availble.png", "/hero2.png"];

const containerVariantsHero = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemLeft = {
  hidden: { opacity: 0, x: -200 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 60, damping: 20 },
  },
};

const itemRight = {
  hidden: { opacity: 0, x: 200 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 60, damping: 20 },
  },
};

const HeroSection = () => {
  const [heroImgIndex, setHeroImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImgIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#2C3E6B] w-full min-h-[460px] md:min-h-[650px] flex items-center relative overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <motion.div
        className="max-w-6xl mx-auto px-2.5 md:px-8 w-full py-10 lg:grid lg:grid-cols-2 gap-12 items-center relative z-10"
        variants={containerVariantsHero}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="max-w-xl relative z-20" variants={itemLeft}>
          <motion.h1 className="text-[1.5rem] md:text-[2rem] lg:text-[2.5rem] font-extrabold text-white leading-[1.15] mb-5 tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }} variants={itemLeft}>
            Fast, Reliable & Affordable<br />
            <span className="text-white">Fiber Network</span>
          </motion.h1>
          <motion.div className="grid grid-cols-2 gap-x-3 gap-y-1 md:block md:space-y-2 mb-6 md:mb-10" variants={itemLeft}>
            <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
              <CheckCircle size={16} className="text-[#FF6B35] flex-shrink-0" /> Unlimited Internet
            </div>
            <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
              <CheckCircle size={16} className="text-[#FF6B35] flex-shrink-0" /> Free Installation
            </div>
            <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
              <CheckCircle size={16} className="text-[#FF6B35] flex-shrink-0" /> No Contracts
            </div>
            <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
              <CheckCircle size={16} className="text-[#FF6B35] flex-shrink-0" /> Speeds from 8 Mbps
            </div>
          </motion.div>

          <motion.div className="flex flex-wrap gap-4 mb-6" variants={itemLeft}>
            <button className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-6 md:px-8 py-3 rounded-full text-sm font-bold transition-colors shadow-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
              View Packages
            </button>
            <button className="bg-white hover:bg-gray-100 text-[#2C3E6B] px-6 md:px-8 py-3 rounded-full text-sm font-bold transition-colors shadow-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Check Coverage
            </button>
          </motion.div>

          <motion.div className="hidden md:block" variants={itemLeft}>
            <p className="text-gray-300 text-[0.8125rem] mb-4 font-semibold tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Trusted across Kenya</p>
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[1.25rem] md:text-[1.625rem] font-extrabold text-white leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>10K+</span>
                <span className="text-[0.6rem] md:text-[0.6875rem] text-gray-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Customers</span>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="flex flex-col">
                <span className="text-[1.25rem] md:text-[1.625rem] font-extrabold text-[#FF6B35] leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>99.9%</span>
                <span className="text-[0.6875rem] text-gray-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Uptime</span>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="flex flex-col">
                <span className="text-[1.25rem] md:text-[1.625rem] font-extrabold text-white leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>24/7</span>
                <span className="text-[0.6875rem] text-gray-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Support</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="relative mt-8 md:mt-16 lg:mt-0 h-[200px] md:h-[450px]" variants={itemRight}>
          <div className="relative z-10 flex items-center justify-center h-full">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={heroImgIndex}
                src={heroImages[heroImgIndex]}
                alt="Fast Fiber Internet"
                className="w-full max-w-[600px] max-h-full object-contain"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
              />
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mobile stats - below image */}
        <motion.div className="md:hidden mt-6" variants={itemLeft}>
          <p className="text-gray-300 text-[0.8125rem] mb-4 font-semibold tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Trusted across Kenya</p>
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[1.25rem] font-extrabold text-white leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>10K+</span>
              <span className="text-[0.6rem] text-gray-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Customers</span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="flex flex-col">
              <span className="text-[1.25rem] font-extrabold text-[#FF6B35] leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>99.9%</span>
              <span className="text-[0.6875rem] text-gray-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Uptime</span>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="flex flex-col">
              <span className="text-[1.25rem] font-extrabold text-white leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>24/7</span>
              <span className="text-[0.6875rem] text-gray-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Support</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom downward curve */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none md:hidden" style={{ height: '40px' }}>
        <svg viewBox="0 0 1440 40" className="w-full h-full" preserveAspectRatio="none">
          <path fill="white" d="M0,0 C360,40 1080,40 1440,0 L1440,40 L0,40 Z" />
        </svg>
      </div>
    </div>
  );
};

// ================================
// 🔥 DATA & CONFIG
// ================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
};

const PACKAGE_THEMES = [
  { name: 'pink', gradient: 'from-[#E6007E] to-[#FF3399]', light: 'bg-[#FCE5F0] text-[#E6007E]' },
  { name: 'purple', gradient: 'from-[#8E24AA] to-[#AB47BC]', light: 'bg-purple-100 text-purple-700' },
  { name: 'blue', gradient: 'from-[#0288D1] to-[#29B6F6]', light: 'bg-blue-100 text-blue-700' },
  { name: 'green', gradient: 'from-[#43A047] to-[#66BB6A]', light: 'bg-green-100 text-green-700' },
  { name: 'orange', gradient: 'from-[#FB8C00] to-[#FFA726]', light: 'bg-orange-100 text-orange-700' },
  { name: 'teal', gradient: 'from-[#00897B] to-[#26A69A]', light: 'bg-teal-100 text-teal-700' },
];

const PLAN_IMAGES = {
  "Jumbo": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1200&q=80",
  "Buffalo": "https://www.travelbutlers.com/images/450px/dreamstimemaximum_20395360_KRUGER.jpg",
  "Ndovu": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1200&q=80",
  "Gazzelle": "https://www.tanzania-experience.com/wp-content/uploads/2015/09/gazelles-antilope-featured.jpg",
};

const plans = [
  { name: "Jumbo", price: "Ksh 1,500", speed: "20 Mbps", image: PLAN_IMAGES["Jumbo"], features: [{ text: "Unlimited Internet", icon: Wifi }, { text: "Free Install", icon: CheckCircle }, { text: "24/7 Support", icon: Phone }, { text: "Reliable Connection", icon: Shield }], isPopular: false },
  { name: "Buffalo", price: "Ksh 2,000", speed: "30 Mbps", image: PLAN_IMAGES["Buffalo"], features: [{ text: "Unlimited Internet", icon: Wifi }, { text: "Free Install", icon: CheckCircle }, { text: "24/7 Support", icon: Phone }, { text: "High Speed", icon: Zap }], isPopular: false },
  { name: "Ndovu", price: "Ksh 3,500", speed: "80 Mbps", image: PLAN_IMAGES["Ndovu"], features: [{ text: "Unlimited Internet", icon: Wifi }, { text: "Free Install", icon: CheckCircle }, { text: "Connect More Devices", icon: Users }, { text: "Perfect for Everyone", icon: Star }], isPopular: true },
  { name: "Gazzelle", price: "Ksh 5,000", speed: "100 Mbps", image: PLAN_IMAGES["Gazzelle"], features: [{ text: "Unlimited Internet", icon: Wifi }, { text: "Free Install", icon: CheckCircle }, { text: "High Speed", icon: Gauge }, { text: "24/7 Support", icon: Phone }], isPopular: false },
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
  const [showAllWhoWeAre, setShowAllWhoWeAre] = useState(false);
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
      
      <HeroSection />

      {/* WHO WE ARE */}
      <section className="bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-2.5">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-14 items-end">
            
            {/* Left: Image & Badge — Desktop only */}
            <div className="hidden lg:block relative flex items-end pl-6 md:pl-10">
              <img 
                src="/browse.png" 
                alt="Optimas Team" 
                className="w-full object-contain h-[380px] lg:h-[500px]"
              />

              <div className="absolute top-10 -left-6 md:-left-10 bg-white w-32 h-32 lg:w-40 lg:h-40 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center border-[6px] border-white z-20">
                <span className="md:text-4xl lg:text-5xl font-black text-[#FF6B35]">10+</span>
                <span className="md:text-[0.6rem] lg:text-xs font-bold text-[#2C3E6B] uppercase tracking-widest mt-1 text-center">Years of<br/>Experience</span>
              </div>
            </div>

            {/* Right: Text Content + Mobile Background Image */}
            <div className="md:mt-0 md:mx-0 bg-white md:bg-transparent rounded-2xl md:rounded-none shadow-md md:shadow-none border border-gray-100 md:border-0 md:px-0 pb-6 md:pb-12 overflow-hidden mt-8 relative">
              {/* Mobile background image */}
              <div className="md:hidden absolute bottom-0 left-0 right-0 h-64">
                <img src="/browse.png" alt="" className="w-full h-full object-contain opacity-70" />
              </div>
              <div className="px-4 md:px-0 pt-4 md:pt-20 relative z-10">
              <p className="text-[#FF6B35] font-black text-xs uppercase tracking-[0.2em] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Who We Are</p>
              
              <h2 className="text-[1.5rem] md:text-[2rem] lg:text-[2.5rem] font-extrabold text-[#2C3E6B] leading-[1.15] mb-5 tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Real people delivering real results.
              </h2>
              
              <p className="text-gray-800 mb-10 text-sm md:text-base lg:text-lg leading-relaxed font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                We are dedicated to providing the most reliable and high-speed fiber internet across Kenya. Our infrastructure ensures that your connectivity never drops when you need it the most.
              </p>

              <div className="space-y-8">
                <div className={`${showAllWhoWeAre ? 'block' : 'hidden'} md:block`}>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B35] shadow-sm">
                      <BarChart2 className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg lg:text-xl font-extrabold text-[#2C3E6B] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>Enterprise Network</h4>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Tailored fiber optic connections designed to keep your business operations running smoothly without interruptions.</p>
                    </div>
                  </div>

                  <div className="flex gap-5 mt-8">
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B35] shadow-sm">
                      <Rocket className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-extrabold text-[#2C3E6B] mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>High-Speed Home Fiber</h4>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Experience seamless 4K streaming, low-latency gaming, and rapid downloads with our premium residential packages.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAllWhoWeAre(!showAllWhoWeAre)}
                  className="md:hidden flex items-center gap-2 text-[#FF6B35] font-bold text-sm"
                >
                  {showAllWhoWeAre ? 'Show Less' : 'View All'} <ChevronRight className={`w-4 h-4 transition-transform ${showAllWhoWeAre ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>
            </div>

          </div>
        </div>
      </section>

      {/* WI-FI PACKAGES */}
      <section id="wifi-packages" className="py-16 md:py-24 relative bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-2.5 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-[#2562AE] text-[11px] font-bold lowercase tracking-[0.08em] mb-1">our packages</p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-2 text-[#2562AE] tracking-tight lowercase">
              unlimited internet
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-bold">Free installation. 24/7 support. Reliable connection.</p>
          </div>

          {/* Desktop grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
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
                  <div className="h-24 md:h-32 lg:h-40 relative overflow-hidden">
                      <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/25 z-10" />
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-1">
                          <h2 className="text-xl md:text-2xl lg:text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                            {plan.speed}
                          </h2>
                      </div>
                      {plan.isPopular && (
                        <div className="absolute top-4 right-4 z-30 bg-[#1A1A24] text-[#E6007E] text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-md">
                           POPULAR
                        </div>
                      )}
                  </div>

                  <div className="relative -mt-4 bg-white rounded-t-[18px] p-2.5 md:p-3.5 lg:p-4 pt-0 z-30">
                      <div className="flex justify-center -mt-2.5 mb-2.5">
                        <div className={`px-4 py-1.5 rounded-full text-white font-black text-[10px] tracking-widest uppercase bg-gradient-to-r ${theme.gradient} shadow-md`}>
                           {plan.name}
                        </div>
                      </div>

                      <div className="text-center mb-3 border-b border-gray-100 pb-2.5">
                        <span className="text-base md:text-lg lg:text-xl font-black text-[#1A1A24]">{plan.price}</span>
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
                        className={`py-2 md:py-2.5 px-6 rounded-full font-black text-white uppercase text-[10px] tracking-widest shadow-md hover:shadow-lg hover:opacity-90 transition-all bg-gradient-to-r ${theme.gradient} flex items-center justify-center gap-2 mx-auto`}
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
      <section id="hotspot-section" className="py-16 md:py-24 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-2.5">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-[#E6007E] text-[11px] font-bold lowercase tracking-[0.08em] mb-1">public zones</p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[#1A1A24] tracking-tight lowercase">
              wifi <span className="text-[#E6007E]">hotspots</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-bold">Fast internet on the go.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
             {hotspotPlans.map((plan, index) => (
                <motion.div
                   key={index}
                   whileHover={{ y: -5 }}
                   onClick={handleHotspotSelect}
                   className={`rounded-2xl p-4 md:p-5 cursor-pointer relative overflow-hidden bg-gradient-to-br ${plan.color} shadow-md`}
                >
                   <Wifi className="absolute top-0 right-0 w-8 h-8 md:w-10 md:h-10 lg:w-16 lg:h-16 text-white opacity-20 m-2" />
                   <div className="relative z-10 text-white h-20 md:h-24 lg:h-32 flex flex-col justify-between">
                       <div>
                           <h3 className="font-bold text-[10px] md:text-xs lg:text-sm lowercase tracking-[0.08em] mb-1.5">{plan.name}</h3>
                           <span className="inline-block bg-white/30 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md lowercase">
                              {plan.duration}
                           </span>
                       </div>
                       <div>
                           <p className="text-[10px] opacity-80 lowercase font-bold mb-0.5">only</p>
                           <p className="text-lg md:text-xl lg:text-2xl font-bold leading-none">Ksh {plan.price}</p>
                       </div>
                   </div>
                </motion.div>
             ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={handleHotspotSelect} className="text-[11px] font-bold lowercase bg-[#FCE5F0] text-[#E6007E] px-6 py-3 rounded-full hover:bg-[#E6007E] hover:text-white transition-colors tracking-[0.08em]">
               view all hotspots <ArrowRight className="w-3 h-3 inline ml-1" />
            </button>
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
        className="fixed bottom-6 right-6 z-40 bg-[#25d366] text-white p-3 md:p-4 lg:p-5 rounded-full shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <WhatsAppIcon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
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
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center max-w-xs w-full">
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