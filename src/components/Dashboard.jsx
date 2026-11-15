// Dashboard.jsx — admin dashboard shell: navigation, data loading and notifications.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link, NavLink } from 'react-router-dom';
import {
  Home, FileText, Receipt, Newspaper, Images, Users, Settings, UserCircle, LogOut,
  Menu, X, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle, Info, XCircle, ChevronDown
} from 'lucide-react';
import '@fontsource-variable/figtree';
import InvoiceManager from './InvoiceManager';
import ReceiptManager from './ReceiptManager';
import OverviewPanel from './admin/OverviewPanel';
import BlogPanel from './admin/BlogPanel';
import PortfolioPanel from './admin/PortfolioPanel';
import UsersPanel from './admin/UsersPanel';
import SettingsPanel from './admin/SettingsPanel';
import ProfilePanel from './admin/ProfilePanel';
import { Spinner, Button, Switch, cx } from './admin/ui';
import { apiFetch, refreshSession, clearSession } from './admin/api';
import { API_BASE_URL } from '../config/api';

const NAV = [
  { items: [{ id: 'overview', label: 'Home', icon: Home }] },
  { group: 'Billing', items: [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'receipts', label: 'Receipts', icon: Receipt }
  ] },
  { group: 'Website', items: [
    { id: 'blog', label: 'Blog', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio', icon: Images }
  ] }
];
const FOOTER_NAV = [
  { id: 'users', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'My profile', icon: UserCircle }
];
const ALL_NAV = [...NAV.flatMap((g) => g.items), ...FOOTER_NAV];
const SECTIONS = ALL_NAV.map((i) => i.id);
const pathFor = (id) => (id === 'overview' ? '/admin' : `/admin/${id}`);

// Theme passed to the invoice and receipt managers, in the SME style.
const BUTTON_BASE = 'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md font-medium text-[13px] transition-colors whitespace-nowrap';
const LEGACY_BUTTONS = {
  primary: { base: BUTTON_BASE, light: 'bg-brand hover:bg-brand-strong text-white shadow-sm', dark: 'bg-brand hover:bg-brand-strong text-white' },
  secondary: { base: BUTTON_BASE, light: 'bg-surface hover:bg-surface-2 text-fg-2 border border-edge', dark: 'bg-surface hover:bg-surface-2 text-fg-2 border border-edge' },
  danger: { base: BUTTON_BASE, light: 'bg-red-600 hover:bg-red-700 text-white', dark: 'bg-red-600 hover:bg-red-700 text-white' },
  accent: { base: BUTTON_BASE, light: 'bg-brand hover:bg-brand-strong text-white', dark: 'bg-brand hover:bg-brand-strong text-white' },
  small: { base: 'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md font-medium text-[12.5px] transition-colors whitespace-nowrap', light: 'bg-brand hover:bg-brand-strong text-white', dark: 'bg-brand hover:bg-brand-strong text-white' }
};

const themeFor = () => ({
  background: 'bg-surface-2',
  text: 'text-fg',
  card: 'bg-surface border-edge',
  input: 'bg-field border-edge-2 text-fg placeholder-fg-5 focus:border-brand focus:ring-1 focus:ring-brand',
  button: LEGACY_BUTTONS
});

