import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/client';

const EMPTY = { title: '', description: '', date: '', time: '', venue: '', price: 0, available_seats: 100, total_seats: 100, category: '', is_featured: false };

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchEvents();
    const id = searchParams.get('edit');
    if (id) openEdit(id);
  }, []);

  const fetchEvents = () => {
    API.get('/events/').then(r => { setEvents(r.data); setLoading(false); });
  };

  const openEdit = async id => {
    try {
      const { data } = await API.get(`/events/${id}/`);
      setForm({ ...EMPTY, ...data });
      setEditId(parseInt(id));
      setShowForm(true);
    } catch {}
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const { data } = await API.patch(`/events/${editId}/update/`, form);
        setEvents(ev => ev.map(e => e.id === editId ? data : e));
      } else {
        const { data } = await API.post('/events/create/', form);
        setEvents(ev => [data, ...ev]);
      }
      setShowForm(false); setForm(EMPTY); setEditId(null);
    } catch (err) {
      alert(JSON.stringify(err.response?.data));
    }
    setSaving(false);
  };

  const del = async id => {
    if (!window.confirm('Delete this event?')) return;
    await API.delete(`/events/${id}/delete/`);
    setEvents(ev => ev.filter(e => e.id !== id));
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="page">
      <div style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.title}>Manage Events</h1>
          <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }} className="btn btn-primary">+ New Event</button>
        </div>
      </div>

      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.mHead}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: 'white' }}>
                {editId ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button onClick={() => setShowForm(false)} style={s.closeBtn}>✕</button>
            </div>
            <form onSubmit={submit} style={s.grid}>
              <div style={s.full}>
                <label style={s.lbl}>Event Title *</label>
                <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Amazing Event 2025" required />
              </div>
              <div style={s.full}>
                <label style={s.lbl}>Description</label>
                <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3} placeholder="Describe your event..." />
              </div>
              <div>
                <label style={s.lbl}>Date *</label>
                <input type="date" value={form.date} onChange={e => f('date', e.target.value)} required />
              </div>
              <div>
                <label style={s.lbl}>Time *</label>
                <input type="time" value={form.time} onChange={e => f('time', e.target.value)} required />
              </div>
              <div style={s.full}>
                <label style={s.lbl}>Venue *</label>
                <input value={form.venue} onChange={e => f('venue', e.target.value)} placeholder="Venue name" required />
              </div>
              <div>
                <label style={s.lbl}>Category</label>
                <select value={form.category} onChange={e => f('category', e.target.value)}>
                  <option value="">Select...</option>{['Music', 'Tech', 'Sports', 'Arts', 'Food', 'Business', 'Health', 'Comedy', 'Film', 'Others'].map(c =>
                   <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={s.lbl}>Price (₹) *</label>
                <input type="number" min="0" value={form.price} onChange={e => f('price', parseFloat(e.target.value) || 0)} required />
              </div>
              <div>
                <label style={s.lbl}>Total Seats *</label>
                <input type="number" min="1" value={form.total_seats} onChange={e => { const v = parseInt(e.target.value) || 1; f('total_seats', v); f('available_seats', v); }} required />
              </div>
              <div style={s.full}>
                <label style={{ ...s.lbl, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => f('is_featured', e.target.checked)} style={{ width: 'auto', display: 'inline' }} />
                  Mark as Featured ⭐
                </label>
              </div>
              <div style={{ ...s.full, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={s.wrap}>
        {loading ? <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div> : (
          <div style={s.table}>
            <div style={s.hdr}><span>Event</span><span>Date</span><span>Price</span><span>Seats</span><span>Actions</span></div>
            {events.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#8080a0' }}>No events yet. Add your first!</div>}
            {events.map(ev => (
              <div key={ev.id} style={s.row}>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{ev.title}</div>
                  <div style={{ color: '#8080a0', fontSize: 12 }}>{ev.category} · {ev.venue}</div>
                </div>
                <div style={{ color: '#c0c0d8', fontSize: 13 }}>{ev.date}</div>
                <div style={{ color: 'white', fontWeight: 600 }}>₹{ev.price}</div>
                <div style={{ color: '#a0a0b8', fontSize: 13 }}>{ev.available_seats}/{ev.total_seats}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(ev.id)} className="btn btn-secondary btn-sm">Edit</button>
                  <button onClick={() => del(ev.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  hero: { background: 'linear-gradient(135deg,#0d0a1a,#0a1020)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 32px 28px' },
  heroInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 800, color: 'white' },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal: { background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 32, maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto' },
  mHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: 8, fontSize: 15, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  full: { gridColumn: '1/-1' },
  lbl: { display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0b8', marginBottom: 6 },
  table: { background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' },
  hdr: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 18px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#8080a0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', gap: 12 },
  row: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', gap: 12 },
};
