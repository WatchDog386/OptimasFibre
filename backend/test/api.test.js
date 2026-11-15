// End-to-end API tests against a real PostgreSQL database.
//
//   TEST_DATABASE_URL=postgres://user:pass@127.0.0.1:5432/optimas_test npm test
//
// ⚠️ Every table in that database is DELETED first. Never point it at the live database.
// The tests deliberately ignore DATABASE_URL from backend/.env so they cannot touch production data.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

if (!process.env.TEST_DATABASE_URL) {
  console.error('Set TEST_DATABASE_URL to an empty, throwaway PostgreSQL database to run the tests.');
  process.exit(1);
}
if (process.env.DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL) {
  console.error('TEST_DATABASE_URL must not be the same database as DATABASE_URL.');
  process.exit(1);
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-0123456789abcdef0123456789abcdef';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-0123456789abcdef0123456789abcdef';
process.env.FRONTEND_URL ||= 'https://optimaswifi.co.ke';
process.env.RESEND_API_KEY = '';

const { sequelize } = await import('../src/config/db.js');
const { User } = await import('../src/models/index.js');
const { default: app } = await import('../src/app.js');

let server;
let base;
let adminToken;
let userToken;

const api = async (method, path, { token, body, raw } = {}) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (raw) return res;
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
};

const login = async (email, password) => (await api('POST', '/api/auth/login', { body: { email, password } })).body.token;

before(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await User.create({ email: 'Admin@Example.com', password: 'admin-pass-123', role: 'admin', name: 'Admin' });
  await User.create({ email: 'user@example.com', password: 'user-pass-123', role: 'user' });
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  adminToken = await login('admin@example.com', 'admin-pass-123');
  userToken = await login('user@example.com', 'user-pass-123');
});

after(async () => {
  server?.close();
  await sequelize.close();
});

test('health reports the database as connected', async () => {
  const res = await api('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.db, 'connected');
});

test('auth: login, verify, me, wrong password, refresh', async () => {
  assert.ok(adminToken);
  const bad = await api('POST', '/api/auth/login', { body: { email: 'admin@example.com', password: 'nope-nope' } });
  assert.equal(bad.status, 401);

  const verify = await api('GET', '/api/auth/verify', { token: adminToken });
  assert.equal(verify.body.valid, true);
  assert.equal(verify.body.user.role, 'admin');

  const garbage = await api('GET', '/api/auth/verify', { token: 'not-a-jwt' });
  assert.equal(garbage.status, 200);
  assert.equal(garbage.body.valid, false);

  const me = await api('GET', '/api/auth/me', { token: adminToken });
  assert.equal(me.body.user.email, 'admin@example.com');
  assert.equal(me.body.user.password, undefined);

  const loginRes = await api('POST', '/api/auth/login', { body: { email: 'admin@example.com', password: 'admin-pass-123' } });
  const refreshed = await api('POST', '/api/auth/refresh', { body: { refreshToken: loginRes.body.refreshToken } });
  assert.equal(refreshed.status, 200);
  assert.ok(refreshed.body.token);
});

test('auth: password reset token is stored hashed and works once', async () => {
  const res = await api('POST', '/api/auth/forgot-password', { body: { email: 'user@example.com' } });
  assert.equal(res.status, 200);
  const user = await User.unscoped().findOne({ where: { email: 'user@example.com' } });
  assert.match(user.resetPasswordToken, /^[0-9a-f]{64}$/);
  // The stored value is a hash, so it cannot be used as the token itself.
  const reuse = await api('POST', '/api/auth/reset-password', { body: { token: user.resetPasswordToken, password: 'whatever-123' } });
  assert.equal(reuse.status, 400);
});

test('auth: profile update and change password', async () => {
  const upd = await api('PUT', '/api/auth/update-profile', { token: adminToken, body: { name: 'Felix', phone: '0700000000' } });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.user.name, 'Felix');

  const wrong = await api('PUT', '/api/auth/change-password', { token: userToken, body: { currentPassword: 'x', newPassword: 'new-pass-123' } });
  assert.equal(wrong.status, 401);
});

test('admin-only routes reject anonymous and non-admin users', async () => {
  assert.equal((await api('GET', '/api/invoices')).status, 401);
  assert.equal((await api('GET', '/api/invoices', { token: userToken })).status, 403);
  assert.equal((await api('POST', '/api/invoices', { body: { customerName: 'x' } })).status, 401);
  assert.equal((await api('GET', '/api/receipts', { token: userToken })).status, 403);
  assert.equal((await api('POST', '/api/blog', { token: userToken, body: {} })).status, 403);
  assert.equal((await api('POST', '/api/settings', { token: userToken, body: {} })).status, 403);
});

