// Shared model helpers
import { DataTypes, Op } from 'sequelize';
import slugify from 'slugify';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

/** Primary key column. The API also exposes it as `_id` so the existing frontend keeps working. */
export const idColumn = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  }
};

/** Money column: stored as exact NUMERIC, returned to JS (and JSON) as a Number. */
export const money = (name, options = {}) => ({
  type: DataTypes.DECIMAL(14, 2),
  allowNull: false,
  defaultValue: 0,
  get() {
    const value = this.getDataValue(name);
    return value === null || value === undefined ? value : Number(value);
  },
  ...options
});

export const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const round2 = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

/** Adds `_id` to a plain object and strips anything listed in `hidden`. */
export const serialize = (instance, hidden = []) => {
  const values = { ...instance.get({ plain: true }) };
  values._id = values.id;
  for (const key of hidden) delete values[key];
  return values;
};

/** Image fields accept an http(s) URL, a site-relative path, or an inline data: image. */
export const isImageReference = (value) => {
  if (!value) return true;
  return /^(https?:\/\/|\/|data:image\/)/i.test(value);
};

/** Normalises line items and fills in a missing amount as quantity × unit price. */
export const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const quantity = Math.max(1, toNumber(item.quantity, 1));
      const unitPrice = Math.max(0, toNumber(item.unitPrice, 0));
      const hasAmount = item.amount !== undefined && item.amount !== null && item.amount !== '' && Number.isFinite(Number(item.amount));
      return {
        description: String(item.description ?? '').trim().slice(0, 200) || 'Service',
        quantity,
        unitPrice,
        amount: round2(hasAmount ? Math.max(0, Number(item.amount)) : quantity * unitPrice)
      };
    });
};

export const discountAmountFor = (subtotal, discount, discountType) => {
  if (discountType === 'percentage') return (toNumber(subtotal) * toNumber(discount)) / 100;
  if (discountType === 'fixed') return toNumber(discount);
  return 0;
};

/** Builds a slug that is unique within `Model`, appending -1, -2… when needed. */
export const uniqueSlug = async (Model, title, fallbackPrefix, excludeId) => {
  const base = slugify(String(title || ''), { lower: true, strict: true, trim: true }) || `${fallbackPrefix}-${Date.now()}`;
  let slug = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.count({ where: { slug, ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}) } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

/**
 * Next sequential document number such as INV-0007 or RCP-012.
 * Uses the highest existing number rather than the most recently created row.
 */
export const nextDocumentNumber = async (Model, column, prefix, width) => {
  const [rows] = await Model.sequelize.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING("${column}" FROM '^${prefix}-([0-9]{1,9})$') AS INTEGER)), 0) AS max FROM "${Model.getTableName()}"`
  );
  const next = Number(rows[0]?.max || 0) + 1;
  return `${prefix}-${String(next).padStart(width, '0')}`;
};
