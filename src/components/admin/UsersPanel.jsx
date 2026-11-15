import React, { useEffect, useState } from 'react';
import { Plus, KeyRound, Pencil, Trash2, Users, ShieldCheck } from 'lucide-react';
import { Card, Button, IconButton, Field, Input, Select, Modal, Badge, EmptyState, PageHeader, Spinner, useConfirm } from './ui';
import { apiFetch, formatDate } from './api';

const EMPTY = { username: '', name: '', email: '', phone: '', password: '', role: 'admin' };

const UsersPanel = ({ me, notify }) => {
  const [users, setUsers] = useState(null);
  const [mode, setMode] = useState(null); // 'create' | 'edit' | 'password'
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const load = async () => {
    try {
      const data = await apiFetch('/api/users');
      setUsers(data.users);
    } catch (error) {
      notify(error.message, 'error');
      setUsers([]);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (nextMode, user = null) => {
    setMode(nextMode);
    setTarget(user);
    setForm(user ? { ...EMPTY, username: user.username, name: user.name, email: user.email, phone: user.phone, role: user.role } : EMPTY);
  };
  const close = () => setMode(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      if (mode === 'create') {
        if (!form.username.trim() && !form.email.trim()) throw new Error('Enter a username or an email');
        if (form.password.length < 8) throw new Error('Password must be at least 8 characters');
        const { user } = await apiFetch('/api/users', { method: 'POST', body: form });
        setUsers((list) => [...list, user]);
        notify(`Account created for ${user.name || user.username || user.email}`, 'success');
      } else if (mode === 'password') {
        if (form.password.length < 8) throw new Error('Password must be at least 8 characters');
        await apiFetch(`/api/users/${target.id}`, { method: 'PUT', body: { password: form.password } });
        notify(`Password changed for ${target.name || target.username}`, 'success');
      } else {
        const { user } = await apiFetch(`/api/users/${target.id}`, {
          method: 'PUT',
          body: { username: form.username, name: form.name, email: form.email, phone: form.phone, ...(target.id !== me?.id ? { role: form.role } : {}) }
        });
        setUsers((list) => list.map((u) => (u.id === user.id ? user : u)));
        notify('Account updated', 'success');
      }
      close();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user) => {
    const ok = await confirm({ title: 'Delete account?', message: `${user.name || user.username || user.email} will no longer be able to sign in.` });
    if (!ok) return;
    try {
      await apiFetch(`/api/users/${user.id}`, { method: 'DELETE' });
      setUsers((list) => list.filter((u) => u.id !== user.id));
      notify('Account deleted', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const titles = { create: 'Add account', edit: 'Edit account', password: `New password for ${target?.name || target?.username || ''}` };

  return (
    <div>
      {confirmDialog}
      <PageHeader
        title="Team"
        subtitle="People who can sign in to this dashboard."
        actions={<Button icon={Plus} onClick={() => open('create')}>Add account</Button>}
      />
      <Card>
        {users === null ? <Spinner /> : users.length === 0 ? (
          <EmptyState icon={Users} title="No accounts" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-edge text-[12px] text-fg-4 ">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Sign-in</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Added</th>
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-[13px] font-medium text-white">
                          {user.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : (user.displayName || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-fg">
                            {user.displayName}{user.id === me?.id && <span className="ml-2 text-[12px] font-normal text-fg-5">(you)</span>}
                          </p>
                          {user.phone && <p className="text-[12px] text-fg-4">{user.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-fg-3">
                      {user.username && <p className="font-mono">{user.username}</p>}
                      {user.email && <p className="text-[12px] text-fg-4">{user.email}</p>}
                    </td>
                    <td className="px-5 py-3">
                      {user.role === 'admin'
                        ? <Badge tone="blue"><ShieldCheck size={12} className="mr-1" aria-hidden="true" />Admin</Badge>
                        : <Badge>User</Badge>}
                    </td>
                    <td className="hidden px-5 py-3 text-fg-4 md:table-cell">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <IconButton icon={KeyRound} label="Set new password" onClick={() => open('password', user)} />
                        <IconButton icon={Pencil} label="Edit" onClick={() => open('edit', user)} />
                        {user.id !== me?.id && <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(user)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(mode)}
        title={titles[mode]}
        onClose={close}
        footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button loading={saving} onClick={save}>Save</Button></>}
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
          {mode !== 'password' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Username" hint="Used to sign in. Not case-sensitive."><Input value={form.username} onChange={set('username')} autoComplete="off" autoCapitalize="none" /></Field>
                <Field label="Display name"><Input value={form.name} onChange={set('name')} /></Field>
              </div>
              <Field label="Email (optional)" hint="Needed for 'Forgot password' emails."><Input type="email" value={form.email} onChange={set('email')} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone (optional)"><Input value={form.phone} onChange={set('phone')} /></Field>
                <Field label="Role">
                  <Select value={form.role} onChange={set('role')} disabled={mode === 'edit' && target?.id === me?.id}>
                    <option value="admin">Admin — full dashboard access</option>
                    <option value="user">User — cannot use the dashboard</option>
                  </Select>
                </Field>
              </div>
            </>
          )}
          {mode !== 'edit' && (
            <Field label={mode === 'create' ? 'Password' : 'New password'} hint="At least 8 characters.">
              <Input type="text" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </Field>
          )}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
    </div>
  );
};

export default UsersPanel;
