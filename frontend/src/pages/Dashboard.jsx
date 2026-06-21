import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await api.get('/workspaces');
    setWorkspaces(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/workspaces', { name, description });
    setName('');
    setDescription('');
    setShowModal(false);
    load();
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>Workspaces</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Organize your tickets into workspaces</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Workspace</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : workspaces.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          No workspaces yet. Create your first one!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {workspaces.map((ws) => (
            <div
              key={ws._id}
              onClick={() => navigate(`/workspace/${ws._id}`)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, cursor: 'pointer', boxShadow: 'var(--shadow)', transition: 'transform 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: ws.color, marginBottom: 14 }} />
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>{ws.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, minHeight: 20 }}>{ws.description || 'No description'}</p>
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>{ws.members.length} member{ws.members.length !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: 420 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, marginBottom: 18 }}>New Workspace</h2>
            <form onSubmit={create}>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
