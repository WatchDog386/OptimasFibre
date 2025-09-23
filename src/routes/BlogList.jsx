import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ✅ UPDATED BUTTON STYLES — SHORTER, NO ICONS, NATURAL WIDTH
const BUTTON_STYLES = {
  primary: {
    base: 'py-2 px-4 rounded-full font-medium text-sm transition-colors whitespace-nowrap',
    light: 'bg-[#015B97] hover:bg-[#014a7a] text-white border border-[#015B97]',
    dark: 'bg-[#015B97] hover:bg-[#014a7a] text-white border border-[#015B97]',
  },
  secondary: {
    base: 'py-2 px-4 rounded-full font-medium text-sm transition-colors whitespace-nowrap',
    light: 'bg-white hover:bg-gray-100 text-[#015B97] border border-[#015B97]',
    dark: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600',
  },
  small: {
    base: 'py-1.5 px-3 rounded-full font-medium text-xs transition-colors whitespace-nowrap',
    light: 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300',
    dark: 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600',
  }
};

// Define RISA's core styles as constants for consistency
const RISA_STYLES = {
  primaryColor: '#015B97',
  typography: {
    // Base text styles
    body: 'text-base',
    // Headings
    h1: 'text-2xl md:text-3xl font-bold',
    h2: 'text-xl md:text-2xl font-bold',
    h3: 'text-lg md:text-xl font-bold',
    // Card and blog text
    cardTitle: 'text-base md:text-lg font-bold',
    cardText: 'text-xs md:text-sm',
    // Special text
    highlight: {
      yellow: 'text-[#d0b216]',
      blue: 'text-[#182B5C]',
    },
  }
};

const BlogList = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const postsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        // ✅ FIXED: Removed extra spaces from URL and added proper error handling
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com').trim();
        const res = await fetch(`${API_BASE_URL}/api/blog`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch blog posts: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        // ✅ FIXED: Extract the array from response.data
        setBlogPosts(data.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Unable to load blog posts. Please check your internet connection and try again.');
        setBlogPosts([]); // Set to empty array to prevent .slice() errors
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (post.category || 'General').toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get current posts for pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Get unique categories
  const categories = ['all', ...new Set(blogPosts.map(post => post.category || 'General').filter(Boolean))];

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section — COMPACT FOR MOBILE */}
      <section className="bg-gradient-to-r from-[#182B5C] to-[#0f1e42] text-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className={`${RISA_STYLES.typography.h1} mb-3`}>
            Optimas Blog
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto mb-6">
            Discover the latest insights, news, and trends in internet technology
          </p>
          
          {/* Search Bar — COMPACT */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full py-2 px-4 text-sm rounded-full text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-[#d0b216]"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="absolute right-2 top-2 bg-[#015B97] text-white p-1.5 rounded-full hover:bg-[#014a7a] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Blog Content */}
          <div className="w-full lg:w-8/12">
            {/* Category Filters — COMPACT BUTTONS */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#015B97] text-white border-[#015B97]'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-center text-xs">
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            )}

            {/* Blog Posts Grid */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#182B5C]"></div>
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No blog posts found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Check back soon for new content!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentPosts.map((post) => (
                  <article key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
                    {post.imageUrl && (
                      <div className="h-36 md:h-40 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzljYTBiZCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span className="bg-[#d0b216] text-[#182B5C] px-2 py-0.5 rounded-full text-xs font-medium">
                          {post.category || 'General'}
                        </span>
                        <span className="mx-1">•</span>
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h2 className={`${RISA_STYLES.typography.cardTitle} mb-2 text-gray-800 dark:text-white hover:text-[#015B97] transition-colors`}>
                        <Link to={`/articles/${post.slug || post._id}`}>
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 text-xs">
                        {post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content}
                      </p>
                      <Link
                        to={`/articles/${post.slug || post._id}`}
                        className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light}`}
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination — COMPACT FOR MOBILE */}
            {filteredPosts.length > postsPerPage && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-8 h-8 text-xs rounded-full font-medium border border-gray-300 dark:border-gray-600 ${
                          currentPage === pageNum
                            ? 'bg-[#015B97] text-white border-[#015B97]'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Sidebar — FULL WIDTH ON MOBILE */}
          <div className="w-full lg:w-4/12 mt-6 lg:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <h3 className={`${RISA_STYLES.typography.h3} text-gray-800 dark:text-white mb-3`}>Categories</h3>
              <ul className="space-y-2">
                {categories.filter(cat => cat !== 'all').map(category => (
                  <li key={category}>
                    <button
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-3 py-1.5 rounded-full text-xs transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#015B97] text-white border-[#015B97]'
                          : 'text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex justify-between items-center">
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
                          {blogPosts.filter(post => (post.category || 'General') === category).length}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
              <h3 className={`${RISA_STYLES.typography.h3} text-gray-800 dark:text-white mb-3`}>Recent Posts</h3>
              <ul className="space-y-3">
                {blogPosts.slice(0, 3).map(post => (
                  <li key={post._id} className="flex items-start">
                    {post.imageUrl && (
                      <div className="flex-shrink-0 mr-2">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5Y2EwYmQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white text-xs hover:text-[#015B97] transition-colors">
                        <Link to={`/articles/${post.slug || post._id}`}>
                          {post.title}
                        </Link>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 className={`${RISA_STYLES.typography.h3} text-gray-800 dark:text-white mb-3`}>Subscribe</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-xs">
                Stay updated with our latest articles and news.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d0b216] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <button className={`${BUTTON_STYLES.primary.base} ${BUTTON_STYLES.primary.light} w-full`}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;