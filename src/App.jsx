import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Context
import { ThemeProvider } from "./contexts/ThemeContext";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages (Public Routes)
import Home from "./routes/Home";
import About from "./routes/About";
import Services from "./routes/Services";
import Faqs from "./routes/faqs";
import Contact from "./routes/Contact";
import WifiPlans from "./routes/WifiPlans";
import Articles from "./routes/Articles";
import ArticleDetail from "./routes/ArticleDetail";
import CoverageMap from "./routes/CoverageMap";
import BlogList from "./routes/BlogList"; // 👈 Added Blog List

// Admin Components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard"; // Default export
import ReceiptManager from "./components/ReceiptManager"; // 👈 Added ReceiptManager
import PrivateRoute from "./components/PrivateRoute";

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
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="wifi-plans" element={<WifiPlans />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="articles/:slug" element={<ArticleDetail />} />
        <Route path="coverage" element={<CoverageMap />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <Dashboard /> {/* Must include <Outlet /> inside Dashboard.jsx */}
          </PrivateRoute>
        }
      >
        {/* Nested admin routes */}
        <Route path="receipts" element={<ReceiptManager />} /> {/* 👈 Receipt Manager */}
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  return (
    <HelmetProvider>
      <ParallaxProvider>
        <ThemeProvider>
          {/* Google Analytics Scripts */}
          <Helmet>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-6TTHG2D146"
            />
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
            <body className="bg-white dark:bg-gray-900 text-[#182B5C] dark:text-white transition-colors duration-300" />
          </Helmet>

          {/* Track page views */}
          <TrackPageViews />

          {/* Render all routes */}
          <AppRoutes />
        </ThemeProvider>
      </ParallaxProvider>
    </HelmetProvider>
  );
}
