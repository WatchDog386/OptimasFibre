import React from "react";
import Hero from "./Hero"; // your improved component

const testimonials = [
  {
    name: "Sarah M.",
    feedback:
      "Incredible speeds! Setup was seamless, and now my whole smart home just works flawlessly.",
    location: "Knoxville, TN",
  },
  {
    name: "James W.",
    feedback:
      "Best internet provider I’ve ever had. No downtime, and gaming latency is near zero.",
    location: "Farragut, TN",
  },
];

const plans = [
  {
    title: "Starter",
    price: "$49/mo",
    speed: "Up to 300Mbps",
    features: ["Basic support", "Good for browsing", "No contracts"],
  },
  {
    title: "Pro",
    price: "$79/mo",
    speed: "Up to 1Gbps",
    features: ["Priority support", "Streaming & gaming", "Free router"],
    highlight: true,
  },
  {
    title: "Enterprise",
    price: "$129/mo",
    speed: "Up to 2Gbps",
    features: ["24/7 monitoring", "Static IP", "Business SLA"],
  },
];

const LandingPage = () => {
  return (
    <main className="bg-white text-gray-900 font-sans">
      <Hero />

      {/* Features */}
      <section className="py-20 px-6 sm:px-12 lg:px-24 bg-gray-50">
        <h2 className="text-4xl font-bold mb-12 text-center text-primary">Why Choose Us</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              title: "Ultra-Fast Speeds",
              desc: "Stream, game, and work with no buffering.",
            },
            {
              title: "Reliable Uptime",
              desc: "We guarantee 99.9% service uptime for homes and businesses.",
            },
            {
              title: "Smart Home Ready",
              desc: "Optimized for your smart lights, cameras, and assistants.",
            },
            {
              title: "No Data Caps",
              desc: "Unlimited bandwidth with zero throttling.",
            },
            {
              title: "Free Installation",
              desc: "We handle everything—no setup fees.",
            },
            {
              title: "24/7 Support",
              desc: "We're available anytime, anywhere.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-primary mb-2">{feat.title}</h3>
              <p className="text-gray-600 font-light">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 sm:px-12 lg:px-24 bg-white">
        <h2 className="text-4xl font-bold mb-12 text-center text-primary">Simple Pricing</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`w-full sm:w-[300px] p-6 rounded-xl border ${
                plan.highlight
                  ? "bg-gray-50 border-accent shadow-lg scale-105"
                  : "border-gray-200 bg-white shadow-sm"
              } hover:shadow-xl transition-all`}
            >
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-accent" : "text-primary"}`}>{plan.title}</h3>
              <p className="text-xl mb-4 text-primary font-bold">{plan.price}</p>
              <p className="text-sm mb-4 text-gray-500 font-medium">{plan.speed}</p>
              <ul className="text-gray-600 space-y-2 text-sm mb-8">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-accent">✔</span> {f}
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-3 rounded-full font-bold uppercase text-sm tracking-wider transition-colors ${
                  plan.highlight 
                    ? "bg-accent hover:bg-green-400 text-white" 
                    : "bg-primary hover:bg-slate-700 text-white"
                }`}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 sm:px-12 lg:px-24 bg-gray-50">
        <h2 className="text-4xl font-bold mb-12 text-center text-primary">Customer Reviews</h2>
        <div className="flex flex-wrap gap-8 justify-center">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-xl max-w-sm text-left shadow-md border border-gray-100 hover:-translate-y-1 transition-transform duration-300"
            >
              <p className="text-gray-600 italic mb-6 leading-relaxed">“{t.feedback}”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-primary font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-primary font-bold">{t.name}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA / Coverage */}
      <section className="py-24 text-center bg-primary px-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white font-sans">
            See If We Cover Your Area
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-10 text-lg font-light">
            Enter your zip code and check if Optimas Home Fiber is available in your neighborhood.
          </p>
          <button className="bg-accent hover:bg-green-400 text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            Check Coverage
          </button>
        </div>
      </section>

      {/* Footer removed as it is handled by MainLayout */}
    </main>
  );
};

export default LandingPage;
