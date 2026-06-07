import React, { useState, useEffect } from 'react';
import API from '../api/client';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/bookings/all/').then(r => { setBookings(r.data); setLoading(false); });
  }, []);

  const filtered = bookings.filter(b =>
    b.username?.toLowerCase().includes(search.toLowerCase()) ||
    b.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.booking_ref?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={s.hero}>
        <h1 style={s.title}>All Bookings</h1>
        <p style={s.sub}>{bookings.length} total bookings</p>
      </div>
      <div style={s.wrap}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, event, or booking ref..." style={{ marginBottom: 20 }} />
        {loading ? <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div> : (
          <div style={s.table}>
            <div style={s.hdr}>
              <span>Ref</span><span>User</span><span>Event</span><span>Tickets</span><span>Amount</span><span>Status</span><span>Payment</span>
            </div>
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#8080a0' }}>No bookings found</div>}
            {filtered.map(b => (
              <div key={b.id} style={s.row}>
                <div style={{ color: '#a855f7', fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>#{b.booking_ref}</div>
                <div>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>{b.username}</div>
                </div>
                <div style={{ color: '#c0c0d8', fontSize: 13 }}>{b.event?.title?.slice(0, 25)}{b.event?.title?.length > 25 ? '...' : ''}</div>
                <div style={{ color: 'white', fontWeight: 600 }}>{b.num_tickets}</div>
                <div style={{ color: 'white', fontWeight: 600 }}>₹{b.total_amount?.toFixed(2)}</div>
                <div><span className={`badge badge-${b.status}`}>{b.status}</span></div>
                <div><span className={`badge badge-${b.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>{b.payment_status || 'unpaid'}</span></div>
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
  table: { background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' },
  hdr: { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.6fr 0.7fr 0.8fr 1fr 0.8fr', padding: '12px 18px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#8080a0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', gap: 10 },
  row: { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.6fr 0.7fr 0.8fr 1fr 0.8fr', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', gap: 10 },
};
