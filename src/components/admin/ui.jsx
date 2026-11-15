// Small UI kit for the admin dashboard (Tailwind, light + dark).
import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, Upload, AlertTriangle } from 'lucide-react';
import { uploadImage } from './api';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const Card = ({ className, children, ...props }) => (
  <div
    className={cx('rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700">
    <div>
      <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const BUTTON_VARIANTS = {
  primary: 'bg-[#00356B] text-white hover:bg-[#002244] focus-visible:ring-[#00356B]/40',
  accent: 'bg-[#D85C2C] text-white hover:bg-[#b84520] focus-visible:ring-[#D85C2C]/40',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40'
};

export const Button = ({ variant = 'primary', size = 'md', loading = false, icon: Icon, className, children, disabled, type = 'button', ...props }) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
      BUTTON_VARIANTS[variant],
      className
    )}
    {...props}
  >
    {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : Icon && <Icon size={16} aria-hidden="true" />}
    {children}
  </button>
);

export const IconButton = ({ icon: Icon, label, className, tone = 'default', ...props }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={cx(
      'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00356B]/40',
      tone === 'danger'
        ? 'text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30'
        : 'text-slate-500 hover:bg-slate-100 hover:text-[#00356B] dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white',
      className
    )}
    {...props}
  >
    <Icon size={17} aria-hidden="true" />
  </button>
);

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00356B] focus:ring-2 focus:ring-[#00356B]/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500';

export const Field = ({ label, hint, error, children, className }) => (
  <label className={cx('block', className)}>
    {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>}
    {children}
    {error ? (
      <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
    ) : hint ? (
      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>
    ) : null}
  </label>
);

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cx(fieldClass, className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cx(fieldClass, 'leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = ({ className, children, ...props }) => (
  <select className={cx(fieldClass, 'pr-8', className)} {...props}>{children}</select>
);

export const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00356B]/30',
        checked ? 'bg-[#00356B]' : 'bg-slate-300 dark:bg-slate-600'
      )}
    >
      <span className={cx('inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  </div>
);

const BADGE_TONES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300'
};

export const Badge = ({ tone = 'slate', children }) => (
  <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', BADGE_TONES[tone])}>
    {children}
  </span>
);

export const STATUS_TONES = {
  paid: 'green', completed: 'green', published: 'green', issued: 'blue',
  pending: 'amber', partially_paid: 'amber', draft: 'slate',
  overdue: 'red', cancelled: 'red', refunded: 'red'
};

export const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_TONES[status] || 'slate'}>{String(status || 'unknown').replace(/_/g, ' ')}</Badge>
);

export const Modal = ({ open, title, onClose, children, footer, size = 'md' }) => {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('input, textarea, select, button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx('flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-slate-800 sm:rounded-2xl', size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-700">{footer}</div>}
      </div>
    </div>
  );
};

/** Promise-style confirmation dialog: const ok = await confirm({ ... }) */
export const useConfirm = () => {
  const [state, setState] = useState(null);
  const confirm = (options) => new Promise((resolve) => setState({ ...options, resolve }));
  const close = (value) => {
    state?.resolve(value);
    setState(null);
  };
  const dialog = (
    <Modal
      open={Boolean(state)}
      title={state?.title || 'Are you sure?'}
      onClose={() => close(false)}
      footer={(
        <>
          <Button variant="secondary" onClick={() => close(false)}>Cancel</Button>
          <Button variant={state?.danger === false ? 'primary' : 'danger'} onClick={() => close(true)}>
            {state?.confirmLabel || 'Delete'}
          </Button>
        </>
      )}
    >
      <div className="flex gap-3">
        {state?.danger !== false && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
            <AlertTriangle size={20} className="text-red-600" aria-hidden="true" />
          </div>
        )}
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{state?.message}</p>
      </div>
    </Modal>
  );
  return [confirm, dialog];
};

export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center px-6 py-14 text-center">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
        <Icon size={26} className="text-slate-400" aria-hidden="true" />
      </div>
    )}
    <p className="font-bold text-slate-800 dark:text-slate-100">{title}</p>
    {message && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Spinner = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500 dark:text-slate-400" role="status">
    <Loader2 size={20} className="animate-spin" aria-hidden="true" /> {label}
  </div>
);

/** Image picker: paste a URL or upload a file; shows a preview. */
export const ImageInput = ({ value, onChange, onError, label = 'Image', hint, stacked = false }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (error) {
      onError?.(error.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Field label={label} hint={hint || 'Upload a JPG, PNG or WebP (max 5 MB), or paste an image link.'}>
      <div className={cx('flex flex-col gap-3', !stacked && 'sm:flex-row sm:items-start')}>
        <div className={cx('flex w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900', stacked ? 'h-40' : 'h-28 sm:w-44')}>
          {value ? (
            <img src={value} alt="" className={cx('h-full w-full', stacked ? 'object-contain p-2' : 'object-cover')} />
          ) : (
            <span className="text-xs text-slate-400">No image</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://... or upload" />
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <Button variant="secondary" size="sm" icon={Upload} loading={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading...' : 'Upload image'}
            </Button>
            {value && <Button variant="ghost" size="sm" onClick={() => onChange('')}>Remove</Button>}
          </div>
        </div>
      </div>
    </Field>
  );
};

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);
