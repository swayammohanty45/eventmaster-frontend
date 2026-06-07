import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';

const CATS = ['All','Music','Tech','Sports','Arts','Food','Business','Health','Comedy','Film','Others'];
const EMO = { Music:'🎵',Tech:'💻',Sports:'⚽',Arts:'🎨',Food:'🍽️',Business:'💼',Health:'🏃',Comedy:'😂',Film:'🎬',Others:'🌟',All:'✨' };

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [wishlisted, setWishlisted] = useState(new Set());
  const { isAdmin } = useAuth();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (cat) params.category = cat;
    API.get('/events/', { params }).then(r => { setEvents(r.data); setLoading(false); });
  }, [search, cat]);

  const toggleWish = async (e, id) => {
    e.preventDefault();
    if (wishlisted.has(id)) {
      await API.delete(`/events/${id}/wishlist/remove/`);
      setWishlisted(p => { const n = new Set(p); n.delete(id); return n; });
    } else {
      await API.post(`/events/${id}/wishlist/add/`);
      setWishlisted(p => new Set([...p, id]));
    }
  };

  const deleteEvent = async id => {
    if (!window.confirm('Delete this event?')) return;
    await API.delete(`/events/${id}/delete/`);
    setEvents(ev => ev.filter(e => e.id !== id));
  };

  return (
    <div className="page">
      <div style={s.hero}>
        <div style={s.heroGlow1} />
        <div style={s.heroGlow2} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={s.heroBadge} className="pop-in">🎪 Event Platform</div>
          <h1 style={s.heroTitle}>Discover <span style={s.heroAccent}>Amazing</span><br />Events</h1>
          <p style={s.heroSub}>Find and book experiences that move you</p>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, venues..." style={s.searchInput} />
            {search && <button onClick={() => setSearch('')} style={s.clearBtn}>✕</button>}
          </div>
        </div>
      </div>

      <div style={s.wrap}>
        <div style={s.tabs}>
          {CATS.map((c, i) => (
            <button key={c} onClick={() => setCat(c === 'All' ? '' : c)}
              style={{ ...s.tab, ...(cat === (c === 'All' ? '' : c) ? s.tabActive : {}) }}>
              {EMO[c]} {c}
            </button>
          ))}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <Link to="/admin/events" className="btn btn-primary">+ Add Event</Link>
            <Link to="/admin" className="btn btn-secondary">Dashboard</Link>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 80, textAlign: 'center' }}>
            <div className="spinner" />
            <p style={{ color: '#8080a0', marginTop: 16 }}>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={s.empty} className="pop-in">
            <div className="float" style={{ fontSize: 64 }}>🎭</div>
            <h3 style={{ color: 'white', marginTop: 16 }}>No events found</h3>
            <p style={{ color: '#8080a0', marginTop: 8 }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={s.grid}>
            {events.map((ev, i) => (
              <EventCard key={ev.id} event={ev} isAdmin={isAdmin} index={i}
                wishlisted={wishlisted.has(ev.id) || ev.is_wishlisted}
                onWish={toggleWish} onDelete={deleteEvent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event: ev, isAdmin, wishlisted, onWish, onDelete, index }) {
  const pct = ev.total_seats > 0 ? Math.round((ev.seats_booked / ev.total_seats) * 100) : 0;
  const nearFull = pct >= 80;
  return (
    <div style={s.card} className="card-hover pop-in">
      <div style={s.cardTop}>
        <div style={{ fontSize: 52 }}>{EMO[ev.category] || '🎪'}</div>
        <div style={s.cardTopRow}>
          <span style={s.catTag}>{ev.category || 'Event'}</span>
          {!isAdmin && (
            <button onClick={e => onWish(e, ev.id)} style={s.wishBtn}>
              <span style={{ fontSize: 18 }}>{wishlisted ? '❤️' : '🤍'}</span>
            </button>
          )}
        </div>
        {ev.is_featured && <div style={s.featBadge} className="pulse-glow">⭐ Featured</div>}
      </div>
      <div style={s.cardBody}>
        <h3 style={s.cardTitle}>{ev.title}</h3>
        <p style={s.cardDesc}>{ev.description?.slice(0,75)}{ev.description?.length > 75 ? '...' : ''}</p>
        <div style={s.meta}>
          <span>📅 {ev.date}</span>
          <span>📍 {ev.venue}</span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: '#a0a0b8' }}>{ev.available_seats} seats left</span>
            <span style={{ color: nearFull ? '#f59e0b' : '#10b981', fontWeight: 700 }}>{pct}% full</span>
          </div>
          <div style={s.barTrack}>
            <div style={{ ...s.barFill, width: `${pct}%`, background: nearFull ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#7c3aed,#a855f7)' }} />
          </div>
        </div>
        <div style={s.cardFoot}>
          <span style={s.price}>₹{ev.price}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAdmin ? (
              <>
                <Link to={`/admin/events?edit=${ev.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                <button onClick={() => onDelete(ev.id)} className="btn btn-danger btn-sm">Delete</button>
              </>
            ) : (
              <Link to={`/events/${ev.id}`} className="btn btn-primary btn-sm">Book Now →</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  hero: { background: 'linear-gradient(135deg,#0d0a1a,#0a1020)', padding: '64px 24px 52px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  heroGlow1: { position: 'absolute', top: '-30%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,58,237,0.25),transparent 60%)', pointerEvents: 'none', animation: 'float 4s ease-in-out infinite' },
  heroGlow2: { position: 'absolute', bottom: '-20%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(20,184,166,0.12),transparent 60%)', pointerEvents: 'none', animation: 'float 5s ease-in-out infinite reverse' },
  heroBadge: { display: 'inline-block', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c084fc', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 },
  heroTitle: { fontSize: 54, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.1 },
  heroAccent: { background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { color: '#8080a0', fontSize: 18, marginBottom: 32 },
  searchWrap: { maxWidth: 540, margin: '0 auto', position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 16, fontSize: 16, zIndex: 1 },
  searchInput: { paddingLeft: 44, paddingRight: 44, fontSize: 15, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14 },
  clearBtn: { position: 'absolute', right: 14, background: 'none', border: 'none', color: '#8080a0', fontSize: 14, cursor: 'pointer' },
  wrap: { maxWidth: 1200, margin: '0 auto', padding: '28px 24px' },
  tabs: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 28 },
  tab: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a0a0b8', padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' },
  tabActive: { background: 'rgba(124,58,237,0.2)', borderColor: 'rgba(124,58,237,0.5)', color: '#c084fc', boxShadow: '0 0 12px rgba(124,58,237,0.25)' },
  empty: { textAlign: 'center', padding: '80px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 22 },
  card: { background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' },
  cardTop: { height: 165, background: 'linear-gradient(135deg,#1a1030,#0a1530)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTopRow: { position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catTag: { background: 'rgba(124,58,237,0.25)', color: '#c084fc', border: '1px solid rgba(124,58,237,0.35)', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  featBadge: { position: 'absolute', bottom: 10, left: 12, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  wishBtn: { background: 'rgba(0,0,0,0.4)', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  cardBody: { padding: 20 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6 },
  cardDesc: { color: '#a0a0b8', fontSize: 13, marginBottom: 14, lineHeight: 1.5 },
  meta: { display: 'flex', gap: 14, color: '#707088', fontSize: 12, marginBottom: 14, flexWrap: 'wrap' },
  barTrack: { height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' },
  cardFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 22, fontWeight: 700, color: 'white' },
};