test('blog: create, list (public), fetch by slug, update keeps slug, delete', async () => {
  const content = 'Fibre internet is fast and reliable. '.repeat(3);
  const created = await api('POST', '/api/blog', { token: adminToken, body: { title: 'Hello World!', content, category: 'News' } });
  assert.equal(created.status, 201);
  const post = created.body.data;
  assert.equal(post.slug, 'hello-world');
  assert.equal(post._id, post.id);
  assert.equal(post.author.name, 'Felix');
  assert.equal(post.author.email, undefined, 'author email must not be public');

  const dup = await api('POST', '/api/blog', { token: adminToken, body: { title: 'Hello World', content } });
  assert.equal(dup.body.data.slug, 'hello-world-1');

  const list = await api('GET', '/api/blog');
  assert.equal(list.body.count, 2);

  const bySlug = await api('GET', '/api/blog/hello-world');
  assert.equal(bySlug.body.data.id, post.id);

  const upd = await api('PUT', `/api/blog/${post._id}`, { token: adminToken, body: { title: 'Renamed', content } });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.data.slug, 'hello-world');

  const short = await api('POST', '/api/blog', { token: adminToken, body: { title: 'x', content: 'too short' } });
  assert.equal(short.status, 400);

  const pdf = await api('GET', '/api/blog/hello-world/pdf', { raw: true });
  assert.equal(pdf.headers.get('content-type'), 'application/pdf');

  assert.equal((await api('GET', '/api/blog/not-a-real-post')).status, 404);
  assert.equal((await api('DELETE', `/api/blog/${post._id}`, { token: adminToken })).status, 200);
});

test('portfolio: create via JSON with dashboard "content" field', async () => {
  const res = await api('POST', '/api/portfolio', {
    token: adminToken,
    body: { title: 'Kilimani install', content: 'Installed fibre to 40 homes.', imageUrl: 'https://example.com/a.jpg' }
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.description, 'Installed fibre to 40 homes.');
  const list = await api('GET', '/api/portfolio');
  assert.equal(list.body.count, 1);
});

test('settings: defaults, update merges companyInfo', async () => {
  const get = await api('GET', '/api/settings', { token: adminToken });
  assert.equal(get.status, 200);
  assert.ok(get.body.settings.companyInfo.paybill);

  const upd = await api('POST', '/api/settings', { token: adminToken, body: { companyInfo: { paybill: '999999' }, notifications: false } });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.settings.companyInfo.paybill, '999999');
  assert.ok(upd.body.settings.companyInfo.name, 'other company fields are kept');
  assert.equal(upd.body.settings.notifications, false);

  const bad = await api('POST', '/api/settings', { token: adminToken, body: { notifications: 'yes' } });
  assert.equal(bad.status, 400);
});

let invoiceId;

test('invoices: create computes totals and sequential numbers', async () => {
  const body = {
    customerName: 'Jane Doe', customerEmail: 'JANE@example.com', customerPhone: '0711', customerLocation: 'Nairobi',
    planName: 'Jumbo', planSpeed: '8Mbps', planPrice: '1500',
    items: [{ description: 'Monthly', quantity: 2, unitPrice: 1000 }],
    taxRate: 16, paymentMethod: 'Mobile Money', clientAccountNumber: 'fbi-123',
    _id: 'evil', createdBy: 'evil', totalAmount: 1
  };
  const a = await api('POST', '/api/invoices', { token: adminToken, body });
  assert.equal(a.status, 201, JSON.stringify(a.body));
  const inv = a.body.invoice;
  invoiceId = inv._id;
  assert.equal(inv.invoiceNumber, 'INV-0001');
  assert.equal(inv.customerEmail, 'jane@example.com');
  assert.equal(inv.subtotal, 2000);
  assert.equal(inv.taxAmount, 320);
  assert.equal(inv.totalAmount, 2320);
  assert.equal(inv.balanceDue, 2320);
  assert.equal(inv.paymentMethod, 'mobile_money');
  assert.equal(inv.clientAccountNumber, 'FBI-123');
  assert.equal(inv.status, 'pending');

  const b = await api('POST', '/api/invoices', { token: adminToken, body: { ...body, items: [] } });
  assert.equal(b.body.invoice.invoiceNumber, 'INV-0002');
  assert.equal(b.body.invoice.totalAmount, 1740, 'falls back to plan price + tax');

  const manual = await api('POST', '/api/invoices', { token: adminToken, body: { ...body, invoiceNumber: 'INV-0009' } });
  assert.equal(manual.body.invoice.invoiceNumber, 'INV-0009');
  const next = await api('POST', '/api/invoices', { token: adminToken, body });
  assert.equal(next.body.invoice.invoiceNumber, 'INV-0010', 'continues after the highest number');

  const clash = await api('POST', '/api/invoices', { token: adminToken, body: { ...body, invoiceNumber: 'INV-0009' } });
  assert.equal(clash.status, 400);

  const missing = await api('POST', '/api/invoices', { token: adminToken, body: { customerName: 'x' } });
  assert.equal(missing.status, 400);

  const badEmail = await api('POST', '/api/invoices', { token: adminToken, body: { ...body, customerEmail: 'nope' } });
  assert.equal(badEmail.status, 400);
});

