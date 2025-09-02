import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";

// Context
import { LanguageProvider } from "./contexts/LanguageContext";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages (Routes)
import Home from "./routes/Home";
import About from "./routes/About";
import Services from "./routes/Services";
import Faqs from "./routes/faqs";
import Contact from "./routes/Contact";
import WifiPlans from "./routes/WifiPlans";
import Articles from "./routes/Articles";
import ArticleDetail from "./routes/ArticleDetail";
import CoverageMap from "./routes/CoverageMap";

const TrackPageViews = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-6TTHG2D146", {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};

// KCA-inspired transition component
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Loading screen component for between transitions
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#182B5C] flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#d0b216] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg font-light">Loading</p>
      </div>
    </div>
  );
};

function AppRoutes() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate loading between routes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Adjust timing to match your transition duration
    
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MainLayout />}>
            <Route
              index
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />
            <Route 
              path="about" 
              element={
                <PageTransition>
                  <About />
                </PageTransition>
              } 
            />
            <Route 
              path="services" 
              element={
                <PageTransition>
                  <Services />
                </PageTransition>
              } 
            />
            <Route 
              path="faqs" 
              element={
                <PageTransition>
                  <Faqs />
                </PageTransition>
              } 
            />
            <Route 
              path="contact" 
              element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              } 
            />
            <Route 
              path="wifi-plans" 
              element={
                <PageTransition>
                  <WifiPlans />
                </PageTransition>
              } 
            />
            <Route 
              path="articles" 
              element={
                <PageTransition>
                  <Articles />
                </PageTransition>
              } 
            />
            <Route 
              path="articles/:slug" 
              element={
                <PageTransition>
                  <ArticleDetail />
                </PageTransition>
              } 
            />
            <Route 
              path="coverage" 
              element={
                <PageTransition>
                  <CoverageMap />
                </PageTransition>
              } 
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ParallaxProvider>
        <LanguageProvider>
          {/* Google Analytics */}
          <Helmet>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-6TTHG2D146"></script>
            <script>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-6TTHG2D146');
              `}
            </script>
          </Helmet>

          <TrackPageViews />
          <AppRoutes />
        </LanguageProvider>
      </ParallaxProvider>
    </HelmetProvider>
  );
}