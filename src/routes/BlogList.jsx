// BlogList.jsx - PREMIUM "TECH DESIGN" ALTERNATING LAYOUT
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, AreaChart, Area, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Search, ChevronLeft, ChevronRight, Calendar, User, 
  ArrowRight, PlusCircle, BarChart2, X, Clock, Heart, Share2, Filter
} from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com').trim();
const COLORS = {
  primary: '#015B97',
  accent: '#d0b216',
};

const BlogList = () => {
  const navigate = useNavigate();
  
  // State
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewingBlog, setViewingBlog] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const postsPerPage = 5; 

  // Fetch Data
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/blog`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setBlogPosts(data.data || []);
      } catch (error) {
        console.error(error);
        setError('Unable to load updates.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // --- Helpers ---
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s/g).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // --- Analytics Logic ---
  const analyticsData = useMemo(() => {
    if (!blogPosts.length) return { categoryData: [], trendData: [] };
    const catMap = {};
    blogPosts.forEach(post => {
      const c = post.category || 'General';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    const trendData = Array.from({length: 6}, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return { name: d.toLocaleString('default', { month: 'short' }), posts: Math.floor(Math.random() * 8) + 2 };
    });
    return { categoryData, trendData };
  }, [blogPosts]);

  // --- Filtering & Sorting ---
  const processedPosts = useMemo(() => {
    let filtered = blogPosts.filter(post => {
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || (post.category || 'General').toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt);
      const dateB = new Date(b.publishedAt || b.createdAt);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [blogPosts, searchTerm, selectedCategory, sortBy]);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = processedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(processedPosts.length / postsPerPage);
  const categories = ['all', ...new Set(blogPosts.map(post => post.category || 'General').filter(Boolean))];

  // --- RENDER ---
  if (viewingBlog) return <BlogDetailViewer blogPost={viewingBlog} onClose={() => setViewingBlog(null)} />;

  return (
    // NAVBAR FIX: pt-32 / pt-40
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-800 pt-32 md:pt-40 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#015B97] tracking-tight mb-2">
              Optimas<span className="text-[#d0b216]">.</span>Insights
            </h1>
            <p className="text-gray-500 text-sm max-w-md">
              Discover the latest in fiber technology, digital lifestyle tips, and company updates.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm text-sm focus:ring-2 focus:ring-[#015B97] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* 2. CATEGORIES & TOOLS */}
      <div className="max-w-5xl mx-auto px-4 mb-10 sticky top-28 z-20">
        <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                  ? 'bg-[#015B97] text-white shadow-md shadow-blue-900/20' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-auto">
             {/* Sort */}
             <div className="relative">
                <select 
                   value={sortBy} 
                   onChange={(e) => setSortBy(e.target.value)}
                   className="bg-transparent text-xs font-bold text-gray-600 appearance-none pr-6 cursor-pointer focus:outline-none"
                >
                   <option value="newest">Newest</option>
                   <option value="oldest">Oldest</option>
                </select>
                <Filter size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             </div>

             <button onClick={() => setShowAnalytics(!showAnalytics)} className={`p-2 rounded-lg transition-colors ${showAnalytics ? 'bg-blue-50 text-[#015B97]' : 'text-gray-400 hover:bg-gray-50'}`}>
                <BarChart2 size={18} />
             </button>
             
             <button onClick={() => navigate('/admin/login')} className="bg-[#d0b216] text-white p-2 rounded-lg hover:bg-[#b89c0f] transition-colors shadow-sm">
                <PlusCircle size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* 3. ANALYTICS (Expandable) */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-5xl mx-auto px-4 mb-8 overflow-hidden"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm grid md:grid-cols-2 gap-6">
               <div className="h-40">
                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Categories</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.categoryData} innerRadius={40} outerRadius={60} dataKey="value">
                        {analyticsData.categoryData.map((e, i) => <Cell key={i} fill={i % 2 === 0 ? '#015B97' : '#d0b216'} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="h-40">
                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Activity</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.trendData}>
                      <Area type="monotone" dataKey="posts" stroke="#015B97" fill="#015B97" fillOpacity={0.05} />
                      <Tooltip />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MAIN CONTENT - COMPACT ALTERNATING */}
      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => <div key={i} className="bg-white h-48 rounded-2xl animate-pulse shadow-sm" />)}
          </div>
        ) : processedPosts.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">No stories found.</p>
           </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {currentPosts.map((post, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={post._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 border border-gray-100 flex flex-col md:flex-row ${isEven ? '' : 'md:flex-row-reverse'}`}
                  >
                    {/* Image Section (Compact Height) */}
                    <div className="md:w-5/12 h-52 md:h-auto relative overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => e.target.src = 'https://placehold.co/600x400/015B97/FFFFFF?text=Optimas'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-none" />
                      
                      {/* Floating Date Badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-center px-3 py-1.5 rounded-lg shadow-sm">
                         <span className="block text-xs font-bold text-gray-400 uppercase">{new Date(post.publishedAt || post.createdAt).toLocaleString('default', { month: 'short' })}</span>
                         <span className="block text-lg font-black text-[#015B97] leading-none">{new Date(post.publishedAt || post.createdAt).getDate()}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#015B97]">
                           {post.category || 'News'}
                         </span>
                         <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                           <Clock size={10} /> {calculateReadTime(post.content)}
                         </span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#015B97] transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                         <button 
                            onClick={() => setViewingBlog(post)}
                            className="group/btn flex items-center gap-2 text-sm font-bold text-[#015B97]"
                         >
                            Read Story 
                            <span className="bg-blue-50 p-1 rounded-full group-hover/btn:bg-[#015B97] group-hover/btn:text-white transition-colors">
                               <ArrowRight size={14} />
                            </span>
                         </button>
                         
                         <div className="flex gap-3 text-gray-300">
                            <Heart size={18} className="hover:text-red-500 cursor-pointer transition-colors" />
                            <Share2 size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* 5. PAGINATION */}
        {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:shadow-md hover:border-[#015B97] transition-all"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1 bg-white px-2 rounded-xl border border-gray-200">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) return null;
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                    currentPage === pageNum ? 'bg-[#015B97] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:shadow-md hover:border-[#015B97] transition-all"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- DETAIL MODAL ---
const BlogDetailViewer = ({ blogPost, onClose }) => {
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md overflow-y-auto"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="min-h-screen bg-white md:mt-16 md:rounded-t-[2.5rem] shadow-2xl relative border-t border-gray-100"
      >
        <button 
          onClick={onClose}
          className="fixed top-4 right-4 md:top-8 md:right-8 z-50 bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-all"
        >
          <X size={20} className="text-gray-800" />
        </button>

        <div className="h-72 md:h-96 w-full relative group">
           <img 
              src={blogPost.imageUrl} 
              alt={blogPost.title}
              className="w-full h-full object-cover md:rounded-t-[2.5rem]"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
              <span className="bg-[#d0b216] text-white text-[10px] font-bold px-3 py-1 rounded-full mb-4 inline-block uppercase tracking-wider shadow-lg">
                {blogPost.category || 'News'}
              </span>
              <h1 className="text-3xl md:text-5xl font-black leading-tight max-w-4xl shadow-black drop-shadow-lg">
                {blogPost.title}
              </h1>
           </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
           <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-10 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#015B97]">
                    <User size={20} />
                 </div>
                 <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Author</p>
                    <p className="font-bold text-gray-800">{blogPost.author?.email?.split('@')[0] || 'Optimas Team'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#015B97]">
                    <Calendar size={20} />
                 </div>
                 <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Published</p>
                    <p className="font-bold text-gray-800">{new Date(blogPost.publishedAt || blogPost.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>
           </div>

           <div className="prose prose-slate prose-lg max-w-none first-letter:text-6xl first-letter:font-black first-letter:text-[#015B97] first-letter:mr-3 first-letter:float-left text-justify">
              {blogPost.content.split('\n').map((para, i) => (
                  <p key={i} className="mb-6 text-gray-600 leading-8">{para}</p>
              ))}
           </div>
           
           <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
              <button onClick={onClose} className="flex items-center gap-2 text-gray-500 font-bold hover:text-[#015B97] transition-colors">
                 <ChevronLeft size={20} /> Back to Feed
              </button>
              <div className="flex gap-4">
                 <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-colors">
                    <Heart size={18} /> Like
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogList;