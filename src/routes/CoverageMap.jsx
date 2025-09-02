import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Phone, Wifi, MapPin, HelpCircle, User, CreditCard, Settings, Mail } from 'lucide-react';

const CoveragePage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const coverageAreas = [
    ["Kasarani", "Githurai", "Ruiru", "Juja", "Thika Town"],
    ["Maragwa", "Embakasi West", "Kiambu", "Kiambaa"],
    ["Githunguri", "Kikuyu", "Dagoretti North", "Kabete", "Roysambu"]
  ];

  // Enhanced FAQ data with categories and icons
  const faqCategories = {
    "Account & Billing": {
      icon: <User className="w-5 h-5 text-[#d0b216]" />,
      items: [
        {
          question: "PAYMENTS",
          answer: "Your billing cycle begins on the date you make your monthly subscription and lasts 30 days. Payments made to the wrong account should be forwarded to our customer support team for correction. When payment does not reflect your account-Forward the message to our customer support team for update."
        },
        {
          question: "UPGRADES AND DOWNGRADES",
          answer: "Incase of an upgrade or downgrade, kindly contact our customer care team for assistance."
        }
      ]
    },
    "Services": {
      icon: <Settings className="w-5 h-5 text-[#d0b216]" />,
      items: [
        {
          question: "RELOCATION SERVICES",
          answer: "If you are moving houses or you would like your router to be moved to different location, Contact customer support for assistance. If moving houses of location within the Optimas fibre network, kindly give a notice of 1 week prior to your moving date so you can be scheduled for a smooth transition to your new location. Relocation services are billed at Kshs.1000 payable via our paybill."
        },
        {
          question: "ROUTER SERVICE FUNCTIONS",
          answer: "Loss of signal. If your router is blinking red means you're experiencing a loss of signal. Kindly contact our customer support team for further assistance. Unable to connect to the internet? It may be due to a payment issue. If you've paid and are still not connected, please contact our customer support team."
        },
        {
          question: "SLOW SPEEDS",
          answer: "You could be maxing out the bandwith on your selected services with many devices online leading to low speeds. If there are many users using the same connection you can opt to upgrade to a higher package to solve the issue. For poor signal check kindly contact our customer care agents to perform a check for you and offer a solution."
        }
      ]
    },
    "Installation": {
      icon: <HelpCircle className="w-5 h-5 text-[#d0b216]" />,
      items: [
        {
          question: "NEED AN INSTALLATION, WHAT ARE THE CHARGES",
          answer: "If you need an installation, you can contact our customer care lines provided at any time and book an installation. Our customer care agents will take you through the process. Kindly note that FREE INSTALLATION only applies to 20MBPS packages and above. For users looking at 10MBPS package will be required to pay a one off installation fee of Ksh. 2,000/-"
        }
      ]
    }
  };

  const [activeCategory, setActiveCategory] = useState("Account & Billing");

  return (
    <div className="font-sans text-gray-800 bg-white min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 flex items-center">
                <span className="text-2xl font-bold text-[#182B5C]">OPTIMAS</span>
                <span className="text-2xl font-bold text-[#d0b216]">FIBRE</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-[#182B5C] hover:text-[#d0b216] font-medium transition-colors">Home</a>
              <a href="/about" className="text-[#182B5C] hover:text-[#d0b216] font-medium transition-colors">About</a>
              <a href="/coverage" className="text-[#d0b216] font-medium">Our Coverage</a>
              <a href="/contact" className="text-[#182B5C] hover:text-[#d0b216] font-medium transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <a href="tel:+254709517917" className="bg-[#d0b216] hover:bg-[#b89b14] text-white px-5 py-2.5 rounded-md font-medium transition-colors flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                0709517917
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Restored to Original */}
      <section className="relative overflow-hidden pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1920)',
            height: '500px',
            filter: 'brightness(0.7)'
          }}
        ></div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-[500px]">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Areas We Get You Connected
            </h1>
            <div className="relative inline-block">
              <svg className="w-48 h-48 md:w-64 md:h-64 text-blue-500 absolute -top-16 left-1/2 transform -translate-x-1/2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 9.5 7 9.5s7-4.25 7-9.5c0-3.87-3.13-7-7-7zm0 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold">📶</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Areas Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#182B5C]">Optimas Fibre Coverage Areas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coverageAreas.map((column, colIndex) => (
              <div key={colIndex} className="space-y-3">
                {column.map((area, index) => (
                  <div key={index} className="flex items-center text-gray-700 hover:text-[#182B5C] transition-colors p-3 rounded-lg hover:bg-gray-50">
                    <Wifi className="w-4 h-4 text-[#d0b216] mr-2" />
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center text-[#182B5C]">Our Coverage Map</h3>
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-[#d0b216]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63821.14200482106!2d36.78668749999999!3d-1.2482205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f175b5a63350d%3A0x8175674316496788!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1715000000000"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title="Optimas Fibre Coverage Map"
                className="absolute inset-0"
                loading="lazy"
              ></iframe>
            </div>
            <div className="mt-6 flex justify-center">
              <a
                href="https://www.google.com/maps/place/Nairobi,+Kenya/@-1.3032094,36.5672001,10z/data=!3m1!4b1!4m6!3m5!1s0x182f175b5a63350d:0x8175674316496788!8m2!3d-1.2920659!4d36.8219462!16zL20vMDVmNDk?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#182B5C] hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium flex items-center transition-colors"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Open Full Screen Map
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Redesigned */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#d0b216] font-semibold uppercase tracking-wider">FAQ</p>
            <h2 className="text-3xl font-bold mt-2 text-[#182B5C]">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-[#d0b216] mx-auto mt-4"></div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(faqCategories).map(([key, { icon }]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                  activeCategory === key
                    ? "bg-[#182B5C] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {icon}
                <span className="text-sm font-medium">{key}</span>
              </button>
            ))}
          </div>
          
          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {faqCategories[activeCategory].items.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all"
                >
                  <button
                    className="flex justify-between items-center w-full p-6 text-left font-medium text-lg text-[#182B5C] hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    {activeFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-[#d0b216]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#d0b216]" />
                    )}
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                          opacity: 1, 
                          height: "auto",
                          transition: {
                            height: { duration: 0.3 },
                            opacity: { duration: 0.4, delay: 0.1 }
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0,
                          transition: {
                            height: { duration: 0.3 },
                            opacity: { duration: 0.2 }
                          }
                        }}
                        className="px-6 pb-6 border-t border-gray-200"
                      >
                        <p className="text-gray-700 mt-4">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Need More Help Container - Added to FAQ Section */}
          <motion.div 
            className="mt-12 p-8 bg-[#182B5C] rounded-xl text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
            <p className="mb-6 opacity-90">Our support team is available 24/7 to assist you</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+254726896562" 
                className="bg-[#d0b216] hover:bg-[#c0a220] text-[#182B5C] px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Support: 0726 896 562
              </a>
              <a 
                href="mailto:support@knoxvilletechnologies.com" 
                className="border border-[#d0b216] text-[#d0b216] hover:bg-[#d0b216] hover:text-[#182B5C] px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#182B5C] to-[#0f1e42] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Blazing-Fast Internet with Optimas Fibre!</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Reliable, high-speed internet for your home or business. Connect with us today!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <a 
              href="tel:+254709517917" 
              className="bg-[#d0b216] hover:bg-yellow-500 text-white px-8 py-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Us Now
            </a>
            <a 
              href="#coverage-map" 
              className="border-2 border-white text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-white hover:text-[#182B5C] transition-colors flex items-center justify-center"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Check Coverage
            </a>
          </div>
          
          <p className="text-lg">
            📲 Call us: <a href="tel:+254709517917" className="underline font-semibold">0709517917</a> | 
            <a href="tel:+254709517918" className="underline font-semibold ml-2">0709517918</a>
          </p>
        </div>
      </section>

      {/* Footer has been removed as requested */}
    </div>
  );
};

export default CoveragePage;