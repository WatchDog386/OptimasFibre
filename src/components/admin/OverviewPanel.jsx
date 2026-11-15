import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  Wallet, TrendingUp, AlertTriangle, FileText, Receipt, Newspaper, Plus, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, Button, StatusBadge, EmptyState, cx } from './ui';
import { formatKsh, formatDate } from './api';

const DAY = 24 * 60 * 60 * 1000;
const ACTIVE_RECEIPT = (r) => !['refunded', 'cancelled', 'draft'].includes(r.status);
const OPEN_INVOICE = (i) => !['paid', 'cancelled', 'draft', 'completed'].includes(i.status);

const sameMonth = (value, ref) => {
  const d = new Date(value);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

const isOverdue = (invoice) =>
  invoice.status === 'overdue' || (OPEN_INVOICE(invoice) && invoice.dueDate && new Date(invoice.dueDate) < new Date());

const StatCard = ({ icon: Icon, label, value, note, tone = 'navy', onClick }) => {
  const tones = {
    navy: 'bg-[#00356B]/10 text-[#00356B] dark:bg-blue-900/40 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    orange: 'bg-orange-50 text-[#D85C2C] dark:bg-orange-900/30 dark:text-orange-300'
  };
  return (
    <Card className={cx('p-5', onClick && 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md')} onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 whitespace-nowrap text-xl font-black tracking-tight text-slate-900 dark:text-white 2xl:text-2xl">{value}</p>
          {note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>}
        </div>
        <div className={cx('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', tones[tone])}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
};

const STATUS_COLORS = {
  paid: '#10b981', pending: '#f59e0b', partially_paid: '#fbbf24', overdue: '#ef4444',
  draft: '#94a3b8', cancelled: '#64748b', completed: '#059669'
};

const OverviewPanel = ({ me, invoices, receipts, posts, portfolio, goTo, darkMode }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const collected = (ref) => receipts
      .filter((r) => ACTIVE_RECEIPT(r) && sameMonth(r.receiptDate || r.createdAt, ref))
      .reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);

    const collectedThisMonth = collected(now);
    const collectedLastMonth = collected(lastMonth);
    const change = collectedLastMonth > 0
      ? Math.round(((collectedThisMonth - collectedLastMonth) / collectedLastMonth) * 100)
      : null;

    const open = invoices.filter(OPEN_INVOICE);
    const overdue = invoices.filter(isOverdue)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));
    const trend = months.map((m) => ({
      month: m.toLocaleString('en-GB', { month: 'short' }),
      Billed: invoices.filter((inv) => inv.status !== 'cancelled' && sameMonth(inv.invoiceDate || inv.createdAt, m))
        .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0),
      Collected: collected(m)
    }));

    const statusCounts = invoices.reduce((acc, inv) => {
      const key = isOverdue(inv) ? 'overdue' : inv.status || 'pending';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      collectedThisMonth,
      change,
      outstanding: open.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0),
      openCount: open.length,
      overdue,
      overdueTotal: overdue.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0),
      billedThisMonth: trend[trend.length - 1].Billed,
      trend,
      status: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      recentReceipts: [...receipts]
        .sort((a, b) => new Date(b.receiptDate || b.createdAt) - new Date(a.receiptDate || a.createdAt))
        .slice(0, 5),
      drafts: posts.filter((p) => p.published === false).length
    };
  }, [invoices, receipts, posts]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const axisColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#D85C2C]">{formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {greeting}, {me?.name || me?.displayName || 'there'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here is how billing and content are looking today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={Plus} onClick={() => goTo('invoices')}>New invoice</Button>
          <Button variant="secondary" icon={Plus} onClick={() => goTo('receipts')}>New receipt</Button>
          <Button variant="secondary" icon={Plus} onClick={() => goTo('blog', { create: true })}>New post</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          tone="green"
          label="Collected this month"
          value={formatKsh(stats.collectedThisMonth)}
          note={stats.change === null ? 'From receipts issued' : `${stats.change >= 0 ? '▲' : '▼'} ${Math.abs(stats.change)}% vs last month`}
          onClick={() => goTo('receipts')}
        />
        <StatCard
          icon={TrendingUp}
          label="Billed this month"
          value={formatKsh(stats.billedThisMonth)}
          note={`${invoices.length} invoices in total`}
          onClick={() => goTo('invoices')}
        />
        <StatCard
          icon={FileText}
          tone="orange"
          label="Outstanding balance"
          value={formatKsh(stats.outstanding)}
          note={`${stats.openCount} unpaid invoice${stats.openCount === 1 ? '' : 's'}`}
          onClick={() => goTo('invoices')}
        />
        <StatCard
          icon={AlertTriangle}
          tone="red"
          label="Overdue"
          value={formatKsh(stats.overdueTotal)}
          note={`${stats.overdue.length} invoice${stats.overdue.length === 1 ? '' : 's'} past due`}
          onClick={() => goTo('invoices')}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Billing vs collections" subtitle="Last 6 months, in Ksh" />
          <div className="h-72 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trend} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} width={60}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip
                  formatter={(v) => formatKsh(v)}
                  contentStyle={{ borderRadius: 12, border: 'none', background: darkMode ? '#1e293b' : '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.12)' }}
                  labelStyle={{ color: darkMode ? '#e2e8f0' : '#0f172a', fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Billed" fill="#00356B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Collected" fill="#D85C2C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Invoice status" subtitle={`${invoices.length} invoices`} />
          {stats.status.length ? (
            <div className="px-4 py-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.status} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {stats.status.map((s) => <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {stats.status.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-2 capitalize">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#94a3b8' }} />
                      {s.name.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState icon={FileText} title="No invoices yet" message="Create your first invoice to see this chart." />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Needs attention"
            subtitle="Overdue invoices, oldest first"
            action={<Button variant="ghost" size="sm" onClick={() => goTo('invoices')}>All invoices <ChevronRight size={14} /></Button>}
          />
          {stats.overdue.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {stats.overdue.slice(0, 6).map((inv) => {
                const days = Math.max(1, Math.floor((Date.now() - new Date(inv.dueDate)) / DAY));
                return (
                  <li key={inv._id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{inv.customerName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{inv.invoiceNumber} · {days} day{days === 1 ? '' : 's'} overdue</p>
                    </div>
                    <p className="whitespace-nowrap font-bold text-red-600">{formatKsh(inv.balanceDue)}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={CheckCircle2} title="Nothing overdue" message="Every invoice is paid or still within its due date." />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Latest payments"
            subtitle="Most recent receipts"
            action={<Button variant="ghost" size="sm" onClick={() => goTo('receipts')}>All receipts <ChevronRight size={14} /></Button>}
          />
          {stats.recentReceipts.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {stats.recentReceipts.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{r.customerName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.receiptNumber} · {formatDate(r.receiptDate || r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    <p className="whitespace-nowrap font-bold text-slate-900 dark:text-white">{formatKsh(r.amountPaid)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Receipt} title="No receipts yet" message="Receipts you issue will appear here." />
          )}
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Newspaper} label="Blog posts" value={posts.length}
          note={stats.drafts ? `${stats.drafts} draft${stats.drafts === 1 ? '' : 's'} not published` : 'All published'}
          onClick={() => goTo('blog')} />
        <StatCard icon={Newspaper} tone="orange" label="Portfolio projects" value={portfolio.length} note="Shown on the website" onClick={() => goTo('portfolio')} />
        <StatCard icon={Receipt} tone="green" label="Receipts issued" value={receipts.length} note="All time" onClick={() => goTo('receipts')} />
      </div>
    </div>
  );
};

export default OverviewPanel;
