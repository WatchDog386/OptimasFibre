import React, { useEffect, useRef, useState } from 'react';
import { Save, KeyRound, Camera, Loader2 } from 'lucide-react';
import { Card, CardHeader, Button, Field, Input, PageHeader, Badge } from './ui';
import { apiFetch, uploadImage, formatDate } from './api';

const ProfilePanel = ({ me, setMe, notify }) => {
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', profileImage: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (me) setForm({ name: me.name || '', username: me.username || '', email: me.email || '', phone: me.phone || '', profileImage: me.profileImage || '' });
  }, [me]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const saveProfile = async (overrides = {}) => {
    setSaving(true);
    try {
      const { user } = await apiFetch('/api/auth/update-profile', { method: 'PUT', body: { ...form, ...overrides } });
      setMe(user);
      notify('Profile updated', 'success');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, profileImage: url }));
      await saveProfile({ profileImage: url });
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return notify('New password must be at least 8 characters', 'warning');
    if (pw.newPassword !== pw.confirm) return notify('The new passwords do not match', 'warning');
    setChanging(true);
    try {
      await apiFetch('/api/auth/change-password', { method: 'PUT', body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      notify('Password changed', 'success');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setChanging(false);
    }
  };

  if (!me) return null;
  const initial = (me.displayName || me.username || '?')[0].toUpperCase();

  return (
    <div>
      <PageHeader title="My profile" subtitle="Your details and password." />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="flex flex-col items-center p-6 text-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-brand text-4xl font-semibold text-white ring-4 ring-surface shadow">
              {form.profileImage ? <img src={form.profileImage} alt="" className="h-full w-full object-cover" /> : initial}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => changePhoto(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Change photo"
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow hover:bg-brand-strong">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
          </div>
          <h2 className="mt-4 text-[18px] font-semibold text-fg">{me.displayName}</h2>
          {me.username && <p className="font-mono text-[13px] text-fg-4">@{me.username}</p>}
          <div className="mt-3"><Badge tone="blue">{me.role === 'admin' ? 'Administrator' : 'User'}</Badge></div>
          <p className="mt-4 text-[12px] text-fg-4">Member since {formatDate(me.createdAt)}</p>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Details" action={<Button icon={Save} size="sm" loading={saving} onClick={() => saveProfile()}>Save</Button>} />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Display name"><Input value={form.name} onChange={set('name')} maxLength={120} /></Field>
              <Field label="Username" hint="Used to sign in."><Input value={form.username} onChange={set('username')} autoCapitalize="none" /></Field>
              <Field label="Email" hint="Needed for password-reset emails."><Input type="email" value={form.email} onChange={set('email')} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={set('phone')} /></Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Change password" />
            <form className="grid gap-4 p-5 sm:grid-cols-3" onSubmit={changePassword}>
              <Field label="Current password"><Input type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} required /></Field>
              <Field label="New password"><Input type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} required /></Field>
              <Field label="Repeat new password"><Input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} required /></Field>
              <div className="sm:col-span-3"><Button type="submit" icon={KeyRound} loading={changing}>Change password</Button></div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