test('invoices: concurrent creates get distinct numbers', async () => {
  const body = { customerName: 'C', customerEmail: 'c@example.com', planName: 'Tiger', planPrice: 100 };
  const results = await Promise.all(Array.from({ length: 4 }, () => api('POST', '/api/invoices', { token: adminToken, body })));
  const numbers = results.map((r) => r.body.invoice?.invoiceNumber);
  assert.ok(results.every((r) => r.status === 201), JSON.stringify(results.map((r) => r.body)));
  assert.equal(new Set(numbers).size, 4);
});

test('invoices: list, search (wildcards are literal), get, update', async () => {
  const list = await api('GET', '/api/invoices', { token: adminToken });
  assert.equal(list.status, 200);
  assert.ok(list.body.invoices.length >= 8);

  const search = await api('GET', '/api/invoices?search=jane', { token: adminToken });
  assert.ok(search.body.invoices.length >= 1);
  const wildcard = await api('GET', '/api/invoices?search=%25', { token: adminToken });
  assert.equal(wildcard.body.invoices.length, 0);

  const badSort = await api('GET', '/api/invoices?sortBy=password', { token: adminToken });
  assert.equal(badSort.status, 200);

  assert.equal((await api('GET', '/api/invoices/not-a-uuid', { token: adminToken })).status, 404);
  assert.equal((await api('GET', '/api/invoices/00000000-0000-4000-8000-000000000000', { token: adminToken })).status, 404);

  const upd = await api('PUT', `/api/invoices/${invoiceId}`, {
    token: adminToken, body: { customerName: 'Jane D', customerEmail: 'jane@example.com', planName: 'Jumbo', amountPaid: 1000, invoiceNumber: '' }
  });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.invoice.invoiceNumber, 'INV-0001');
  assert.equal(upd.body.invoice.status, 'partially_paid');
  assert.equal(upd.body.invoice.balanceDue, 1320);
});

test('invoices: mark paid settles balance and records history; overdue rules', async () => {
  const paid = await api('PATCH', `/api/invoices/${invoiceId}/paid`, { token: adminToken, body: { amount: 2320 } });
  assert.equal(paid.status, 200);
  assert.equal(paid.body.invoice.status, 'paid');
  assert.equal(paid.body.invoice.balanceDue, 0);
  assert.equal(paid.body.invoice.amountPaid, 2320);
  assert.ok(paid.body.invoice.paidAt);
  assert.equal(paid.body.invoice.paymentHistory.length, 1);

  const overdue = await api('PATCH', `/api/invoices/${invoiceId}/mark-overdue`, { token: adminToken });
  assert.equal(overdue.status, 400);

  const past = await api('POST', '/api/invoices', {
    token: adminToken, body: { customerName: 'Late', customerEmail: 'l@example.com', planName: 'Chui', planPrice: 500, dueDate: '2020-01-01' }
  });
  assert.equal(past.body.invoice.status, 'overdue');

  const badStatus = await api('PATCH', `/api/invoices/${invoiceId}/status`, { token: adminToken, body: { status: 'bogus' } });
  assert.equal(badStatus.status, 400);
});

test('invoices: stats, revenue report, date range, CSV export', async () => {
  const stats = await api('GET', '/api/invoices/stats/summary', { token: adminToken });
  assert.equal(stats.status, 200);
  assert.equal(stats.body.stats.totalPaid, 1);
  assert.equal(stats.body.stats.totalRevenue, 2320);

  const rev = await api('GET', '/api/invoices/reports/revenue?period=daily', { token: adminToken });
  assert.equal(rev.status, 200);
  assert.equal(rev.body.revenueData.length, 1);

  const today = new Date().toISOString().slice(0, 10);
  const range = await api('GET', `/api/invoices/date-range/${today}/${today}`, { token: adminToken });
  assert.ok(range.body.total >= 8);
  assert.equal((await api('GET', '/api/invoices/date-range/foo/bar', { token: adminToken })).status, 400);

  const csv = await api('GET', '/api/invoices/export/excel', { token: adminToken, raw: true });
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  const text = await csv.text();
  assert.match(text, /INV-0001/);
});

