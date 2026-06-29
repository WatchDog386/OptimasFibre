import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle } from "lucide-react";

const PriceCard = ({ plan, isPopular }) => (
  <motion.div
    className={`vuma-card p-8 ${
      isPopular ? "border-primary bg-gray-50" : "border-gray-200 bg-white"
    }`}
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center gap-2 mb-6">
      <Zap className={`w-6 h-6 ${isPopular ? "text-accent" : "text-primary"}`} />
      <h3 className="text-2xl font-semibold text-primary">{plan.speed}</h3>
      {isPopular && (
        <span className="vuma-pill">
          Most Popular
        </span>
      )}
    </div>

    <div className="mb-6">
      <span className="text-4xl font-bold text-primary">{plan.price}</span>
      <span className="text-secondary font-medium">/month</span>
    </div>

    <ul className="space-y-4 mb-8">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent" />
          <span className="text-secondary font-normal">{feature}</span>
        </li>
      ))}
    </ul>

    <button className={`w-full py-3 rounded-full font-semibold uppercase tracking-wide transition-colors ${
      isPopular 
        ? "bg-primary text-white hover:bg-secondary" 
        : "bg-primary text-white hover:bg-secondary"
    }`}>
      Select Plan
    </button>
  </motion.div>
);

export default PriceCard;
