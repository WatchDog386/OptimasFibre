import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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
      overlayGradient: "linear-gradient(135deg, rgba(0, 117, 242, 0.7) 0%, rgba(38, 255, 230, 0.5) 100%)"
    },
    {
      image: "/fibre.webp",
      title: "Affordable Pricing Plans",
      description: "Get top-quality fibre internet services at competitive rates with flexible packages for homes and businesses.",
      buttonText: "VIEW PLANS",
      buttonAction: () => navigate('/wifiPlans'),
      overlayGradient: "linear-gradient(135deg, rgba(255, 105, 0, 0.7) 0%, rgba(255, 199, 0, 0.5) 100%)"
    },
    {
      image: "/router.jpg",
      title: "24/7 Customer Support",
      description: "Our dedicated team provides round-the-clock support to ensure seamless connectivity and quick issue resolution.",
      buttonText: "CONTACT US",
      buttonAction: () => navigate('/contact'),
      overlayGradient: "linear-gradient(135deg, rgba(106, 27, 154, 0.7) 0%, rgba(186, 104, 200, 0.5) 100%)"
    }
  ];

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
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
      boxShadow: "0 8px 25px rgba(0, 117, 242, 0.5)",
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <section className="hero p-0 relative w-full h-screen overflow-hidden">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ 
          delay: 6000,
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
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
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
            <div 
              className="slider-image full-image w-full h-full absolute top-0 left-0"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                background: slide.overlayGradient
              }}
            />
            
            {/* Content */}
            <div className="slide-content row absolute inset-0 w-full h-full flex items-center justify-center z-10">
              <div className="col-12 d-flex justify-content-center inner">
                <motion.div 
                  className="slider-outline center text-center text-md-center px-4"
                  style={{ maxWidth: '800px' }}
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
                    className="title effect-static-text mb-4"
                    variants={textVariants}
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #ffffff 15%, #e6f7ff 65%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: isMobile ? '2.5rem' : '3.5rem',
                      fontWeight: '700',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                      lineHeight: '1.2'
                    }}
                  >
                    {slide.title}
                  </motion.h1>
                  
                  <motion.p 
                    className="description mb-5"
                    variants={textVariants}
                    style={{
                      color: '#ffffff',
                      fontSize: isMobile ? '1rem' : '1.25rem',
                      maxWidth: '600px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      lineHeight: '1.6',
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
                          backgroundColor: '#0075f2',
                          border: 'none',
                          color: '#ffffff',
                          padding: '16px 40px',
                          borderRadius: '50px',
                          fontWeight: '600',
                          fontSize: '1rem',
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
                            borderRadius: '50px'
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
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom pagination */}
        <div className="swiper-pagination slider-pagination" style={{ bottom: '30px' }} />
        
        {/* Navigation arrows */}
        <div className="swiper-button-next !text-white !w-12 !h-12 after:!text-xl"></div>
        <div className="swiper-button-prev !text-white !w-12 !h-12 after:!text-xl"></div>
      </Swiper>
      
      <style jsx>{`
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
          height: 100%;
        }
        
        .swiper-pagination-bullet {
          width: 14px;
          height: 14px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          margin: 0 8px;
          position: relative;
          overflow: hidden;
          border-radius: 10px;
        }
        
        .swiper-pagination-bullet-active {
          background: transparent;
          width: 30px;
        }
        
        .swiper-pagination-bullet-active .bullet-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #0075f2;
          border-radius: 10px;
          animation: progress 5s linear;
        }
        
        .swiper-button-next, .swiper-button-prev {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          transition: all 0.3s ease;
        }
        
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
        
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev {
            display: none;
          }
          
          .title {
            font-size: 2.5rem !important;
          }
          
          .description {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;