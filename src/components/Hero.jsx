import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const Hero = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    } else if (isRightSwipe && swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const heroSlides = [
    {
      image: "/net.jpg",
      title: "High-Speed Fibre Solutions",
      description: "Experience lightning-fast internet connectivity with our premium fibre optic network, designed for reliability and performance.",
      buttonText: "GET CONNECTED",
      buttonAction: () => navigate('/coverage'),
      overlayGradient: "linear-gradient(135deg, rgba(24, 43, 92, 0.85) 0%, rgba(24, 43, 92, 0.7) 100%)"
    },
    {
      image: "/optic.jpeg",
      title: "Affordable Pricing Plans",
      description: "Get top-quality fibre internet services at competitive rates with flexible packages for homes and businesses.",
      buttonText: "VIEW PLANS",
      buttonAction: () => navigate('/wifi-plans'),
      overlayGradient: "linear-gradient(135deg, rgba(24, 43, 92, 0.85) 0%, rgba(24, 43, 92, 0.7) 100%)"
    },
    {
      image: "/customer.jpg",
      title: "24/7 Customer Support",
      description: "Our dedicated team provides round-the-clock support to ensure seamless connectivity and quick issue resolution.",
      buttonText: "CONTACT US",
      buttonAction: () => navigate('/contact'),
      overlayGradient: "linear-gradient(135deg, rgba(24, 43, 92, 0.85) 0%, rgba(24, 43, 92, 0.7) 100%)"
    }
  ];

  const textVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.4
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 25px rgba(208, 178, 22, 0.4)",
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <section 
      className="hero p-0 relative w-full overflow-hidden"
      style={{ 
        fontFamily: "'Poppins', sans-serif",
        height: isMobile ? '60vh' : '90vh' // 👈 MUCH SMALLER ON MOBILE
      }}
    >
      {/* Floating WhatsApp Button — slightly inset on mobile */}
      <motion.a
        href="https://wa.me/254741874200"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        whileHover={{ scale: 1.1, boxShadow: "0 6px 20px rgba(37, 211, 102, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          width: isMobile ? '40px' : '56px',
          height: isMobile ? '40px' : '56px',
          bottom: isMobile ? '16px' : '32px',
          right: isMobile ? '16px' : '32px',
          backgroundColor: '#25d366',
          color: '#FFF',
          borderRadius: '50%',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
        }}
      >
        <FaWhatsapp style={{ fontSize: isMobile ? '20px' : '28px', color: 'white' }} />
      </motion.a>

      {/* Chat with us text (hidden on mobile) */}
      {!isMobile && (
        <motion.div
          className="chat-text"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          style={{
            position: 'fixed',
            bottom: '48px',
            right: '100px',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
          }}
        >
          Chat with us
        </motion.div>
      )}

      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ 
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        effect="fade"
        speed={1200}
        loop={true}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
          renderBullet: (index, className) => {
            return `<span class="${className} custom-bullet">
              <span class="bullet-progress"></span>
            </span>`;
          }
        }}
        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
        className="slider-container full-slider w-full h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={index} className="slide-center slider-item w-full h-full relative">
            {/* Background Image */}
            <motion.div 
              className="slider-image full-image w-full h-full absolute top-0 left-0"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            />
            
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                background: slide.overlayGradient
              }}
            />
            
            {/* Decorative Elements — Now much smaller on mobile */}
            <div 
              className={`absolute top-0 right-0 rounded-full bg-[#d0b216] opacity-10`}
              style={{
                width: isMobile ? '80px' : '192px',
                height: isMobile ? '80px' : '192px',
                marginTop: isMobile ? '-40px' : '-80px',
                marginRight: isMobile ? '16px' : '64px',
              }}
            ></div>
            <div 
              className={`absolute bottom-0 left-0 rounded-full bg-[#d0b216] opacity-10`}
              style={{
                width: isMobile ? '80px' : '192px',
                height: isMobile ? '80px' : '192px',
                marginBottom: isMobile ? '-40px' : '-80px',
                marginLeft: isMobile ? '16px' : '64px',
              }}
            ></div>
            
            {/* Content — TIGHTER, SMALLER, CENTERED */}
            <div className="slide-content row absolute inset-0 w-full h-full flex items-center justify-center z-10 px-4">
              <motion.div 
                className="slider-outline center text-center"
                style={{ 
                  maxWidth: isMobile ? '92%' : '800px',
                  width: '100%'
                }}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
              >
                <motion.h1 
                  className="title effect-static-text mb-2"
                  variants={textVariants}
                  style={{
                    color: '#ffffff',
                    fontSize: isMobile ? '1.375rem' : '2.5rem', // 👈 22px on mobile
                    fontWeight: '700',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    lineHeight: isMobile ? '1.3' : '1.2'
                  }}
                >
                  {slide.title}
                </motion.h1>
                
                <motion.p 
                  className="description mb-3"
                  variants={textVariants}
                  style={{
                    color: '#ffffff',
                    fontSize: isMobile ? '0.75rem' : '1.125rem', // 👈 12px on mobile
                    maxWidth: isMobile ? '100%' : '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: isMobile ? '1.45' : '1.6',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {slide.description}
                </motion.p>
                
                <motion.div
                  className="buttons"
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="d-sm-inline-flex justify-content-center">
                    <motion.button
                      onClick={slide.buttonAction}
                      className="mx-auto btn primary-button"
                      variants={buttonVariants}
                      whileHover="hover"
                      style={{
                        backgroundColor: '#d0b216',
                        border: 'none',
                        color: '#182B5C',
                        padding: isMobile ? '8px 20px' : '14px 36px', // 👈 tighter button
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {slide.buttonText}
                      <motion.span 
                        className="absolute inset-0 bg-white"
                        style={{ 
                          opacity: 0,
                          borderRadius: '8px'
                        }}
                        whileHover={{
                          opacity: 0.2,
                          transition: { duration: 0.3 }
                        }}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom pagination — smaller bullets on mobile */}
        <div 
          className="swiper-pagination slider-pagination" 
          style={{ 
            bottom: isMobile ? '14px' : '28px',
            zIndex: 10
          }} 
        />
      </Swiper>
      
      <style>{`
        .hero {
          position: relative;
          overflow: hidden;
        }
        
        .slider-item {
          position: relative;
        }
        
        .slider-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .slide-content {
          position: relative;
          z-index: 2;
        }
        
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          margin: 0 3px;
          position: relative;
          overflow: hidden;
          border-radius: 6px;
        }
        
        .swiper-pagination-bullet-active {
          background: transparent;
          width: 18px;
        }
        
        .swiper-pagination-bullet-active .bullet-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #d0b216;
          border-radius: 6px;
          animation: progress 5s linear;
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        @media screen and (max-width: 768px) {
          .whatsapp-float {
            width: 40px;
            height: 40px;
            bottom: 16px;
            right: 16px;
          }
          
          .whatsapp-float svg {
            font-size: 20px;
          }
          
          .chat-text {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;