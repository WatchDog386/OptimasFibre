// BlogList.jsx — public blog: featured story, search, categories and post grid.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, X, Calendar, Clock, ArrowRight, RefreshCw, Newspaper, Star } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { toPlainText, readingTime } from '../utils/richText';

const PAGE_SIZE = 9;

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const postDate = (post) => post.publishedAt || post.createdAt;

const imageFor = (post) => post.imageUrl || '/fibre.webp';

const excerptFor = (post, length = 160) => {
  const text = post.excerpt || toPlainText(post.content);
  return text.length > length ? `${text.slice(0, length - 3).replace(/\s+\S*$/, '')}...` : text;
};

const Meta = ({ post, light = false }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium ${light ? 'text-white/80' : 'text-slate-500'}`}>
    <span className="inline-flex items-center gap-1.5"><Calendar size={13} aria-hidden="true" />{formatDate(postDate(post))}</span>
    <span className="inline-flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{readingTime(post.content)} min read</span>
  </div>
);

const CategoryTag = ({ children, light = false }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${light ? 'bg-[#d0b216] text-[#0b2540]' : 'bg-[#015B97]/10 text-[#015B97]'}`}>
    {children || 'General'}
  </span>
);

const FeaturedPost = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group relative block overflow-hidden rounded-3xl bg-[#0b2540] shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#d0b216]"
  >
    <img
      src={imageFor(post)}
      alt=""
      className="h-[340px] md:h-[440px] w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0b2540] via-[#0b2540]/60 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
          <Star size={12} aria-hidden="true" /> Featured
        </span>
        <CategoryTag light>{post.category}</CategoryTag>
      </div>
      <h2 className="max-w-3xl text-2xl md:text-4xl font-black leading-tight text-white">{post.title}</h2>
      <p className="mt-3 max-w-2xl text-sm md:text-base text-white/80 line-clamp-2">{excerptFor(post, 220)}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <Meta post={post} light />
        <span className="inline-flex items-center gap-2 text-sm font-bold text-[#d0b216]">
          Read story <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </div>
  </Link>
);

const PostCard = ({ post, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
    className="h-full"
  >
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#015B97]/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageFor(post)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3"><CategoryTag light>{post.category}</CategoryTag></div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-[#015B97] line-clamp-2">{post.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">{excerptFor(post)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <Meta post={post} />
          <ArrowRight size={16} className="text-[#015B97] transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </div>
    </Link>
  </motion.article>
);

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="aspect-[16/10] animate-pulse bg-slate-200" />
    <div className="space-y-3 p-5">
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/blog`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        // The public list never includes drafts; filter anyway in case an admin is signed in.
        setPosts((data.data || []).filter((post) => post.published !== false));
      } catch (err) {
        if (err.name !== 'AbortError') setError('We could not load the blog right now.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  const categories = useMemo(() => {
    const counts = new Map();
    posts.forEach((post) => {
      const name = post.category || 'General';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return [['All', posts.length], ...[...counts.entries()].sort((a, b) => b[1] - a[1])];
  }, [posts]);

  const filtering = search.trim() !== '' || category !== 'All';

  const featured = useMemo(
    () => (filtering ? null : posts.find((post) => post.featured) || posts[0] || null),
    [posts, filtering]
  );

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts
      .filter((post) => post !== featured)
      .filter((post) => category === 'All' || (post.category || 'General') === category)
      .filter((post) => !term
        || post.title.toLowerCase().includes(term)
        || (post.category || '').toLowerCase().includes(term)
        || toPlainText(post.content).toLowerCase().includes(term))
      .sort((a, b) => {
        const diff = new Date(postDate(b)) - new Date(postDate(a));
        return sort === 'newest' ? diff : -diff;
      });
  }, [posts, featured, search, category, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [search, category, sort]);

  return (
    <div className="min-h-screen bg-slate-50 pt-10 md:pt-14 pb-20 font-sans text-slate-800">
      <Helmet>
        <title>Blog & News | Optimas Fibre</title>
        <meta name="description" content="News, guides and updates from Optimas Fibre — home and business fibre internet in Kenya." />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d0b216]">Optimas Insights</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#015B97]">News & Guides</h1>
            <p className="mt-3 max-w-xl text-slate-600">
              Network updates, coverage news and tips to get the most from your fibre connection.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles"
              aria-label="Search articles"
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm shadow-sm outline-none focus:border-[#015B97] focus:ring-2 focus:ring-[#015B97]/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <>
            <div className="mb-10 h-[340px] md:h-[440px] animate-pulse rounded-3xl bg-slate-200" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#015B97] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#014a7a]"
            >
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Newspaper size={40} className="mx-auto text-slate-300" aria-hidden="true" />
            <p className="mt-4 text-lg font-bold text-slate-800">No articles yet</p>
            <p className="mt-1 text-slate-500">Check back soon for news and guides from the Optimas team.</p>
          </div>
        ) : (
          <>
            {featured && <div className="mb-10"><FeaturedPost post={featured} /></div>}

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categories">
                {categories.map(([name, count]) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={category === name}
                    onClick={() => setCategory(name)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      category === name
                        ? 'bg-[#015B97] text-white shadow'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-[#015B97] hover:text-[#015B97]'
                    }`}
                  >
                    {name} <span className="opacity-60">{count}</span>
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort articles"
                className="w-full md:w-auto rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-[#015B97]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="font-semibold text-slate-800">No articles match your search.</p>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setCategory('All'); }}
                  className="mt-3 text-sm font-bold text-[#015B97] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.slice(0, visible).map((post, i) => <PostCard key={post.id || post._id} post={post} index={i} />)}
                </div>
                {visible < results.length && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="rounded-full border-2 border-[#015B97] px-6 py-3 text-sm font-bold text-[#015B97] hover:bg-[#015B97] hover:text-white transition-colors"
                    >
                      Show more articles
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;
