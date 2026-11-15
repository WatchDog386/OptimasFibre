// Dashboard.jsx — admin dashboard shell: navigation, data loading and notifications.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Receipt, Newspaper, Images, Users, Settings, UserCircle, LogOut,
  Menu, X, Moon, Sun, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle, Info, XCircle
} from 'lucide-react';
import InvoiceManager from './InvoiceManager';
import ReceiptManager from './ReceiptManager';
import OverviewPanel from './admin/OverviewPanel';
import BlogPanel from './admin/BlogPanel';
import PortfolioPanel from './admin/PortfolioPanel';
import UsersPanel from './admin/UsersPanel';
import SettingsPanel from './admin/SettingsPanel';
import ProfilePanel from './admin/ProfilePanel';
import { Spinner, Button, cx } from './admin/ui';
import { apiFetch, refreshSession, clearSession } from './admin/api';
import { API_BASE_URL } from '../config/api';

const NAV = [
  { group: 'Business', items: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'receipts', label: 'Receipts', icon: Receipt }
  ] },
  { group: 'Website', items: [
    { id: 'blog', label: 'Blog', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio', icon: Images }
  ] },
  { group: 'Account', items: [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'My profile', icon: UserCircle }
  ] }
];
const SECTIONS = NAV.flatMap((g) => g.items.map((i) => i.id));

