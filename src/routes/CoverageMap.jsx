import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronUp, Phone, Wifi, MapPin, 
  HelpCircle, User, Settings, Sun, Moon, Search, 
  Mail, MessageCircle
} from 'lucide-react';

const CoveragePage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Account & Billing");
  const [darkMode, setDarkMode] = useState(false);

  // Load user preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
  }, []);

  // Save preference when darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const coverageAreas = [
    ["Kasarani", "Githurai", "Ruiru", "Juja", "Thika Town"],
    ["Maragwa", "Embakasi West", "Kiambu", "Kiambaa"],
    ["Githunguri", "Kikuyu", "Dagoretti North", "Kabete", "Roysambu"]
  ];

  const faqCategories = {
    "Account & Billing": {
      icon: <User className="w-5 h-5" />,
      items: [
        {
          question: "PAYMENTS",
          answer: "Your billing cycle begins on the date you make your monthly subscription and lasts 30 days. Payments made to the wrong account should be forwarded to our customer support team for correction."
        },
        {
          question: "UPGRADES AND DOWNGRADES",
          answer: "Incase of an upgrade or downgrade, kindly contact our customer care team for assistance."
        }
      ]
    },
    "Services": {
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          question: "RELOCATION SERVICES",
          answer: "If you are moving houses within the Optimas fibre network, kindly give a notice of 1 week prior to your moving date. Relocation services are billed at Kshs.1000."
        },
        {
          question: "SLOW SPEEDS",
          answer: "You could be maxing out the bandwith on your selected services with many devices online leading to low speeds."
        }
      ]
    },
    "Installation": {
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          question: "INSTALLATION CHARGES",
          answer: "FREE INSTALLATION only applies to 20MBPS packages and above. 10MBPS package requires a one off installation fee of Ksh. 2,000/-"
        }
      ]
    }
  };

  return (
    <div className={`font-sans min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-700'}`}>
      
      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${darkMode ? 'bg-gray-900/90' : 'bg-white/95'} backdrop-blur-md shadow-sm border-b border-gray-100`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
               {/* Brand Logo Area */}
               <div className="flex flex-col leading-none">
                  <span className={`text-xl font-black ${darkMode ? 'text-blue-400' : 'text-primary'}`}>OPTIMAS</span>
                  <span className="text-sm font-bold text-secondary tracking-widest uppercase">Home Fiber</span>
               </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {['Home', 'About', 'Our Coverage', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className={`font-medium text-sm uppercase tracking-wide transition-colors ${
                    item === 'Our Coverage' 
                    ? 'text-accent' 
                    : (darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-primary')
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
            
            <div className="flex items-center space-x-3">
              <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <a href="tel:+254709517917" className="bg-accent hover:bg-[#b89b14] text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                0709 517 917
              </a>
            </div>
          </div>
        </div>
      </header>
       */}

      {/* Hero Section with "Cloud" Divider */}
      <section className="relative pt-20 h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
           {/* Use a city image here */}
           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}></div>
           <div className={`absolute inset-0 ${darkMode ? 'bg-gray-900/80' : 'bg-primary/90'}`}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 -mt-12">
          {/* Optional Floating Icon similar to screenshot */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-auto w-20 h-20 mb-6 text-accent opacity-80"
          >
            <Wifi className="w-full h-full" />
          </motion.div>

          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-lg font-sans "
          >
            Areas We Get You Connected
          </motion.h1>
          <p className="text-gray-200 text-lg">Fast, Reliable, Everywhere.</p>
        </div>

        {/* The "Cloud/Wave" SVG Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg 
            className={`relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px] ${darkMode ? 'fill-gray-900' : 'fill-white'}`} 
            data-name="Layer 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className={darkMode ? 'fill-gray-800' : 'fill-gray-100'}></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Coverage Lists Section */}
      <section className={`py-12 md:py-20 px-4 relative z-20 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-[#182B5C]'}`}>
              Optimas Fiber Coverage Areas
            </h2>
            <div className="w-24 h-1 bg-[#d0b216] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {coverageAreas.map((column, colIndex) => (
              <div key={colIndex} className="space-y-1">
                {column.map((area, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center py-3 border-b transition-colors hover:pl-2 duration-200 ${
                      darkMode 
                        ? 'border-gray-800 text-gray-300 hover:text-yellow-400' 
                        : 'border-gray-200 text-gray-600 hover:text-[#182B5C]'
                    }`}
                  >
                    <Wifi className={`w-4 h-4 mr-3 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-[#182B5C]'}`} />
                    <span className="font-medium text-sm md:text-base">{area}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wide Map Section */}
      <section className="w-full">
        <div className={`w-full h-[400px] md:h-[500px] relative ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          {/* Blue Header Strip on Map (like screenshot) */}
          <div className={`absolute top-0 left-0 right-0 h-16 z-10 ${darkMode ? 'bg-blue-900/90' : 'bg-[#182B5C]'} flex items-center justify-center`}>
             <span className="text-white font-bold tracking-wider uppercase text-sm">Interactive Coverage Map</span>
          </div>
          
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63821.14200482106!2d36.78668749999999!3d-1.2482205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f175b5a63350d%3A0x8175674316496788!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1715000000000"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title="Coverage Map"
            className={`w-full h-full ${darkMode ? 'opacity-70 contrast-125' : ''}`}
          ></iframe>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 max-w-4xl">
           <h2 className={`text-3xl font-bold text-center mb-10 ${darkMode ? 'text-white' : 'text-[#182B5C]'}`}>Support & Billing</h2>
           
           {/* Simple Tabs */}
           <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {Object.keys(faqCategories).map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                       activeCategory === cat 
                       ? 'bg-[#d0b216] text-white shadow-md' 
                       : (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500 border border-gray-200')
                    }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>

           {/* Accordion */}
           <div className="space-y-4">
              <AnimatePresence mode="wait">
                {faqCategories[activeCategory].items.map((item, idx) => (
                   <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}
                   >
                      <button 
                         onClick={() => toggleFaq(idx)}
                         className="w-full flex items-center justify-between p-5 text-left"
                      >
                         <span className={`font-bold ${darkMode ? 'text-gray-200' : 'text-[#182B5C]'}`}>{item.question}</span>
                         {activeFaq === idx ? <ChevronUp className="text-[#d0b216] w-5 h-5" /> : <ChevronDown className="text-gray-400 w-5 h-5" />}
                      </button>
                      {activeFaq === idx && (
                         <div className={`px-5 pb-5 text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.answer}
                         </div>
                      )}
                   </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/254709517917" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
           Chat with us
        </span>
      </a>

      {/* Simple Footer */}
      <footer className={`py-8 text-center ${darkMode ? 'bg-gray-950 text-gray-600' : 'bg-[#182B5C] text-blue-200'}`}>
         <p className="text-sm">© {new Date().getFullYear()} Optimas Fibre. All Rights Reserved.</p>
      </footer>

    </div>
  );
};

export default CoveragePage;