import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQSection = ({ faqData }) => {
  const [activeCategory, setActiveCategory] = useState(faqData[0].category);
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#182b5c] mb-8">FAQs</h2>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories */}
          <div className="space-y-2">
            {faqData.map((category) => (
              <button
                key={category.category}
                onClick={() => {
                  setActiveCategory(category.category);
                  setOpenIndex(null);
                }}
                className={`w-full px-4 py-3 text-left rounded-lg transition-colors font-medium border border-transparent ${
                  activeCategory === category.category
                    ? "bg-[#182b5c] text-white shadow-md"
                    : "hover:bg-gray-200 text-gray-700 bg-white border-gray-200"
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="lg:col-span-3 space-y-4">
            {faqData
              .find((cat) => cat.category === activeCategory)
              .items.map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <button
                    className="flex justify-between w-full items-center"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <h3 className="text-lg font-medium text-[#182b5c]">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-6 h-6 text-[#d0b216] transition-transform ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 text-gray-600"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
