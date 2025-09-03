import React from "react";
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToHashElement from "../components/ScrollToHashElement";
import ParticleBackground from "../components/ParticleBackground";

export default function MainLayout() {
  return (
    <div
      className="relative min-h-screen w-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300"
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
        <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-12 mt-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}