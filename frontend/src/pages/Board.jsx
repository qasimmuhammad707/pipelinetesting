import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import TicketModal from '../components/TicketModal.jsx';
import { initials, STATUSES, priorityMeta } from '../utils/helpers.js';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');
  const [dragId, setDragId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [ws, tk] = await Promise.all([
      api.get(`/workspaces/${id}`),
      api.get(`/tickets?workspace=${id}`),
    ]);
    setWorkspace(ws.data);
    setTickets(tk.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (ticket, mode) => {
    if (mode === 'create') setTickets((prev) => [...prev, ticket]);
    else setTickets((prev) => prev.map((t) => (t._id === ticket._id ? ticket : t)));
  };

  const handleDelete = (ticketId) => {
    setTickets((prev) => prev.filter((t) => t._id !== ticketId));
  };

  const onDrop = async (status) => {
    if (!dragId) return;
    const ticket = tickets.find((t) => t._id === dragId);
    if (ticket && ticket.status !== status) {
      setTickets((prev) => prev.map((t) => (t._id === dragId ? { ...t, status } : t)));
      const res = await api.put(`/tickets/${dragId}`, { status });
      setTickets((prev) => prev.map((t) => (t._id === dragId ? res.data : t)));
    }
    setDragId(null);
  };

  const filtered = tickets.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" />
      </div>
    );

  return (
    <div style={{ padding: '24px 32px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ padding: '4px 8px' }}>←</button>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: workspace?.color }} />
          <h1 style={{ fontSize: 22 }}>{workspace?.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input className="input" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
          <button className="btn btn-primary" onClick={() => setActive({ workspace: id, status: 'todo', priority: 'medium', assignees: [], tags: [], title: '', description: '' })}>+ New Ticket</button>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, marginLeft: 48 }}>{workspace?.description}</p>

      <div style={{ display: 'flex', gap: 16, flex: 1, overflowX: 'auto', paddingBottom: 8 }}>
        {STATUSES.map((col) => {
          const colTickets = filtered.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
              style={{ width: 290, flexShrink: 0, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}
            >
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 10 }}>{colTickets.length}</span>
              </div>
              <div style={{ padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {colTickets.map((t) => {
                  const pri = priorityMeta(t.priority);
                  return (
                    <div
                      key={t._id}
                      draggable
                      onDragStart={() => setDragId(t._id)}
                      onClick={() => setActive(t)}
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, cursor: 'pointer', opacity: dragId === t._id ? 0.5 : 1 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: pri.color, background: `${pri.color}1a`, padding: '2px 8px', borderRadius: 6 }}>{pri.label}</span>
                        {t.tags?.slice(0, 1).map((tag) => (
                          <span key={tag} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>{tag}</span>
                        ))}
                        <div style={{ marginLeft: 'auto', display: 'flex' }}>
                          {(t.assignees || []).slice(0, 3).map((a, i) => (
                            <span key={a._id} className="avatar" style={{ width: 22, height: 22, fontSize: 9, background: a.avatarColor, marginLeft: i ? -6 : 0, border: '2px solid var(--bg)' }}>{initials(a.name)}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {colTickets.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 20 }}>Drop tickets here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {active && (
        <TicketModal
          ticket={active}
          members={workspace?.members || []}
          onClose={() => setActive(null)}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
