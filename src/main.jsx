import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Preload and inject critical external assets
const loadExternalResources = () => {
  // Preload and apply Leaflet CSS
  const leafletPreload = document.createElement("link");
  leafletPreload.rel = "preload";
  leafletPreload.as = "style";
  leafletPreload.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(leafletPreload);

  const leafletStyle = document.createElement("link");
  leafletStyle.rel = "stylesheet";
  leafletStyle.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(leafletStyle);

  // Load Leaflet Omnivore JS
  const omnivoreScript = document.createElement("script");
  omnivoreScript.src = "https://unpkg.com/leaflet-omnivore@0.3.4/leaflet-omnivore.min.js";
  omnivoreScript.async = true;
  document.head.appendChild(omnivoreScript);
};

// Initialize and mount React app
const initApp = () => {
  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(
    <React.StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LanguageProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

// Preload resources before rendering
if (document.readyState === "complete" || document.readyState === "interactive") {
  loadExternalResources();
  setTimeout(initApp, 0);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    loadExternalResources();
    initApp();
  });
}
