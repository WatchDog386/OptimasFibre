// Where the frontend sends API requests.
// - VITE_API_BASE_URL, when set at build time, wins (e.g. a separate API domain).
// - In development (`npm run dev`) the backend runs on http://localhost:10000.
// - Otherwise the API is on the same domain as the site (Nginx forwards /api to the backend).
const configured = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

export const API_BASE_URL = configured || (import.meta.env.DEV ? 'http://localhost:10000' : '');

export default API_BASE_URL;
