// BlogPost.jsx — a single article at /blog/:slug (also reachable at /articles/:slug).
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, Download, Link2, Check, User, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { RichText, getHeadings, readingTime, toPlainText } from '../utils/richText';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-1 w-full bg-transparent" aria-hidden="true">
      <div className="h-full bg-[#d0b216] transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
};

const ShareBar = ({ title }) => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  const linkClass = 'inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-[#015B97] hover:text-[#015B97] transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-slate-500">Share:</span>
      <a className={linkClass} href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className={linkClass} href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer">Facebook</a>
      <a className={linkClass} href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">X</a>
      <a className={linkClass} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <button type="button" onClick={copy} className={linkClass} aria-live="polite">
        {copied ? <><Check size={15} className="mr-1.5 text-green-600" aria-hidden="true" />Copied</> : <><Link2 size={15} className="mr-1.5" aria-hidden="true" />Copy link</>}
      </button>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | missing | error

  useEffect(() => {
    const controller = new AbortController();
    window.scrollTo(0, 0);
    (async () => {
      try {
        setStatus('loading');
        const res = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}`, { signal: controller.signal });
        if (res.status === 404) { setStatus('missing'); return; }
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        setPost(data.data);
        setStatus('ready');

        const listRes = await fetch(`${API_BASE_URL}/api/blog`, { signal: controller.signal });
        if (listRes.ok) {
          const all = ((await listRes.json()).data || []).filter((p) => p.slug !== data.data.slug && p.published !== false);
          const sameCategory = all.filter((p) => p.category === data.data.category);
          setRelated([...sameCategory, ...all.filter((p) => !sameCategory.includes(p))].slice(0, 3));
        }
      } catch (err) {
        if (err.name !== 'AbortError') setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [slug]);

  const headings = useMemo(() => (post ? getHeadings(post.content) : []), [post]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white pt-10 md:pt-14">
        <div className="mx-auto max-w-3xl space-y-4 px-4">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (status !== 'ready') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900">
            {status === 'missing' ? 'Article not found' : 'We could not load this article'}
          </h1>
          <p className="mt-2 text-slate-500">
            {status === 'missing' ? 'It may have been moved or unpublished.' : 'Please check your connection and try again.'}
          </p>
          <Link to="/blog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#015B97] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#014a7a]">
            <ArrowLeft size={16} aria-hidden="true" /> Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  const date = post.publishedAt || post.createdAt;
  const description = post.excerpt || toPlainText(post.content).slice(0, 160);
  const image = post.imageUrl
    ? (post.imageUrl.startsWith('/') ? `${window.location.origin}${post.imageUrl}` : post.imageUrl)
    : undefined;

  return (
    <div className="min-h-screen bg-white pb-20 pt-10 md:pt-14 font-sans text-slate-700">
      <Helmet>
        <title>{`${post.title} | Optimas Fibre`}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image} />}
        <link rel="canonical" href={`${window.location.origin}/blog/${post.slug}`} />
      </Helmet>
      <ReadingProgress />

      <article>
        <header className="mx-auto max-w-5xl px-4">
          <div className="max-w-3xl">
          <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#015B97]">
            <ArrowLeft size={16} aria-hidden="true" /> All articles
          </Link>
          <span className="mb-4 block w-fit rounded-full bg-[#015B97]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#015B97]">
            {post.category || 'General'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            {post.author?.name && (
              <span className="inline-flex items-center gap-1.5"><User size={15} aria-hidden="true" />{post.author.name}</span>
            )}
            <span className="inline-flex items-center gap-1.5"><Calendar size={15} aria-hidden="true" />{formatDate(date)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={15} aria-hidden="true" />{readingTime(post.content)} min read</span>
          </div>
          </div>
        </header>

        {post.imageUrl && (
          <div className="mx-auto mt-8 max-w-5xl px-4">
            <img src={post.imageUrl} alt="" className="max-h-[520px] w-full rounded-3xl object-cover shadow-lg" />
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 px-4 lg:grid-cols-[1fr_220px]">
          <div className="min-w-0 max-w-3xl text-[17px] md:text-lg">
            <RichText content={post.content} />
            <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <ShareBar title={post.title} />
              <a
                href={`${API_BASE_URL}/api/blog/${post.slug}/pdf`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#015B97] hover:underline"
              >
                <Download size={16} aria-hidden="true" /> Download PDF
              </a>
            </div>
          </div>

          {headings.length >= 2 && (
            <aside className="hidden lg:block">
              <nav className="sticky top-36 rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-label="On this page">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">On this page</p>
                <ul className="space-y-2 text-sm">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-slate-600 hover:text-[#015B97]">{h.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-5xl px-4" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 text-2xl font-black text-slate-900">Keep reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id || item._id}
                to={`/blog/${item.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <img src={item.imageUrl || '/fibre.webp'} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#d0b216]">{item.category || 'General'}</p>
                  <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 group-hover:text-[#015B97] line-clamp-2">{item.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#015B97]">
                    Read <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