test('invoices: send without email configured fails cleanly', async () => {
  const res = await api('POST', '/api/invoices/draft-1/send-with-pdf', {
    token: adminToken, body: { customerEmail: 'a@b.co', pdfData: Buffer.from('%PDF-1.4 test').toString('base64') }
  });
  assert.equal(res.status, 502);
  const bad = await api('POST', '/api/invoices/draft-1/send-with-pdf', {
    token: adminToken, body: { customerEmail: 'a@b.co', pdfData: 'aGVsbG8=' }
  });
  assert.equal(bad.status, 400);
});

let receiptId;

test('receipts: create, numbering, totals, status', async () => {
  const body = {
    customerName: 'Jane', customerEmail: 'jane@example.com', customerPhone: '0711',
    items: [{ description: 'Monthly', quantity: 1, unitPrice: 2000, amount: 2000 }],
    taxRate: 16, total: 2320, amountPaid: 2320, paymentMethod: 'mobile_money'
  };
  const a = await api('POST', '/api/receipts', { token: adminToken, body });
  assert.equal(a.status, 201, JSON.stringify(a.body));
  receiptId = a.body.receipt._id;
  assert.equal(a.body.receipt.receiptNumber, 'RCP-001');
  assert.equal(a.body.receipt.total, 2320);
  assert.equal(a.body.receipt.status, 'paid');
  assert.equal(a.body.receipt.balance, 0);

  const partial = await api('POST', '/api/receipts', { token: adminToken, body: { ...body, amountPaid: 1000 } });
  assert.equal(partial.body.receipt.receiptNumber, 'RCP-002');
  assert.equal(partial.body.receipt.status, 'issued');
  assert.equal(partial.body.receipt.balance, 1320);

  // No items: the entered total is kept, even after saving again.
  const plain = await api('POST', '/api/receipts', {
    token: adminToken, body: { customerName: 'P', customerEmail: 'p@example.com', total: 750, amountPaid: 750 }
  });
  assert.equal(plain.body.receipt.total, 750);
  const resaved = await api('PATCH', `/api/receipts/${plain.body.receipt._id}/status`, { token: adminToken, body: { status: 'paid' } });
  assert.equal(resaved.body.receipt.total, 750);
});

test('receipts: from invoice, duplicate, refund, list, CSV', async () => {
  const gen = await api('POST', `/api/receipts/generate-from-invoice/${invoiceId}`, { token: adminToken });
  assert.equal(gen.status, 201);
  assert.equal(gen.body.receipt.invoiceNumber, 'INV-0001');
  assert.equal(gen.body.receipt.total, 2320);
  assert.equal(gen.body.receipt.clientAccountNumber, 'FBI-123');

  const dup = await api('POST', `/api/receipts/${receiptId}/duplicate`, { token: adminToken });
  assert.equal(dup.status, 201);
  assert.notEqual(dup.body.receipt.receiptNumber, 'RCP-001');

  const tooMuch = await api('PATCH', `/api/receipts/${receiptId}/refund`, { token: adminToken, body: { refundAmount: 99999 } });
  assert.equal(tooMuch.status, 400);
  const refund = await api('PATCH', `/api/receipts/${receiptId}/refund`, { token: adminToken, body: { refundAmount: 500, reason: 'Downtime' } });
  assert.equal(refund.body.receipt.status, 'refunded');

  const list = await api('GET', '/api/receipts', { token: adminToken });
  assert.ok(list.body.receipts.length >= 5);

  const csv = await api('GET', '/api/receipts/export/excel', { token: adminToken, raw: true });
  assert.match(await csv.text(), /RCP-001/);
});

test('deleting an invoice keeps its receipts', async () => {
  const del = await api('DELETE', `/api/invoices/${invoiceId}`, { token: adminToken });
  assert.equal(del.status, 200);
  const list = await api('GET', '/api/receipts?search=INV-0001', { token: adminToken });
  assert.equal(list.body.receipts.length, 1);
  assert.equal(list.body.receipts[0].invoiceId, null);
});

test('unknown API routes return JSON 404', async () => {
  const res = await api('GET', '/api/nothing-here');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
