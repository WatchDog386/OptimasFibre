// API helper for the admin dashboard: adds the login token, refreshes an expired
// session once, and turns error responses into readable messages.
import { API_BASE_URL } from '../../config/api';

export class ApiError extends Error {}

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

let refreshing = null;

/** Exchanges the refresh token for a new access token. Resolves true on success. */
export const refreshSession = () => {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => { refreshing = null; });
  return refreshing;
};

const send = (path, { method, body, form, signal }) => {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  return fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload, signal });
};

export const apiFetch = async (path, { method = 'GET', body, form, signal } = {}) => {
  let res;
  try {
    res = await send(path, { method, body, form, signal });
    if (res.status === 401 && (await refreshSession())) {
      res = await send(path, { method, body, form, signal });
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the server. Check your internet connection and try again.');
  }

  if (res.status === 401) {
    clearSession();
    window.location.assign('/admin/login');
    throw new ApiError('Your session has ended. Please sign in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || `Request failed (${res.status})`);
  return data;
};

/** Uploads an image file and returns its public URL (e.g. /uploads/images/...). */
export const uploadImage = async (file) => {
  if (!file) throw new ApiError('Choose an image first');
  if (file.size > 5 * 1024 * 1024) throw new ApiError('Image is too large (maximum 5 MB)');
  const form = new FormData();
  form.append('image', file);
  const data = await apiFetch('/api/uploads/image', { method: 'POST', form });
  return data.url;
};

export const formatKsh = (value) =>
  `Ksh ${Number(value || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

export const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  value ? new Date(value).toLocaleDateString('en-GB', options) : '—';