const TOAST_STYLES = {
  success: { icon: CheckCircle2, className: 'border-l-brand', iconClass: 'text-brand' },
  error: { icon: XCircle, className: 'border-l-red-600', iconClass: 'text-red-600' },
  warning: { icon: AlertTriangle, className: 'border-l-amber-500', iconClass: 'text-amber-500' },
  info: { icon: Info, className: 'border-l-blue-500', iconClass: 'text-blue-500' }
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
    const label = ALL_NAV.find((i) => i.id === section)?.label;
    document.title = `${label} · Optimas Admin`;
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [section]);

  const goTo = useCallback((id, options = {}) => {
    if (options.create && id === 'blog') setCreatePost(true);
    navigate(pathFor(id));
  }, [navigate]);

  const logout = () => {
    clearSession();
    navigate('/admin/login', { replace: true });
  };

  const theme = useMemo(() => themeFor(), []);

  const counts = useMemo(() => ({
    invoices: invoices.filter((i) => i.status === 'overdue').length || null,
    blog: posts.filter((p) => p.published === false).length || null
  }), [invoices, posts]);

  const renderSection = () => {
    if (loading && !me) return <Spinner label="Loading dashboard..." />;
    if (loadError) {
      return (
        <div className="mx-auto mt-16 max-w-md rounded-md border border-edge bg-surface p-8 text-center">
          <XCircle size={36} className="mx-auto text-red-500" aria-hidden="true" />
          <p className="mt-3 text-[15px] font-medium text-fg">The dashboard could not load</p>
          <p className="mt-1 text-[13px] text-fg-4">{loadError}</p>
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
  const title = ALL_NAV.find((i) => i.id === section)?.label;

  const sideLink = ({ id, label, icon: Icon }) => (
    <NavLink
      key={id}
      to={pathFor(id)}
      end
      className={({ isActive }) => cx(
        'flex h-9 items-center gap-3 rounded-md px-2 text-[13.5px] transition-colors',
        isActive ? 'text-nav-active' : 'text-nav-text hover:bg-nav-hover/5 hover:text-white'
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="truncate">{label}</span>
      {counts[id] ? (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">
          {counts[id]}
        </span>
      ) : null}
    </NavLink>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="p-2">
        <div className="flex items-center gap-2.5 rounded-md bg-nav-hover/[0.06] px-3 py-2.5">
          <img src="/logo.png" alt="" className="h-8 w-8 shrink-0 rounded bg-white object-contain p-0.5" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[14px] font-semibold text-white">Optimas Fibre</span>
            <span className="block truncate text-[11px] text-nav-muted">{me?.role === 'admin' ? 'Administrator' : 'Workspace'}</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 pt-2" aria-label="Main">
        {NAV.map((group, i) => (
          <div key={group.group || i} className={cx(i > 0 && 'mt-4')}>
            {group.group && (
              <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-nav-muted">{group.group}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => <li key={item.id}>{sideLink(item)}</li>)}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-nav-hover/10 px-2 py-3">
        {FOOTER_NAV.map((item) => sideLink(item))}
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-3 rounded-md px-2 text-[13.5px] text-nav-text transition-colors hover:bg-nav-hover/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" /> View website
        </a>
      </div>
    </div>
  );

  return (
    <div className={cx('ui-sme min-h-screen', darkMode && 'dark')}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-nav-bg text-nav-text lg:block">{sidebar}</aside>

        {/* Phone/tablet sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <aside className="relative h-full w-64 max-w-[85%] bg-nav-bg text-nav-text shadow-xl">
              <button type="button" onClick={() => setSidebarOpen(false)} className="absolute right-2 top-3 rounded-md p-2 text-nav-muted hover:text-white" aria-label="Close menu">
                <X size={18} />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-edge bg-surface px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" onClick={() => setSidebarOpen(true)} className="-ml-1 rounded-md p-2 text-fg-3 hover:bg-surface-2 lg:hidden" aria-label="Open menu">
                <Menu size={20} />
              </button>
              <h1 className="truncate text-[15px] font-normal text-fg-2">{title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Switch checked={darkMode} onChange={setDarkMode} label={darkMode ? 'Dark' : 'Light'} srLabel="Dark mode" />
              <button type="button" onClick={loadAll} className="flex h-9 w-9 items-center justify-center rounded-full text-fg-4 transition-colors hover:bg-surface-2 hover:text-fg" aria-label="Reload data" title="Reload data">
                <RefreshCw className={cx('h-[18px] w-[18px]', loading && 'animate-spin')} strokeWidth={1.75} />
              </button>
              <UserMenu me={me} displayName={displayName} onLogout={logout} />
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
            {renderSection()}
          </main>
        </div>
      </div>

      {/* Notifications */}
      <div className="pointer-events-none fixed right-4 top-16 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map(({ id, text, type }) => {
          const { icon: Icon, className, iconClass } = TOAST_STYLES[type];
          return (
            <div key={id} className={cx('pointer-events-auto flex items-start gap-3 rounded-md border border-edge border-l-4 bg-surface px-4 py-3 text-[13px] text-fg-2 shadow-lg', className)} role={type === 'error' ? 'alert' : 'status'}>
              <Icon size={17} className={cx('mt-0.5 flex-shrink-0', iconClass)} aria-hidden="true" />
              <p className="flex-1 leading-snug">{text}</p>
              <button type="button" onClick={() => setToasts((list) => list.filter((t) => t.id !== id))} className="text-fg-4 hover:text-fg" aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Avatar with a dropdown: profile, settings, sign out. */
const UserMenu = ({ me, displayName, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const initials = displayName.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const item = 'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-fg-2 hover:bg-surface-2';

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-2" aria-haspopup="menu" aria-expanded={open}>
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand text-[12px] font-semibold text-white">
          {me?.profileImage ? <img src={me.profileImage} alt="" className="h-full w-full object-cover" /> : initials}
        </span>
        <span className="hidden text-[13px] font-medium text-fg-2 md:block">{displayName}</span>
        <ChevronDown size={15} className="hidden text-fg-4 md:block" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-md border border-edge bg-surface py-1 shadow-lg">
          <div className="border-b border-edge px-3 py-2.5">
            <p className="truncate text-[13.5px] font-medium text-fg">{displayName}</p>
            <p className="truncate text-[12px] text-fg-4">{me?.username ? `@${me.username}` : me?.email}</p>
          </div>
          <Link role="menuitem" to="/admin/profile" onClick={() => setOpen(false)} className={item}><UserCircle size={16} strokeWidth={1.75} />My profile</Link>
          <Link role="menuitem" to="/admin/settings" onClick={() => setOpen(false)} className={item}><Settings size={16} strokeWidth={1.75} />Settings</Link>
          <button role="menuitem" type="button" onClick={onLogout} className={cx(item, 'border-t border-edge text-red-600 hover:text-red-700')}><LogOut size={16} strokeWidth={1.75} />Sign out</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
