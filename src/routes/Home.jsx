import React from "react";
import { Helmet } from "react-helmet-async";

import Hero from "../components/Hero";


import Services from "./Services";
import Faqs from "./faqs";
import Contact from "./Contact";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Optimas Fiber</title>
        <meta
          name="description"
          content="Get fast, affordable, and reliable fiber internet across Kenya. Optimas delivers top-tier connectivity to rural and urban communities."
        />
        <meta
          property="og:title"
          content="Optimas Fiber"
        />
        <meta
          property="og:description"
          content="Experience high-speed fiber internet by Optimas. Designed for homes and businesses across Kenya."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://optimasfiber.co.ke" />
        {/* <meta property="og:image" content="https://optimasfiber.co.ke/assets/og-image.webp" /> */}
      </Helmet>

      <section id="hero">
        <Hero />
      </section>
      
        
      

      

      <section id="services">
        <Services />
      </section>

      <section id="faq">
        <Faqs />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </>
  );
}
