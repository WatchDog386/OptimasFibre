import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle } from "lucide-react";

const PriceCard = ({ plan, isPopular }) => (
  <motion.div
    className={`p-8 rounded-xl border-2 ${
      isPopular ? "border-accent bg-gray-50" : "border-gray-200 bg-white"
    } transition-all shadow-sm hover:shadow-md`}
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center gap-2 mb-6">
      <Zap className={`w-6 h-6 ${isPopular ? "text-accent" : "text-primary"}`} />
      <h3 className="text-2xl font-bold text-primary">{plan.speed}</h3>
      {isPopular && (
        <span className="px-3 py-1 bg-accent text-white rounded-full text-xs font-bold uppercase tracking-wider">
          Most Popular
        </span>
      )}
    </div>

    <div className="mb-6">
      <span className="text-4xl font-black text-primary">${plan.price}</span>
      <span className="text-gray-500 font-medium">/month</span>
    </div>

    <ul className="space-y-4 mb-8">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent" />
          <span className="text-gray-600 font-light">{feature}</span>
        </li>
      ))}
    </ul>

    <button className={`w-full py-3 rounded-full font-bold uppercase tracking-wide transition-colors ${
      isPopular 
        ? "bg-accent text-white hover:bg-green-400" 
        : "bg-primary text-white hover:bg-slate-700"
    }`}>
      Select Plan
    </button>
  </motion.div>
);

export default PriceCard;
