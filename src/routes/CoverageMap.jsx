import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, Wifi, MapPin } from 'lucide-react';

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

  const faqItems = [
    {
      question: "PAYMENTS",
      answer: "Your billing cycle begins on the date you make your monthly subscription and lasts 30 days. Payments made to the wrong account should be forwarded to our customer support team for correction. When payment does not reflect your account-Forward the message to our customer support team for update."
    },
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
    },
    {
      question: "UPGRADES AND DOWNGRADES",
      answer: "Incase of an upgrade or downgrade, kindly contact our customer care team for assistance."
    },
    {
      question: "NEED AN INSTALLATION, WHAT ARE THE CHARGES",
      answer: "If you need an installation, you can contact our customer care lines provided at any time and book an installation. Our customer care agents will take you through the process. Kindly note that FREE INSTALLATION only applies to 20MBPS packages and above. For users looking at 10MBPS package will be required to pay a one off installation fee of Ksh. 2,000/-"
    }
  ];

  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 flex items-center">
                <span className="text-2xl font-bold text-blue-600">OPTIMAS</span>
                <span className="text-2xl font-bold text-gray-800">FIBRE</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
              <a href="/coverage" className="text-blue-600 font-medium">Our Coverage</a>
              <a href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <a href="tel:+254709517917" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                0709517917
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Matching Vuma Design */}
      <section className="relative bg-gradient-to-br from-blue-50 to-gray-100 py-16 overflow-hidden">
        {/* Wave Design */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 283.5 27.8" preserveAspectRatio="xMidYMax slice" className="w-full h-12">
            <path fill="white" d="M0 0v6.7c1.9-.8 4.7-1.4 8.5-1 9.5 1.1 11.1 6 11.1 6s2.1-.7 4.3-.2c2.1.5 2.8 2.6 2.8 2.6s.2-.5 1.4-.7c1.2-.2 1.7.2 1.7.2s0-2.1 1.9-2.8c1.9-.7 3.6.7 3.6.7s.7-2.9 3.1-4.1 4.7 0 4.7 0s1.2-.5 2.4 0 1.7 1.4 1.7 1.4h1.4c.7 0 1.2.7 1.2.7s.8-1.8 4-2.2c3.5-.4 5.3 2.4 6.2 4.4.4-.4 1-.7 1.8-.9 2.8-.7 4 .7 4 .7s1.7-5 11.1-6c9.5-1.1 12.3 3.9 12.3 3.9s1.2-4.8 5.7-5.7c4.5-.9 6.8 1.8 6.8 1.8s.6-.6 1.5-.9c.9-.2 1.9-.2 1.9-.2s5.2-6.4 12.6-3.3c7.3 3.1 4.7 9 4.7 9s1.9-.9 4 0 2.8 2.4 2.8 2.4 1.9-1.2 4.5-1.2 4.3 1.2 4.3 1.2.2-1 1.4-1.7 2.1-.7 2.1-.7-.5-3.1 2.1-5.5 5.7-1.4 5.7-1.4 1.5-2.3 4.2-1.1c2.7 1.2 1.7 5.2 1.7 5.2s.3-.1 1.3.5c.5.4 .8.8 .9 1.1.5-1.4 2.4-5.8 8.4-4 7.1 2.1 3.5 8.9 3.5 8.9s.8-.4 2 0 1.1 1.1 1.1 1.1 1.1-1.1 2.3-1.1 2.1.5 2.1.5 1.9-3.6 6.2-1.2 1.9 6.4 1.9 6.4 2.6-2.4 7.4 0c3.4 1.7 3.9 4.9 3.9 4.9s3.3-6.9 10.4-7.9 11.5 2.6 11.5 2.6.8 0 1.2.2c.4.2 .9.9 .9.9s4.4-3.1 8.3.2c1.9 1.7 1.5 5 1.5 5s.3-1.1 1.6-1.4c1.3-.3 2.3.2 2.3.2s-.1-1.2 .5-1.9 1.9-.9 1.9-.9-4.7-9.3 4.4-13.4c5.6-2.5 9.2.9 9.2.9s5-6.2 15.9-6.2 16.1 8.1 16.1 8.1.7-.2 1.6-.4V0H0z"/>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Areas We Get You Connected</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover the extensive coverage of Optimas Fibre's high-speed internet service across multiple regions
          </p>
        </div>
      </section>

      {/* Coverage Areas Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Optimas Fibre Coverage Areas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {coverageAreas.map((column, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {column.map((area, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Wifi className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="text-lg font-medium">{area}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section - Updated to match the cloned layout */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Our Coverage Map</h3>
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/d/embed?mid=15BWNoqWThNq2nrDhQS5Tyvrfj6IXK5Y&ehbc=2E312F" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen
                title="Optimas Fibre Coverage Map"
                className="absolute inset-0"
              ></iframe>
            </div>
            <div className="mt-6 flex justify-center">
              <a 
                href="https://www.google.com/maps/d/embed?mid=15BWNoqWThNq2nrDhQS5Tyvrfj6IXK5Y&ehbc=2E312F" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium flex items-center"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Open Full Screen Map
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold">FAQ</p>
            <h2 className="text-3xl font-bold mt-2">Find Out Answers Here</h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {faqItems.map((faq, index) => (
              <div key={index} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="flex justify-between items-center w-full p-6 bg-gray-50 text-left font-medium text-lg"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="p-6 bg-white border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 animate-gradient-x">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">🚀 Get Blazing-Fast Internet with Optimas Fibre!</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Reliable, high-speed internet for your home or business. Connect with us today!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <a 
              href="tel:+254709517917" 
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Us Now
            </a>
            <a 
              href="/coverage" 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="h-8 flex items-center mb-4">
                <span className="text-2xl font-bold text-white">OPTIMAS</span>
                <span className="text-2xl font-bold text-blue-400">FIBRE</span>
              </div>
              <p className="text-gray-400">© 2025 Optimas Fibre LTD. All rights reserved.</p>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
              <a href="/about" className="hover:text-blue-400 transition-colors">About</a>
              <a href="/coverage" className="text-blue-400">Our Coverage</a>
              <a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a>
            </nav>
            
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/16AoQJ9akf/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
                </svg>
              </a>
              <a href="https://x.com/VumaFiber" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-black transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/vumafiberke" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default CoveragePage;