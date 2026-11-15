// UI kit for the admin dashboard, matching the Optimas SME system:
// flat white panels with thin borders, Figtree type, Safaricom-green actions.
// Colours are theme tokens (see .ui-sme in index.css), so light/dark switch automatically.
import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, Upload, AlertTriangle } from 'lucide-react';
import { uploadImage } from './api';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const Card = ({ className, children, ...props }) => (
  <div className={cx('rounded-md border border-edge bg-surface', className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge px-5 py-3.5">
    <div className="min-w-0">
      <h3 className="text-[14px] font-medium leading-snug text-fg">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[12.5px] text-fg-4">{subtitle}</p>}
    </div>
    {action && <div className="text-[12.5px] font-medium text-brand">{action}</div>}
  </div>
);

const BUTTON_VARIANTS = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-strong',
  secondary: 'border border-edge bg-surface text-fg-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand-text',
  ghost: 'text-fg-3 hover:bg-surface-2 hover:text-fg',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

export const Button = ({ variant = 'primary', size = 'md', loading = false, icon: Icon, className, children, disabled, type = 'button', ...props }) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cx(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
      size === 'sm' ? 'h-8 px-3 text-[12.5px]' : 'h-9 px-4 text-[13px]',
      BUTTON_VARIANTS[variant],
      className
    )}
    {...props}
  >
    {loading
      ? <Loader2 size={15} className="animate-spin" aria-hidden="true" />
      : Icon && <Icon size={15} strokeWidth={2} aria-hidden="true" />}
    {children}
  </button>
);

export const IconButton = ({ icon: Icon, label, className, tone = 'default', ...props }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={cx(
      'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
      tone === 'danger' ? 'text-fg-4 hover:bg-red-50 hover:text-red-600' : 'text-fg-4 hover:bg-surface-2 hover:text-fg',
      className
    )}
    {...props}
  >
    <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
  </button>
);

const fieldClass = 'w-full rounded-md border border-edge-2 bg-field px-3 py-2 text-[13.5px] text-fg placeholder-fg-5 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

export const Field = ({ label, hint, error, children, className }) => (
  <label className={cx('block', className)}>
    {label && <span className="mb-1.5 block text-[12.5px] font-medium text-fg-2">{label}</span>}
    {children}
    {error ? (
      <span className="mt-1 block text-[12px] font-medium text-red-600">{error}</span>
    ) : hint ? (
      <span className="mt-1 block text-[12px] text-fg-4">{hint}</span>
    ) : null}
  </label>
);

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cx(fieldClass, 'h-9', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cx(fieldClass, 'leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = ({ className, children, ...props }) => (
  <select className={cx(fieldClass, 'h-9 pr-8', className)} {...props}>{children}</select>
);

/** Switch styled like the SME "Light / Dark" toggle. */
export const Switch = ({ checked, onChange, label, srLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={srLabel || label}
    onClick={() => onChange(!checked)}
    className="inline-flex items-center gap-2 text-[13px] font-medium text-brand focus:outline-none"
  >
    <span className={cx('relative h-5 w-9 rounded-full transition-colors', checked ? 'bg-brand' : 'bg-edge-2')}>
      <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left]', checked ? 'left-[18px]' : 'left-0.5')} />
    </span>
    {label}
  </button>
);

export const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[13.5px] font-medium text-fg">{label}</p>
      {description && <p className="text-[12px] text-fg-4">{description}</p>}
    </div>
    <Switch checked={checked} onChange={onChange} srLabel={label} />
  </div>
);

const BADGE_TONES = {
  green: 'bg-emerald-50 text-emerald-700 [.dark_&]:bg-emerald-950 [.dark_&]:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 [.dark_&]:bg-amber-950 [.dark_&]:text-amber-300',
  red: 'bg-red-50 text-red-700 [.dark_&]:bg-red-950 [.dark_&]:text-red-300',
  blue: 'bg-blue-50 text-blue-700 [.dark_&]:bg-blue-950 [.dark_&]:text-blue-300',
  slate: 'bg-surface-3 text-fg-2'
};

export const Badge = ({ tone = 'slate', children }) => (
  <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium', BADGE_TONES[tone])}>
    {children}
  </span>
);

export const STATUS_TONES = {
  paid: 'green', completed: 'green', published: 'green', issued: 'blue',
  pending: 'amber', partially_paid: 'amber', draft: 'slate',
  overdue: 'red', cancelled: 'red', refunded: 'red'
};

export const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_TONES[status] || 'slate'}>
    <span className="capitalize">{String(status || 'unknown').replace(/_/g, ' ')}</span>
  </Badge>
);

export const Modal = ({ open, title, onClose, children, footer, size = 'md' }) => {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('input, textarea, select')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx('flex max-h-[92vh] w-full flex-col rounded-t-xl border border-edge bg-surface shadow-xl sm:rounded-md', size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        <div className="flex items-center justify-between border-b border-edge px-5 py-3">
          <h2 className="text-[15px] font-medium text-fg">{title}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-edge px-5 py-3">{footer}</div>}
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
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={18} className="text-red-600" aria-hidden="true" />
          </div>
        )}
        <p className="text-[13.5px] leading-relaxed text-fg-3">{state?.message}</p>
      </div>
    </Modal>
  );
  return [confirm, dialog];
};

export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    {Icon && <Icon size={30} strokeWidth={1.5} className="mb-3 text-fg-5" aria-hidden="true" />}
    <p className="text-[14px] font-medium text-fg-2">{title}</p>
    {message && <p className="mt-1 max-w-sm text-[12.5px] text-fg-4">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Spinner = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-[13px] text-fg-4" role="status">
    <Loader2 size={18} className="animate-spin text-brand" aria-hidden="true" /> {label}
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
        <div className={cx('flex w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-edge-2 bg-surface-2', stacked ? 'h-40' : 'h-28 sm:w-44')}>
          {value ? (
            <img src={value} alt="" className={cx('h-full w-full', stacked ? 'object-contain p-2' : 'object-cover')} />
          ) : (
            <span className="text-[12px] text-fg-5">No image</span>
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

/** Page title row, like the SME "Command Center" heading. */
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-[26px] font-normal leading-tight tracking-tight text-fg md:text-[28px]">{title}</h1>
      {subtitle && <p className="mt-1 text-[13px] text-fg-4">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);
