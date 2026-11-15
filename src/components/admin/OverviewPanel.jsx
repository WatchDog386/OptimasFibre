// Overview ("Command Center"), in the Optimas SME dashboard style.
import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingUp, FileText, AlertTriangle, Plus, CalendarDays, Link2, Receipt, Newspaper } from 'lucide-react';
import { Button, cx } from './ui';
import { formatKsh, formatDate } from './api';

const DAY = 24 * 60 * 60 * 1000;
const ACTIVE_RECEIPT = (r) => !['refunded', 'cancelled', 'draft'].includes(r.status);
const OPEN_INVOICE = (i) => !['paid', 'cancelled', 'draft', 'completed'].includes(i.status);
const isOverdue = (inv) => inv.status === 'overdue' || (OPEN_INVOICE(inv) && inv.dueDate && new Date(inv.dueDate) < new Date());
const sameMonth = (value, ref) => {
  const d = new Date(value);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

// Solid-colour stat cards, as on the SME Command Center
const TONES = {
  blue: { card: 'bg-[#0D6EFD] text-white', footer: 'bg-[#0B5ED7] hover:bg-[#0A58CA]', icon: 'text-[#073B8C]' },
  green: { card: 'bg-[#198754] text-white', footer: 'bg-[#146C43] hover:bg-[#115C39]', icon: 'text-[#0A3D25]' },
  yellow: { card: 'bg-[#FFC107] text-[#212529]', footer: 'bg-[#E0A800] hover:bg-[#CC9A06]', icon: 'text-[#9C7400]' },
  red: { card: 'bg-[#DC3545] text-white', footer: 'bg-[#B02A37] hover:bg-[#9A2530]', icon: 'text-[#7A1C26]' }
};

const KpiCard = ({ tone, icon: Icon, value, label, note, onClick }) => {
  const t = TONES[tone];
  return (
    <div className={cx('overflow-hidden rounded-md shadow-sm', t.card)}>
      <div className="relative min-h-[5.5rem] px-3.5 pb-3 pt-3">
        <p className="truncate pr-14 text-[22px] font-bold leading-tight tracking-tight">{value}</p>
        <p className="mt-1.5 truncate pr-14 text-[13px] font-semibold">{label}</p>
        {note && <p className="mt-0.5 truncate pr-14 text-[11.5px] opacity-80">{note}</p>}
        <Icon className={cx('absolute right-3 top-3 h-12 w-12 opacity-40', t.icon)} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <button type="button" onClick={onClick} className={cx('flex w-full items-center justify-center gap-1.5 py-1.5 text-[12.5px] font-medium transition-colors', t.footer)}>
        More info <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

const Panel = ({ title, action, children, className }) => (
  <section className={cx('rounded-md border border-edge bg-surface p-5', className)}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[14px] font-medium text-fg">{title}</h2>
      {action && <div className="text-[12px] font-medium text-brand">{action}</div>}
    </div>
    {children}
  </section>
);

const LinkButton = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="hover:underline">{children}</button>
);

const MiniEmpty = ({ title, note }) => (
  <div className="py-8 text-center">
    <p className="text-[13px] font-medium text-fg-2">{title}</p>
    <p className="mt-0.5 text-[12px] text-fg-4">{note}</p>
  </div>
);

const MiniTable = ({ headers, rows, empty, onRow }) => {
  if (!rows.length) return <p className="py-6 text-center text-[12.5px] text-fg-4">{empty}</p>;
  return (
    <table className="w-full table-fixed text-[12.5px]">
      <thead>
        <tr className="border-b border-edge text-left text-fg-4">
          {headers.map((h, i) => (
            <th key={h} className={cx('pb-1.5 font-normal', i > 0 && 'w-28 text-right')}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ key, cells, tone }) => (
          <tr key={key} onClick={onRow} className={cx('border-b border-edge/60 last:border-0', onRow && 'cursor-pointer hover:bg-surface-2', tone === 'red' ? 'text-red-600' : 'text-fg-2')}>
            {cells.map((cell, j) => (
              <td key={j} className={cx('truncate py-2', j > 0 && 'text-right tabular-nums', j === 0 && 'font-medium')}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Donut = ({ data, colors, centre, caption }) => (
  <div className="flex items-center gap-5">
    <div className="relative h-32 w-32 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={44} outerRadius={60} stroke="none" startAngle={90} endAngle={-270}>
            {data.map((d) => <Cell key={d.name} fill={colors[d.name] || '#AAB6B0'} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-semibold text-fg">{centre}</span>
        <span className="text-[11px] text-fg-4">{caption}</span>
      </div>
    </div>
    <ul className="min-w-0 flex-1 space-y-1.5 text-[12.5px]">
      {data.map((d) => (
        <li key={d.name} className="flex items-center justify-between gap-2 text-fg-3">
          <span className="flex items-center gap-2 capitalize">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[d.name] || '#AAB6B0' }} />
            {d.name.replace(/_/g, ' ')}
          </span>
          <span className="font-medium text-fg-2">{d.value}</span>
        </li>
      ))}
    </ul>
  </div>
);

const STATUS_COLORS = {
  paid: '#198754', pending: '#FFC107', partially_paid: '#FD7E14', overdue: '#DC3545',
  draft: '#AAB6B0', cancelled: '#6C757D', completed: '#20C997'
};

const OverviewPanel = ({ invoices, receipts, posts, portfolio, goTo, darkMode }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = Date.now() - 30 * DAY;
    const weekAgo = Date.now() - 7 * DAY;
    const receiptDate = (r) => new Date(r.receiptDate || r.createdAt).getTime();
    const paid = receipts.filter(ACTIVE_RECEIPT);

    const sum = (list, key) => list.reduce((acc, item) => acc + Number(item[key] || 0), 0);
    const collected30 = sum(paid.filter((r) => receiptDate(r) >= thirtyDaysAgo), 'amountPaid');
    const collectedWeek = sum(paid.filter((r) => receiptDate(r) >= weekAgo), 'amountPaid');
    const today = paid.filter((r) => new Date(r.receiptDate || r.createdAt).toDateString() === now.toDateString());

    // Daily collections for the last 30 days
    const series = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (29 - i));
      return {
        day: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        Collected: sum(paid.filter((r) => new Date(r.receiptDate || r.createdAt).toDateString() === d.toDateString()), 'amountPaid')
      };
    });

    const open = invoices.filter(OPEN_INVOICE);
    const overdue = invoices.filter(isOverdue).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const billedMonth = sum(invoices.filter((i) => i.status !== 'cancelled' && sameMonth(i.invoiceDate || i.createdAt, now)), 'totalAmount');

    const statusCounts = invoices.reduce((acc, inv) => {
      const key = isOverdue(inv) ? 'overdue' : inv.status || 'pending';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const paidCount = statusCounts.paid || 0;

    return {
      collected30, collectedWeek, billedMonth, series,
      todayTotal: sum(today, 'amountPaid'), todayCount: today.length,
      outstanding: sum(open, 'balanceDue'), openCount: open.length,
      overdue, overdueTotal: sum(overdue, 'balanceDue'),
      status: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      paidShare: invoices.length ? Math.round((paidCount / invoices.length) * 100) : 0,
      recentReceipts: [...receipts].sort((a, b) => receiptDate(b) - receiptDate(a)).slice(0, 6),
      recentInvoices: [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
      drafts: posts.filter((p) => p.published === false).length
    };
  }, [invoices, receipts, posts]);

  const hasSeries = stats.series.some((p) => p.Collected > 0);

  return (
    <div className="space-y-5 md:mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-[26px] font-normal leading-tight tracking-tight text-fg md:text-[28px]">Command Center</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" icon={Newspaper} onClick={() => goTo('blog', { create: true })}>New post</Button>
          <Button variant="secondary" icon={Receipt} onClick={() => goTo('receipts')}>New receipt</Button>
          <Button icon={Plus} onClick={() => goTo('invoices')}>New invoice</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-edge bg-surface px-3 text-[12.5px] text-fg-3">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(new Date(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="inline-flex h-8 items-center rounded-md border border-edge bg-surface px-3 text-[12.5px] text-fg-3">
          Today · This month · Last 30 days
        </span>
        <span className="ml-auto inline-flex h-8 items-center rounded-md border border-edge bg-surface px-3 text-[12.5px] font-medium text-fg-2">KES</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard tone="blue" icon={Wallet} value={formatKsh(stats.collected30)} label="Revenue collected" note="Last 30 days" onClick={() => goTo('receipts')} />
        <KpiCard tone="green" icon={TrendingUp} value={formatKsh(stats.todayTotal)} label="Received today"
          note={`${stats.todayCount} payment${stats.todayCount === 1 ? '' : 's'}`} onClick={() => goTo('receipts')} />
        <KpiCard tone="yellow" icon={FileText} value={formatKsh(stats.outstanding)} label="Outstanding balance"
          note={`${stats.openCount} unpaid invoice${stats.openCount === 1 ? '' : 's'}`} onClick={() => goTo('invoices')} />
        <KpiCard tone="red" icon={AlertTriangle} value={formatKsh(stats.overdueTotal)} label="Overdue"
          note={`${stats.overdue.length} invoice${stats.overdue.length === 1 ? '' : 's'} past due`} onClick={() => goTo('invoices')} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Revenue trend" action={<LinkButton onClick={() => goTo('receipts')}>All receipts</LinkButton>}>
          <div className="mb-4 flex flex-wrap items-end gap-x-10 gap-y-2">
            <div>
              <p className="text-[12px] text-fg-4">Last 30 days</p>
              <p className="mt-0.5 text-[22px] font-semibold text-fg">{formatKsh(stats.collected30)}</p>
            </div>
            <div>
              <p className="text-[12px] text-fg-4">This week</p>
              <p className="mt-0.5 text-[22px] font-semibold text-fg">{formatKsh(stats.collectedWeek)}</p>
            </div>
            <div>
              <p className="text-[12px] text-fg-4">Billed this month</p>
              <p className="mt-0.5 text-[22px] font-semibold text-fg">{formatKsh(stats.billedMonth)}</p>
            </div>
          </div>
          {hasSeries ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3A8F91" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#3A8F91" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={darkMode ? '#2E2E2E' : '#E3E9E6'} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke={darkMode ? '#82828C' : '#8A9690'} interval={6} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={44} stroke={darkMode ? '#82828C' : '#8A9690'}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                  <Tooltip formatter={(v) => formatKsh(v)}
                    contentStyle={{ borderRadius: 6, border: `1px solid ${darkMode ? '#2E2E2E' : '#E3E9E6'}`, background: darkMode ? '#1E1E1E' : '#fff', fontSize: 12 }}
                    labelStyle={{ color: darkMode ? '#fff' : '#17201C' }} />
                  <Area type="monotone" dataKey="Collected" stroke="#3A8F91" strokeWidth={2.5} fill="url(#trend-fill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <MiniEmpty title="No revenue yet" note="Daily collections will chart here once receipts are issued." />
          )}
        </Panel>

        <Panel title="Invoices" action={<LinkButton onClick={() => goTo('invoices')}>See all</LinkButton>}>
          {invoices.length ? (
            <Donut data={stats.status} colors={STATUS_COLORS} centre={`${stats.paidShare}%`} caption="paid" />
          ) : (
            <MiniEmpty title="No invoices" note="Create an invoice to see its status here." />
          )}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-edge pt-4 text-center">
            {[
              ['Blog posts', posts.length, () => goTo('blog'), stats.drafts ? `${stats.drafts} draft${stats.drafts === 1 ? '' : 's'}` : 'all live'],
              ['Projects', portfolio.length, () => goTo('portfolio'), 'portfolio'],
              ['Receipts', receipts.length, () => goTo('receipts'), 'issued']
            ].map(([label, value, onClick, note]) => (
              <button key={label} type="button" onClick={onClick} className="rounded-md py-2 hover:bg-surface-2">
                <p className="text-[20px] font-semibold text-fg">{value}</p>
                <p className="text-[11.5px] text-fg-3">{label}</p>
                <p className="text-[11px] text-fg-5">{note}</p>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Needs attention" action={<LinkButton onClick={() => goTo('invoices')}>Invoices</LinkButton>}>
          <MiniTable
            headers={['Customer', 'Overdue', 'Balance']}
            onRow={() => goTo('invoices')}
            empty="Nothing overdue — every invoice is paid or within its due date."
            rows={stats.overdue.slice(0, 6).map((inv) => ({
              key: inv._id,
              tone: 'red',
              cells: [inv.customerName, `${Math.max(1, Math.floor((Date.now() - new Date(inv.dueDate)) / DAY))} days`, formatKsh(inv.balanceDue)]
            }))}
          />
        </Panel>

        <Panel title="Recent payments" action={<LinkButton onClick={() => goTo('receipts')}>Receipts</LinkButton>}>
          <MiniTable
            headers={['Customer', 'Date', 'Amount']}
            onRow={() => goTo('receipts')}
            empty="No receipts yet."
            rows={stats.recentReceipts.map((r) => ({
              key: r._id,
              cells: [r.customerName, formatDate(r.receiptDate || r.createdAt, { day: 'numeric', month: 'short' }), formatKsh(r.amountPaid)]
            }))}
          />
        </Panel>
      </div>

      <Panel title="Latest invoices" action={<LinkButton onClick={() => goTo('invoices')}>All invoices</LinkButton>}>
        <MiniTable
          headers={['Customer', 'Invoice', 'Total']}
          onRow={() => goTo('invoices')}
          empty="No invoices yet."
          rows={stats.recentInvoices.map((inv) => ({
            key: inv._id,
            tone: isOverdue(inv) ? 'red' : undefined,
            cells: [inv.customerName, inv.invoiceNumber, formatKsh(inv.totalAmount)]
          }))}
        />
      </Panel>

    </div>
  );
};

export default OverviewPanel;