// Theme passed to the invoice and receipt managers (literal class names so Tailwind generates them).
const BUTTON_BASE = 'py-2.5 px-5 rounded-lg font-semibold text-xs uppercase tracking-wide transition-colors whitespace-nowrap shadow-sm';
const LEGACY_BUTTONS = {
  primary: { base: BUTTON_BASE, light: 'bg-[#00356B] hover:bg-[#002244] text-white', dark: 'bg-[#00356B] hover:bg-[#002244] text-white' },
  secondary: { base: BUTTON_BASE, light: 'bg-white hover:bg-slate-50 text-[#00356B] border border-slate-300', dark: 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600' },
  danger: { base: BUTTON_BASE, light: 'bg-red-600 hover:bg-red-700 text-white', dark: 'bg-red-600 hover:bg-red-700 text-white' },
  accent: { base: BUTTON_BASE, light: 'bg-[#D85C2C] hover:bg-[#b84520] text-white', dark: 'bg-[#D85C2C] hover:bg-[#b84520] text-white' },
  small: { base: 'py-2 px-3 rounded-lg font-semibold text-[11px] uppercase tracking-wide transition-colors whitespace-nowrap', light: 'bg-[#00356B] hover:bg-[#002244] text-white', dark: 'bg-[#00356B] hover:bg-[#002244] text-white' }
};

const themeFor = (darkMode) => ({
  background: darkMode ? 'bg-slate-900' : 'bg-slate-50',
  text: darkMode ? 'text-slate-100' : 'text-slate-800',
  card: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
  input: darkMode
    ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-[#00356B] focus:ring-1 focus:ring-[#00356B]'
    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#00356B] focus:ring-1 focus:ring-[#00356B]',
  button: LEGACY_BUTTONS
});

const TOAST_STYLES = {
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100' },
  error: { icon: XCircle, className: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100' },
  warning: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100' },
  info: { icon: Info, className: 'border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100' }
};

const readDarkMode = () => {
  try { return localStorage.getItem('dashboardDarkMode') === 'true'; } catch { return false; }
};

const Dashboard = () => {
  const { section: rawSection } = useParams();
  const section = SECTIONS.includes(rawSection) ? rawSection : 'overview';
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(readDarkMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [createPost, setCreatePost] = useState(false);

  const [me, setMe] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [settings, setSettings] = useState(null);
  const toastId = useRef(0);

  /** Notifications used by every page (also the invoice/receipt managers). */
  const notify = useCallback((message, type = 'info') => {
    const id = ++toastId.current;
    const text = String(message).replace(/^[\p{Extended_Pictographic}️\s]+/u, '');
    setToasts((list) => [...list.slice(-3), { id, text, type: TOAST_STYLES[type] ? type : 'info' }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), type === 'error' ? 7000 : 4500);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const results = await Promise.allSettled([
        apiFetch('/api/auth/me'),
        apiFetch('/api/invoices'),
        apiFetch('/api/receipts'),
        apiFetch('/api/blog'),
        apiFetch('/api/portfolio'),
        apiFetch('/api/settings')
      ]);
      const [meRes, invRes, recRes, blogRes, portRes, setRes] = results;
      if (meRes.status === 'fulfilled') setMe(meRes.value.user);
      if (invRes.status === 'fulfilled') setInvoices(invRes.value.invoices || []);
      if (recRes.status === 'fulfilled') setReceipts(recRes.value.receipts || []);
      if (blogRes.status === 'fulfilled') setPosts(blogRes.value.data || []);
      if (portRes.status === 'fulfilled') setPortfolio(portRes.value.data || []);
      if (setRes.status === 'fulfilled') setSettings(setRes.value.settings);
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length === results.length) setLoadError(failed[0].reason?.message || 'Could not load data');
      else if (failed.length) notify(`Some data could not be loaded: ${failed[0].reason?.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Keep the session alive while the dashboard is open (access tokens last about an hour).
  useEffect(() => {
    const timer = setInterval(() => { refreshSession(); }, 40 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('dashboardDarkMode', String(darkMode)); } catch { /* private mode */ }
  }, [darkMode]);

  useEffect(() => {
    const label = NAV.flatMap((g) => g.items).find((i) => i.id === section)?.label;
    document.title = `${label} · Optimas Admin`;
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [section]);

  const goTo = useCallback((id, options = {}) => {
    if (options.create && id === 'blog') setCreatePost(true);
    navigate(id === 'overview' ? '/admin' : `/admin/${id}`);
  }, [navigate]);

  const logout = () => {
    clearSession();
    navigate('/admin/login', { replace: true });
  };

  const theme = useMemo(() => themeFor(darkMode), [darkMode]);

  const counts = useMemo(() => ({
    invoices: invoices.filter((i) => i.status === 'overdue').length || null,
    blog: posts.filter((p) => p.published === false).length || null
  }), [invoices, posts]);

  const renderSection = () => {
    if (loading && !me) return <Spinner label="Loading dashboard..." />;
    if (loadError) {
      return (
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-slate-800">
          <XCircle size={36} className="mx-auto text-red-500" aria-hidden="true" />
          <p className="mt-3 font-bold text-slate-900 dark:text-white">The dashboard could not load</p>
          <p className="mt-1 text-sm text-slate-500">{loadError}</p>
          <Button className="mt-5" icon={RefreshCw} onClick={loadAll}>Try again</Button>
        </div>
      );
    }
    switch (section) {
      case 'invoices':
        return (
          <InvoiceManager darkMode={darkMode} themeClasses={theme} API_BASE_URL={API_BASE_URL} showNotification={notify}
            invoices={invoices} setInvoices={setInvoices} receipts={receipts} setReceipts={setReceipts} />
        );
      case 'receipts':
        return (
          <ReceiptManager darkMode={darkMode} themeClasses={theme} API_BASE_URL={API_BASE_URL} showNotification={notify}
            receipts={receipts} setReceipts={setReceipts} invoices={invoices} />
        );
      case 'blog':
        return <BlogPanel posts={posts} setPosts={setPosts} notify={notify} startCreating={createPost} onCreateHandled={() => setCreatePost(false)} />;
      case 'portfolio':
        return <PortfolioPanel items={portfolio} setItems={setPortfolio} notify={notify} />;
      case 'users':
        return <UsersPanel me={me} notify={notify} />;
      case 'settings':
        return <SettingsPanel settings={settings} setSettings={setSettings} notify={notify} />;
      case 'profile':
        return <ProfilePanel me={me} setMe={setMe} notify={notify} />;
      default:
        return <OverviewPanel me={me} invoices={invoices} receipts={receipts} posts={posts} portfolio={portfolio} goTo={goTo} darkMode={darkMode} />;
    }
  };

  const displayName = me?.displayName || me?.name || me?.username || 'Admin';

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="Dashboard">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div>
          <p className="text-sm font-black tracking-wide text-white">OPTIMAS</p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#D85C2C]">Admin</p>
        </div>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-white/40">{group.group}</p>
            <ul className="space-y-1">
              {group.items.map(({ id, label, icon: Icon }) => {
                const active = section === id;
                return (
                  <li key={id}>
                    <Link
                      to={id === 'overview' ? '/admin' : `/admin/${id}`}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                        active ? 'bg-white text-[#00356B] shadow' : 'text-white/75 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span className="flex-1">{label}</span>
                      {counts[id] && (
                        <span className={cx('rounded-full px-2 py-0.5 text-[11px] font-bold', id === 'invoices' ? 'bg-red-500 text-white' : 'bg-white/20 text-white', active && 'bg-[#D85C2C] text-white')}>
                          {counts[id]}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
          <ExternalLink size={18} aria-hidden="true" /> View website
        </a>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/75 hover:bg-red-500/20 hover:text-white">
          <LogOut size={18} aria-hidden="true" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-gradient-to-b from-[#00356B] to-[#002244] lg:block">{sidebar}</aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <aside className="relative h-full w-72 max-w-[85%] bg-gradient-to-b from-[#00356B] to-[#002244] shadow-2xl">
              <button type="button" onClick={() => setSidebarOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-white/70 hover:bg-white/10" aria-label="Close menu">
                <X size={20} />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:px-6">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <p className="flex-1 truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
              {NAV.flatMap((g) => g.items).find((i) => i.id === section)?.label}
            </p>
            <button type="button" onClick={loadAll} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Reload data" title="Reload data">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button type="button" onClick={() => setDarkMode((d) => !d)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label={darkMode ? 'Light mode' : 'Dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/admin/profile" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#00356B] text-sm font-bold text-white">
                {me?.profileImage ? <img src={me.profileImage} alt="" className="h-full w-full object-cover" /> : displayName[0].toUpperCase()}
              </span>
              <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 sm:block">{displayName}</span>
            </Link>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            {renderSection()}
          </main>
        </div>

        {/* Notifications */}
        <div className="pointer-events-none fixed right-4 top-20 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
          {toasts.map(({ id, text, type }) => {
            const { icon: Icon, className } = TOAST_STYLES[type];
            return (
              <div key={id} className={cx('pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg', className)} role={type === 'error' ? 'alert' : 'status'}>
                <Icon size={18} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="flex-1 leading-snug">{text}</p>
                <button type="button" onClick={() => setToasts((list) => list.filter((t) => t.id !== id))} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
