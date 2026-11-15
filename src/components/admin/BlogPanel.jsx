import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, ExternalLink, Star, Eye, EyeOff, Newspaper, ArrowLeft, Save,
  Heading2, Bold, Italic, List, ListOrdered, Quote, Link2, Image as ImageIcon, Loader2
} from 'lucide-react';
import {
  Card, Button, IconButton, Field, Input, Textarea, Select, Toggle, Badge, EmptyState, PageHeader, ImageInput, useConfirm, cx
} from './ui';
import { apiFetch, uploadImage, formatDate } from './api';
import { RichText, readingTime } from '../../utils/richText';

const EMPTY = { title: '', category: 'General', excerpt: '', content: '', imageUrl: '', published: true, featured: false, publishedAt: '' };

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

/** Wraps the selected text (or inserts a placeholder) in the textarea. */
const applyFormat = (textarea, value, setValue, { before, after = '', placeholder = '', line = false }) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  let selected = value.slice(start, end) || placeholder;
  let prefix = before;

  if (line) {
    // Line formats apply to the start of each selected line.
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const block = value.slice(lineStart, end) || placeholder;
    const formatted = block.split('\n').map((l, i) => `${typeof before === 'function' ? before(i) : before}${l}`).join('\n');
    const next = value.slice(0, lineStart) + formatted + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + formatted.length);
    });
    return;
  }

  const next = value.slice(0, start) + prefix + selected + after + value.slice(end);
  setValue(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  });
};

