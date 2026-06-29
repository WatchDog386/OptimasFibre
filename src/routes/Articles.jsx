import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useDebounce } from "use-debounce";

import { useLanguage } from "../contexts/LanguageContext";
import { articles } from "../data/articles";

const LoadingSkeleton = () => (
  <div className="text-center text-gray-500 py-10">Loading articles...</div>
);

const ErrorFallback = ({ message }) => (
  <div className="text-center text-red-600 py-10">{message}</div>
);

const ArticleCard = React.memo(({ article }) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="group overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-all"
  >
    <Link to={`/articles/${article.slug}`}>
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-48 object-cover rounded-t-2xl"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600">{article.excerpt}</p>
      </div>
    </Link>
  </motion.article>
));

const FeaturedArticle = ({ article }) => {
  if (!article) return null;
  return (
    <motion.article
      className="overflow-hidden rounded-3xl mb-16 bg-white border border-gray-200 hover:shadow-2xl transition-all"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link to={`/articles/${article.slug}`}>
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-72 object-cover rounded-t-3xl"
        />
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h2>
          <p className="text-gray-600">{article.excerpt}</p>
        </div>
      </Link>
    </motion.article>
  );
};

export default function Articles() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  const categories = useMemo(
    () => [
      { id: "all", label: t("categories.all") || "All" },
      { id: "technology", label: t("categories.technology") || "Technology" },
      { id: "community", label: t("categories.community") || "Community" },
      { id: "guides", label: t("categories.guides") || "Guides" },
    ],
    [t]
  );

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" || article.category === selectedCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, debouncedSearch]);

  const featuredArticle = useMemo(
    () => articles.find((a) => a.isFeatured),
    []
  );

  return (
    <section className="relative min-h-screen py-24 px-4 md:px-10 overflow-hidden bg-white text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-cyan-600 mb-12">
          {t("titles.knowledgeHub") || "Knowledge Hub"}
        </h1>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm transition border ${
                selectedCategory === cat.id
                  ? "bg-cyan-500 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-cyan-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <input
            type="text"
            placeholder={t("placeholders.searchArticles") || "Search articles..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Featured */}
        <FeaturedArticle article={featuredArticle} />

        {/* Article Grid */}
        <AnimatePresence mode="wait">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {t("messages.noArticlesFound") || "No articles found."}
            </p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
