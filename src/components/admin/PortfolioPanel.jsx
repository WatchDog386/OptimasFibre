import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Images } from 'lucide-react';
import { Card, Button, IconButton, Field, Input, Textarea, Modal, EmptyState, PageHeader, ImageInput, useConfirm } from './ui';
import { apiFetch } from './api';

const EMPTY = { title: '', category: 'General', description: '', imageUrl: '' };

const PortfolioPanel = ({ items, setItems, notify }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const open = (item) => {
    setEditing(item || {});
    setForm(item ? { title: item.title, category: item.category, description: item.description, imageUrl: item.imageUrl } : EMPTY);
  };

  const save = async () => {
    if (!form.title.trim() || form.description.trim().length < 10) {
      notify('Add a title and a description of at least 10 characters.', 'warning');
      return;
    }
    if (!form.imageUrl) {
      notify('Add an image for this project.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const isNew = !editing._id;
      const { data } = await apiFetch(isNew ? '/api/portfolio' : `/api/portfolio/${editing._id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: form
      });
      setItems((list) => (isNew ? [data, ...list] : list.map((i) => (i._id === data._id ? data : i))));
      notify(isNew ? 'Project added' : 'Project saved', 'success');
      setEditing(null);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const ok = await confirm({ title: 'Delete project?', message: `"${item.title}" will be removed from the website.` });
    if (!ok) return;
    try {
      await apiFetch(`/api/portfolio/${item._id}`, { method: 'DELETE' });
      setItems((list) => list.filter((i) => i._id !== item._id));
      notify('Project deleted', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      {confirmDialog}
      <PageHeader
        title="Portfolio"
        subtitle="Installations and projects to showcase on the website."
        actions={<Button icon={Plus} onClick={() => open(null)}>Add project</Button>}
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={Images} title="No projects yet" message="Add photos of installations and network work."
            action={<Button icon={Plus} onClick={() => open(null)}>Add the first project</Button>} />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item._id} className="group overflow-hidden">
              <div className="relative aspect-[16/10] bg-surface-3">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />}
                <div className="absolute right-2 top-2 flex gap-1 rounded-md bg-surface p-1 shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <IconButton icon={Pencil} label="Edit" onClick={() => open(item)} className="h-8 w-8" />
                  <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(item)} className="h-8 w-8" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-[12px] font-medium uppercase tracking-wider text-brand">{item.category}</p>
                <h3 className="mt-1 text-base font-medium text-fg">{item.title}</h3>
                <p className="mt-1 text-[13px] text-fg-4 line-clamp-2">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?._id ? 'Edit project' : 'Add project'}
        onClose={() => setEditing(null)}
        size="lg"
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button loading={saving} onClick={save}>Save project</Button></>}
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={form.title} maxLength={150} onChange={(e) => set('title')(e.target.value)} /></Field>
            <Field label="Category"><Input value={form.category} maxLength={50} onChange={(e) => set('category')(e.target.value)} /></Field>
          </div>
          <Field label="Description"><Textarea rows={4} value={form.description} onChange={(e) => set('description')(e.target.value)} /></Field>
          <ImageInput value={form.imageUrl} onChange={set('imageUrl')} onError={(m) => notify(m, 'error')} />
        </div>
      </Modal>
    </div>
  );
};

export default PortfolioPanel;
