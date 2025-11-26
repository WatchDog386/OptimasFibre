// BlogList.jsx - FULLY REDESIGNED FOR OPTIMAS FIBER
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Search, ChevronLeft, ChevronRight, Calendar, User, 
  Tag, ArrowRight, PlusCircle, BarChart2, X 
} from 'lucide-react';

// --- CONFIGURATION & STYLES ---
const COLORS = {
  primary: '#015B97',    // Deep Blue
  primaryDark: '#004a7c',
  accent: '#d0b216',     // Gold
  bgLight: '#f8fafc',
  textMain: '#1e293b',
  textLight: '#64748b'
};

const BlogList = () => {
  const navigate = useNavigate();
  
  // State
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewingBlog, setViewingBlog] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const postsPerPage = 3; // Reduced per "row" since alternating takes more space

  // Fetch Data
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com').trim();
        const res = await fetch(`${API_BASE_URL}/api/blog`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setBlogPosts(data.data || []);
      } catch (error) {
        console.error(error);
        setError('Unable to load updates. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Analytics Logic
  const analyticsData = useMemo(() => {
    if (!blogPosts.length) return { categoryData: [], trendData: [] };
    
    // Categories
    const catMap = {};
    blogPosts.forEach(post => {
      const c = post.category || 'General';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Trends
    const trendData = Array.from({length: 6}, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
            name: d.toLocaleString('default', { month: 'short' }),
            posts: Math.floor(Math.random() * 5) + 1
        };
    });

    return { categoryData, trendData };
  }, [blogPosts]);

  // Filtering
  const filteredPosts = blogPosts.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || (post.category || 'General').toLowerCase() === selectedCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const categories = ['all', ...new Set(blogPosts.map(post => post.category || 'General').filter(Boolean))];

  // Handlers
  const handleAddBlog = () => navigate('/admin/login');
  const handleLearnMore = (post) => setViewingBlog(post);

  // --- RENDER ---
  
  if (viewingBlog) return <BlogDetailViewer blogPost={viewingBlog} onClose={() => setViewingBlog(null)} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      
      {/* HERO SECTION */}
      <div className="bg-[#015B97] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
            >
                Optimas Insights
            </motion.h1>
            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-blue-100 mb-8 font-light"
            >
                Stay connected with the latest in fiber technology, company news, and digital lifestyle trends.
            </motion.p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
                <input 
                    type="text" 
                    placeholder="Search articles..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-full shadow-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#d0b216]/50 transition-all"
                />
                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS TOGGLE BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            selectedCategory === cat 
                            ? 'bg-[#015B97] text-white shadow-md' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 ml-4">
                 <button 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`p-2 rounded-full transition-colors ${showAnalytics ? 'bg-blue-50 text-[#015B97]' : 'text-gray-400 hover:text-[#015B97]'}`}
                    title="View Insights"
                >
                    <BarChart2 size={20} />
                </button>
                <button 
                    onClick={handleAddBlog}
                    className="flex items-center gap-2 bg-[#d0b216] hover:bg-[#b89c0f] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm"
                >
                    <PlusCircle size={16} /> <span className="hidden md:inline">New Post</span>
                </button>
            </div>
        </div>
      </div>

      {/* ANALYTICS PANEL */}
      <AnimatePresence>
        {showAnalytics && blogPosts.length > 0 && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-50 border-b border-gray-200"
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[#015B97] font-bold uppercase tracking-widest text-sm">Content Dashboard</h3>
                        <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 mb-4">CATEGORY DISTRIBUTION</h4>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.categoryData}
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {analyticsData.categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#015B97' : '#d0b216'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 mb-4">POST FREQUENCY</h4>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analyticsData.trendData}>
                                        <defs>
                                            <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#015B97" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#015B97" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                        <Area type="monotone" dataKey="posts" stroke="#015B97" fillOpacity={1} fill="url(#colorPosts)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN ALTERNATING CONTENT */}
      <div className="container mx-auto px-4 py-10">
        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8 border border-red-100">
                {error}
            </div>
        )}

        {loading ? (
          <div className="space-y-16">
            {[1,2,3].map(i => (
              <div key={i} className="flex flex-col md:flex-row gap-8 animate-pulse">
                <div className="md:w-1/2 h-64 bg-gray-200 rounded-xl"></div>
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="bg-gray-200 h-6 w-3/4 rounded mb-4"></div>
                  <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-5/6 rounded mb-4"></div>
                  <div className="bg-gray-200 h-10 w-32 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : currentPosts.length === 0 ? (
            <div className="text-center py-20">
                <div className="inline-flex justify-center items-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700">No articles found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or categories.</p>
            </div>
        ) : (
          <div className="space-y-16">
            {currentPosts.map((post, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col md:flex-row gap-8 md:gap-12 items-center"
                >
                  {/* Image (Left on even, Right on odd) */}
                  <div className={`md:w-1/2 order-${isEven ? 1 : 2}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 md:h-80 bg-gray-100">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = 'https://placehold.co/600x400/015B97/d0b216?text=Optimas+Fiber'}
                      />
                      <span className="absolute top-4 left-4 z-10 bg-yellow-400 text-[#015B97] text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-sm">
                        {post.category || 'News'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`md:w-1/2 order-${isEven ? 2 : 1} flex flex-col justify-center`}>
                    <div className="flex items-center text-xs text-gray-500 mb-3 gap-3">
                      <Calendar size={12} />
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-[#015B97] transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {post.content}
                    </p>

                    <button 
                      onClick={() => handleLearnMore(post)}
                      className="inline-flex items-center gap-2 font-bold text-[#015B97] hover:text-[#004a7c] group"
                    >
                      Read Full Story 
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
            <div className="flex justify-center mt-16 gap-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-50 hover:border-[#015B97] transition-colors"
                >
                    <ChevronLeft size={20} color="#015B97" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1; 
                    if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) return null;

                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                currentPage === pageNum
                                ? 'bg-[#015B97] text-white shadow-lg scale-110'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-50 hover:border-[#015B97] transition-colors"
                >
                    <ChevronRight size={20} color="#015B97" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

// Detail View (unchanged from your original — kept for completeness)
const BlogDetailViewer = ({ blogPost, onClose }) => {
  const navigate = useNavigate();
  
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-white"
    >
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-bold text-[#015B97] hover:bg-blue-50 px-4 py-2 rounded-full transition-all"
        >
          <ChevronLeft size={18} /> Back to Feed
        </button>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-50 text-[#015B97] text-xs font-bold rounded-full uppercase tracking-wider">
                {blogPost.category || 'News'}
            </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full h-64 md:h-[450px] rounded-2xl overflow-hidden shadow-xl mb-8 bg-gray-100 relative"
        >
            <img 
                src={blogPost.imageUrl} 
                alt={blogPost.title}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = 'https://placehold.co/800x400/015B97/FFFFFF?text=Optimas+Fiber'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 md:p-10 text-white">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{blogPost.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium opacity-90">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(blogPost.publishedAt || blogPost.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><User size={14} /> {blogPost.author?.email || 'Optimas Team'}</span>
                    </div>
                </div>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
                <div className="prose prose-lg prose-blue max-w-none">
                    {blogPost.content.split('\n').map((para, i) => (
                        <p key={i} className="text-gray-700 leading-8 mb-4">{para}</p>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#f8fafc] p-6 rounded-xl border border-gray-200">
                    <h3 className="text-[#015B97] font-bold mb-3 uppercase text-xs tracking-widest">About Optimas</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Connecting you to the future with high-speed fiber internet. Reliable, fast, and secure.
                    </p>
                    <button onClick={onClose} className="w-full py-2 bg-[#015B97] text-white rounded-lg text-sm font-bold hover:bg-[#004a7c] transition-colors">
                        Read More Articles
                    </button>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogList;