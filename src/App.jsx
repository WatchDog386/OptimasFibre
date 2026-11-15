import React from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import { Helmet, HelmetProvider } from "react-helmet-async";

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
import BlogPost from "./routes/BlogPost";
import CoverageMap from "./routes/CoverageMap";
import BlogList from "./routes/BlogList";
import Vacancies from "./routes/Vacancies";

// Admin Components
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";
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
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="articles/:slug" element={<BlogPost />} />
        <Route path="coverage" element={<CoverageMap />} />
        <Route path="vacancies" element={<Vacancies />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />

      {/* Admin Layout Route */}
      <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin/:section" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  const isLocal = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  return (
    <HelmetProvider>
      <ParallaxProvider>
        {/* Google Analytics Scripts */}
        <Helmet>
          {!isLocal && (
            <>
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
            </>
          )}

          {/* PERMANENT LIGHT MODE */}
          <body className="bg-white text-primary transition-colors duration-300" />
        </Helmet>

        {/* Track page views */}
        <TrackPageViews />

        {/* Render routes */}
        <AppRoutes />
      </ParallaxProvider>
    </HelmetProvider>
  );
}