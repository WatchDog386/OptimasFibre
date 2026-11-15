// Helpers for turning request query strings into safe Sequelize options.
import { Op } from 'sequelize';
import { likePattern } from './format.js';
import { toNumber } from '../models/helpers.js';

const MAX_LIMIT = 1000;

/** `limit` defaults to everything (capped) because the dashboard loads full lists in one request. */
export const parsePagination = (query) => {
  const page = Math.max(1, Math.floor(toNumber(query.page, 1)));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(toNumber(query.limit, MAX_LIMIT))));
  return { page, limit, offset: (page - 1) * limit };
};

/** Only whitelisted columns can be sorted on. */
export const parseSort = (query, allowed, fallback = 'createdAt') => {
  const column = allowed.includes(query.sortBy) ? query.sortBy : fallback;
  const direction = String(query.sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return [[column, direction]];
};

/** Case-insensitive "contains" match of one term across several text columns. */
export const searchWhere = (term, columns) => {
  const text = typeof term === 'string' ? term.trim() : '';
  if (!text) return {};
  const pattern = likePattern(text.slice(0, 100));
  return { [Op.or]: columns.map((column) => ({ [column]: { [Op.iLike]: pattern } })) };
};

export const paginationMeta = (page, limit, total) => ({
  current: page,
  pages: Math.max(1, Math.ceil(total / limit)),
  total
});

/** Parses a date from user input; returns undefined when it is missing or invalid. */
export const parseDate = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

/**
 * Copies only the allowed keys from a request body, coercing numbers and dates.
 * Unknown keys (ids, audit fields, anything the client should not set) are dropped.
 */
export const pickFields = (body, { text = [], numbers = [], dates = [], json = [], booleans = [] }) => {
  const source = body && typeof body === 'object' ? body : {};
  const result = {};
  for (const key of text) {
    if (source[key] !== undefined && source[key] !== null) result[key] = String(source[key]);
  }
  for (const key of numbers) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') result[key] = toNumber(source[key], 0);
  }
  for (const key of dates) {
    const date = parseDate(source[key]);
    if (date) result[key] = date;
  }
  for (const key of json) {
    if (source[key] !== undefined && source[key] !== null && typeof source[key] === 'object') result[key] = source[key];
  }
  for (const key of booleans) {
    if (typeof source[key] === 'boolean') result[key] = source[key];
  }
  return result;
};

/** "Mobile Money" → "mobile_money", so older clients and free-typed values still validate. */
export const normalizeEnum = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase().replace(/[\s-]+/g, '_') : value;
