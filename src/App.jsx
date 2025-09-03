import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Context - Replaced LanguageProvider with ThemeProvider
import { ThemeProvider } from "./contexts/ThemeContext"; // Make sure this file exists

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

// Track page views with GA
const TrackPageViews = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-6TTHG2D146", {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};

// Define routes
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="wifi-plans" element={<WifiPlans />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:slug" element={<ArticleDetail />} />
        <Route path="coverage" element={<CoverageMap />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  return (
    <HelmetProvider>
      <ParallaxProvider>
        <ThemeProvider> {/* ✅ Theme context now wraps everything */}
          {/* Google Analytics Scripts */}
          <Helmet>
            {/* Load gtag.js */}
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-6TTHG2D146"
            />

            {/* Initialize gtag and set initial config */}
            <script>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag() {
                  dataLayer.push(arguments);
                }
                gtag('js', new Date());
                gtag('config', 'G-6TTHG2D146');
              `}
            </script>

            {/* Optional: Add body class for smooth theme transitions */}
            <body className="bg-white dark:bg-gray-900 text-[#182B5C] dark:text-white transition-colors duration-300" />
          </Helmet>

          {/* Track page views on route change */}
          <TrackPageViews />

          {/* Render all routes */}
          <AppRoutes />
        </ThemeProvider>
      </ParallaxProvider>
    </HelmetProvider>
  );
}