const Editor = ({ initial, categories, onCancel, onSaved, notify }) => {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial, publishedAt: toDateInput(initial?.publishedAt) }));
  const [tab, setTab] = useState('write');
  const [saving, setSaving] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [errors, setErrors] = useState({});
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const original = useRef(JSON.stringify(form));
  const isNew = !initial?._id;

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = JSON.stringify(form) !== original.current;

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const format = (opts) => applyFormat(textRef.current, form.content, set('content'), opts);

  const insertLink = () => {
    const url = window.prompt('Link address (https://...)');
    if (!url) return;
    format({ before: '[', after: `](${url.trim()})`, placeholder: 'link text' });
  };

  const insertImage = async (file) => {
    if (!file) return;
    setInserting(true);
    try {
      const url = await uploadImage(file);
      format({ before: '\n![', after: `](${url})\n`, placeholder: 'image description' });
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setInserting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Add a title';
    if (form.content.trim().length < 50) next.content = `Write at least 50 characters (${form.content.trim().length} so far)`;
    setErrors(next);
    return !Object.keys(next).length;
  };

  const save = async (publishOverride) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        title: form.title,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        imageUrl: form.imageUrl,
        published: publishOverride ?? form.published,
        featured: form.featured,
        ...(form.publishedAt ? { publishedAt: form.publishedAt } : {})
      };
      const data = isNew
        ? await apiFetch('/api/blog', { method: 'POST', body })
        : await apiFetch(`/api/blog/${initial._id}`, { method: 'PUT', body });
      notify(isNew ? 'Post created' : 'Post saved', 'success');
      onSaved(data.data, isNew);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    onCancel();
  };

  const tools = [
    { icon: Heading2, label: 'Heading', run: () => format({ before: '## ', line: true, placeholder: 'Heading' }) },
    { icon: Bold, label: 'Bold', run: () => format({ before: '**', after: '**', placeholder: 'bold text' }) },
    { icon: Italic, label: 'Italic', run: () => format({ before: '*', after: '*', placeholder: 'italic text' }) },
    { icon: List, label: 'Bullet list', run: () => format({ before: '- ', line: true, placeholder: 'List item' }) },
    { icon: ListOrdered, label: 'Numbered list', run: () => format({ before: (i) => `${i + 1}. `, line: true, placeholder: 'List item' }) },
    { icon: Quote, label: 'Quote', run: () => format({ before: '> ', line: true, placeholder: 'Quote' }) },
    { icon: Link2, label: 'Link', run: insertLink }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={cancel} className="inline-flex items-center gap-2 text-[13px] font-semibold text-fg-4 hover:text-fg">
          <ArrowLeft size={16} aria-hidden="true" /> Back to posts
        </button>
        <div className="flex flex-wrap gap-2">
          {form.published ? (
            <>
              <Button variant="secondary" onClick={() => save(false)} disabled={saving}>Save as draft</Button>
              <Button icon={Save} loading={saving} onClick={() => save(true)}>{isNew ? 'Publish' : 'Save & publish'}</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" icon={Save} loading={saving} onClick={() => save(false)}>Save draft</Button>
              <Button onClick={() => save(true)} disabled={saving}>Publish</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="p-5 space-y-5">
          <Field label="Title" error={errors.title}>
            <Input value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Fibre is now live in Kilimani" maxLength={200} className="text-[15px] font-semibold" />
          </Field>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-fg-2">Content</span>
              <div className="flex rounded-md bg-surface-3 p-1 text-[12px] font-medium" role="tablist">
                {['write', 'preview'].map((t) => (
                  <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                    className={cx('rounded-md px-3 py-1 capitalize', tab === t ? 'bg-surface text-fg shadow-sm' : 'text-fg-4')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'write' ? (
              <div className="overflow-hidden rounded-md border border-edge-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                <div className="flex flex-wrap items-center gap-1 border-b border-edge bg-surface-2 px-2 py-1.5">
                  {tools.map((t) => <IconButton key={t.label} icon={t.icon} label={t.label} onClick={t.run} className="h-8 w-8" />)}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => insertImage(e.target.files?.[0])} />
                  <IconButton icon={inserting ? Loader2 : ImageIcon} label="Insert image" onClick={() => fileRef.current?.click()} className={cx('h-8 w-8', inserting && 'animate-spin')} />
                </div>
                <textarea
                  ref={textRef}
                  value={form.content}
                  onChange={(e) => set('content')(e.target.value)}
                  rows={20}
                  placeholder={'Start writing...\n\nTips: "## " starts a heading, "- " a bullet point, **bold**, *italic*.\nLeave an empty line between paragraphs.'}
                  className="block w-full resize-y bg-field px-4 py-3 font-mono text-[13px] leading-relaxed text-fg outline-none"
                />
              </div>
            ) : (
              <div className="min-h-[300px] rounded-md border border-edge bg-surface px-6 py-4 text-fg-2">
                {form.content.trim() ? <RichText content={form.content} /> : <p className="text-fg-5">Nothing to preview yet.</p>}
              </div>
            )}
            <p className={cx('mt-1.5 text-[12px]', errors.content ? 'font-medium text-red-600' : 'text-fg-4')}>
              {errors.content || `${form.content.trim().split(/\s+/).filter(Boolean).length} words · about ${readingTime(form.content)} min read`}
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-5">
            <Toggle checked={form.published} onChange={set('published')} label="Published" description="Drafts are only visible in the dashboard." />
            <Toggle checked={form.featured} onChange={set('featured')} label="Featured" description="Shown large at the top of the blog page." />
            <Field label="Category">
              <Input list="blog-categories" value={form.category} onChange={(e) => set('category')(e.target.value)} maxLength={50} />
              <datalist id="blog-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Publish date" hint="Leave as is to use today.">
              <Input type="date" value={form.publishedAt} onChange={(e) => set('publishedAt')(e.target.value)} />
            </Field>
          </Card>

          <Card className="p-5 space-y-5">
            <ImageInput stacked label="Cover image" value={form.imageUrl} onChange={set('imageUrl')} onError={(m) => notify(m, 'error')} />
            <Field label="Summary" hint={`${form.excerpt.length}/400 · Shown on blog cards. Left empty, it is taken from the first lines of the post.`}>
              <Textarea rows={4} value={form.excerpt} maxLength={400} onChange={(e) => set('excerpt')(e.target.value)} />
            </Field>
          </Card>
        </div>
      </div>
    </div>
  );
};

const BlogPanel = ({ posts, setPosts, notify, startCreating, onCreateHandled }) => {
  const [editing, setEditing] = useState(null); // null | {} (new) | post
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    if (startCreating) {
      setEditing({});
      onCreateHandled?.();
    }
  }, [startCreating, onCreateHandled]);

  const categories = useMemo(() => [...new Set(['General', 'News', 'Guides', 'Coverage', ...posts.map((p) => p.category).filter(Boolean)])], [posts]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts
      .filter((p) => filter === 'all' || (filter === 'drafts' ? p.published === false : p.published !== false))
      .filter((p) => !term || p.title.toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term))
      .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  }, [posts, search, filter]);

  const update = async (post, changes, message) => {
    setBusyId(post._id);
    try {
      const { data } = await apiFetch(`/api/blog/${post._id}`, {
        method: 'PUT',
        body: { title: post.title, content: post.content, category: post.category, excerpt: post.excerpt, imageUrl: post.imageUrl, ...changes }
      });
      setPosts((list) => list.map((p) => (p._id === post._id ? data : p)));
      notify(message, 'success');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (post) => {
    const ok = await confirm({ title: 'Delete post?', message: `"${post.title}" will be removed from the website permanently.` });
    if (!ok) return;
    try {
      await apiFetch(`/api/blog/${post._id}`, { method: 'DELETE' });
      setPosts((list) => list.filter((p) => p._id !== post._id));
      notify('Post deleted', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  if (editing) {
    return (
      <Editor
        key={editing._id || 'new'}
        initial={editing}
        categories={categories}
        notify={notify}
        onCancel={() => setEditing(null)}
        onSaved={(saved, isNew) => {
          setPosts((list) => (isNew ? [saved, ...list] : list.map((p) => (p._id === saved._id ? saved : p))));
          setEditing(null);
        }}
      />
    );
  }

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.published !== false).length,
    drafts: posts.filter((p) => p.published === false).length
  };

  return (
    <div>
      {confirmDialog}
      <PageHeader
        title="Blog"
        subtitle="Write news and guides for the website's blog page."
        actions={<Button icon={Plus} onClick={() => setEditing({})}>New post</Button>}
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-edge p-4  md:flex-row md:items-center md:justify-between">
          <div className="flex gap-1 rounded-md bg-surface-3 p-1 text-[13px] font-medium">
            {['all', 'published', 'drafts'].map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={cx('rounded-md px-3 py-1.5 capitalize', filter === f ? 'bg-surface text-fg shadow-sm' : 'text-fg-4')}>
                {f} <span className="opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-5" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts" className="pl-9" aria-label="Search posts" />
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={posts.length ? 'No posts match' : 'No blog posts yet'}
            message={posts.length ? 'Try a different search or filter.' : 'Share news, coverage updates or tips with your customers.'}
            action={!posts.length && <Button icon={Plus} onClick={() => setEditing({})}>Write the first post</Button>}
          />
        ) : (
          <ul className="divide-y divide-edge">
            {visible.map((post) => (
              <li key={post._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-surface-3">
                  {post.imageUrl ? <img src={post.imageUrl} alt="" className="h-full w-full object-cover" /> : <Newspaper className="m-auto mt-5 text-fg-5" size={22} aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setEditing(post)} className="truncate text-left font-medium text-fg hover:text-brand-text">
                      {post.title}
                    </button>
                    {post.featured && <Star size={14} className="fill-amber-400 text-amber-400" aria-label="Featured" />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-fg-4">
                    <Badge tone={post.published === false ? 'slate' : 'green'}>{post.published === false ? 'Draft' : 'Published'}</Badge>
                    <span>{post.category || 'General'}</span>
                    <span>·</span>
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    {post.author?.name && <><span>·</span><span>{post.author.name}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-center">
                  {busyId === post._id && <Loader2 size={16} className="mr-1 animate-spin text-fg-5" aria-hidden="true" />}
                  <IconButton
                    icon={post.published === false ? Eye : EyeOff}
                    label={post.published === false ? 'Publish' : 'Unpublish'}
                    onClick={() => update(post, { published: post.published === false }, post.published === false ? 'Post published' : 'Post moved to drafts')}
                  />
                  <IconButton icon={Star} label={post.featured ? 'Remove from featured' : 'Feature on blog page'}
                    onClick={() => update(post, { featured: !post.featured }, post.featured ? 'No longer featured' : 'Post featured')} />
                  {post.published !== false && (
                    <IconButton icon={ExternalLink} label="View on website" onClick={() => window.open(`/blog/${post.slug}`, '_blank', 'noopener')} />
                  )}
                  <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(post)} />
                  <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(post)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default BlogPanel;
