import React from "react";
import { Outlet, Link } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Shield } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToHashElement from "../components/ScrollToHashElement";
// import ParticleBackground from "../components/ParticleBackground"; // Vuma style is clean, removing particles

export default function MainLayout() {
  // Check if user is logged in (has token)
  const isAdmin = !!localStorage.getItem("token");

  return (
    <div
      className="relative min-h-screen w-full bg-white text-gray-900 transition-colors duration-300 font-sans"
      style={{ overflowX: "hidden" }}
    >
      {/* Scroll anchor handler */}
      <ScrollToHashElement />

      {/* Background Layer - Clean White for Vuma style */}
      <div className="absolute inset-0 z-0 bg-white">
        {/* <ParticleBackground /> */} 
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Admin Banner */}
        {isAdmin && (
          <div className="py-3 px-6 text-center bg-primary border-b border-gray-200">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
              <Shield className="w-5 h-5 mr-3 text-white" />
              <span className="font-medium text-white">
                You're logged in as Admin
              </span>

              <Link
                to="/admin"
                className="ml-4 px-4 py-1 font-semibold rounded-lg bg-white text-primary hover:bg-gray-100 transition-colors duration-200 flex items-center"
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
