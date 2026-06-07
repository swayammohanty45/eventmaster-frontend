import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/wishlist/').then(r => { setItems(r.data); setLoading(false); });
  }, []);

  const remove = async eventId => {
    await API.delete(`/events/${eventId}/wishlist/remove/`);
    setItems(i => i.filter(x => x.event.id !== eventId));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={s.hero}>
        <h1 style={s.title}>My Wishlist</h1>
        <p style={s.sub}>{items.length} saved event{items.length !== 1 ? 's' : ''}</p>
      </div>
      <div style={s.wrap}>
        {items.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 52 }}>❤️</div>
            <h3 style={{ color: 'white', marginTop: 12 }}>Your wishlist is empty</h3>
            <p style={{ color: '#8080a0', marginTop: 6 }}>Heart events to save them here</p>
            <Link to="/events" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Events</Link>
          </div>
        ) : (
          <div style={s.grid}>
            {items.map(item => (
              <div key={item.id} style={s.card}>
                <div style={s.cardImg}><span style={{ fontSize: 44 }}>🎪</span></div>
                <div style={s.cardBody}>
                  <h3 style={s.evTitle}>{item.event.title}</h3>
                  <p style={s.evMeta}>📅 {item.event.date} · 📍 {item.event.venue}</p>
                  <p style={s.price}>₹{item.event.price}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Link to={`/events/${item.event.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Book</Link>
                    <button onClick={() => remove(item.event.id)} className="btn btn-secondary btn-sm">Remove ❤️</button>
                  </div>
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
  hero: { background: 'linear-gradient(135deg,#0d0a1a,#0a1020)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '44px 32px 30px' },
  title: { fontSize: 34, fontWeight: 800, color: 'white', maxWidth: 1100, margin: '0 auto' },
  sub: { color: '#8080a0', fontSize: 14, maxWidth: 1100, margin: '6px auto 0' },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
  empty: { textAlign: 'center', padding: '80px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 },
  card: { background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' },
  cardImg: { height: 120, background: 'linear-gradient(135deg,#1a1030,#0a1530)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 16 },
  evTitle: { fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 },
  evMeta: { color: '#8080a0', fontSize: 12, marginBottom: 8 },
  price: { fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: 'white' },
};
