import { useState } from 'react';
import api from '../api/client.js';
import { initials, STATUSES, PRIORITIES, priorityMeta } from '../utils/helpers.js';

export default function TicketModal({ ticket, members, onClose, onChange, onDelete }) {
  const [t, setT] = useState(ticket);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const isNew = !t._id;

  const save = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/tickets', {
          title: t.title,
          description: t.description,
          workspace: t.workspace,
          status: t.status,
          priority: t.priority,
          assignees: (t.assignees || []).map((a) => a._id || a),
          tags: t.tags,
        });
        onChange(res.data, 'create');
      } else {
        const res = await api.put(`/tickets/${t._id}`, {
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assignees: (t.assignees || []).map((a) => a._id || a),
          tags: t.tags,
        });
        onChange(res.data, 'update');
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this ticket?')) return;
    await api.delete(`/tickets/${t._id}`);
    onDelete(t._id);
    onClose();
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    const res = await api.post(`/tickets/${t._id}/comments`, { body: comment });
    setT(res.data);
    onChange(res.data, 'update');
    setComment('');
  };

  const toggleAssignee = (id) => {
    const ids = (t.assignees || []).map((a) => a._id || a);
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    setT({ ...t, assignees: members.filter((m) => next.includes(m._id)) });
  };

  const assigneeIds = (t.assignees || []).map((a) => a._id || a);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, width: 620, maxHeight: '88vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{isNew ? 'New Ticket' : 'Edit Ticket'}</span>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          <input
            className="input"
            style={{ fontSize: 18, fontWeight: 600, marginBottom: 18, border: 'none', padding: '4px 0' }}
            placeholder="Ticket title"
            value={t.title}
            onChange={(e) => setT({ ...t, title: e.target.value })}
            autoFocus
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div>
              <label className="label">Status</label>
              <select className="input" value={t.status} onChange={(e) => setT({ ...t, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={t.priority} onChange={(e) => setT({ ...t, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="label">Assignees</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {members.map((m) => {
                const active = assigneeIds.includes(m._id);
                return (
                  <button
                    key={m._id}
                    onClick={() => toggleAssignee(m._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`, background: active ? '#eef2ff' : 'var(--surface)' }}
                  >
                    <span className="avatar" style={{ width: 20, height: 20, fontSize: 10, background: m.avatarColor }}>{initials(m.name)}</span>
                    <span style={{ fontSize: 12 }}>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="label">Description</label>
            <textarea className="input" rows={4} value={t.description || ''} onChange={(e) => setT({ ...t, description: e.target.value })} placeholder="Add details..." />
          </div>

          {!isNew && (
            <div style={{ marginBottom: 18 }}>
              <label className="label">Comments ({t.comments?.length || 0})</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {(t.comments || []).map((c) => (
                  <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                    <span className="avatar" style={{ width: 26, height: 26, fontSize: 11, background: c.author?.avatarColor }}>{initials(c.author?.name)}</span>
                    <div style={{ background: 'var(--bg)', padding: '8px 12px', borderRadius: 8, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{c.author?.name}</div>
                      <div style={{ fontSize: 13 }}>{c.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} />
                <button className="btn btn-primary" onClick={addComment}>Send</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          {!isNew ? <button className="btn btn-danger" onClick={remove}>Delete</button> : <span />}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving || !t.title}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
