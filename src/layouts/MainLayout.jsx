import React from "react";
import { Outlet, Link } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Shield } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToHashElement from "../components/ScrollToHashElement";
import ParticleBackground from "../components/ParticleBackground";
import { useTheme } from "../contexts/ThemeContext"; // 👈 Added Theme Context

export default function MainLayout() {
  // Get theme context
  const { darkMode } = useTheme();
  
  // Check if user is logged in (has token)
  const isAdmin = !!localStorage.getItem("token");

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-300 ${
        darkMode 
          ? "bg-gray-900 text-white" 
          : "bg-white text-gray-900"
      }`}
      style={{ overflowX: "hidden" }}
    >
      {/* Scroll anchor handler */}
      <ScrollToHashElement />

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      {/* Content Layer (above background) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* 👇 Enhanced Admin Dashboard Banner — Dark Mode Compatible */}
        {isAdmin && (
          <div 
            className={`py-3 px-6 text-center transition-colors duration-300 ${
              darkMode 
                ? "bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700" 
                : "bg-gradient-to-r from-[#182B5C] to-[#243C70] border-b border-blue-800"
            }`}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center">
              <Shield 
                className={`w-5 h-5 mr-3 ${
                  darkMode ? "text-blue-300" : "text-white"
                }`} 
              />
              <span 
                className={`font-medium ${
                  darkMode ? "text-blue-100" : "text-white"
                }`}
              >
                You're logged in as Admin
              </span>
              <Link
                to="/admin"
                className={`ml-4 px-4 py-1 font-semibold rounded-lg transition-colors duration-200 flex items-center ${
                  darkMode
                    ? "bg-yellow-600 hover:bg-yellow-500 text-gray-900"
                    : "bg-[#d0b216] hover:bg-[#c0a000] text-[#182B5C]"
                }`}
              >
                <span>Go to Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}