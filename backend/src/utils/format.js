// Small formatting helpers shared by PDFs, emails and exports.

export const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const formatPrice = (price) => {
  const num = parseFloat(price);
  return Number.isFinite(num)
    ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';
};

export const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi' });
};

/** One CSV cell: quoted, with quotes doubled, and spreadsheet formulas neutralised. */
export const csvCell = (value) => {
  let text = value === null || value === undefined ? '' : String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export const toCsv = (headers, rows) =>
  [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');

/** Escapes %, _ and \ so user input is matched literally inside an ILIKE pattern. */
export const likePattern = (term) => `%${String(term).replace(/[\\%_]/g, '\\$&')}%`;

/** Accepts a base64 string (optionally a data: URL) and returns a PDF buffer, or null if it is not a PDF. */
export const pdfBufferFromBase64 = (data) => {
  if (typeof data !== 'string') return null;
  const buffer = Buffer.from(data.replace(/^data:application\/pdf;[^,]*,/, ''), 'base64');
  return buffer.length > 4 && buffer.subarray(0, 4).toString() === '%PDF' ? buffer : null;
};
