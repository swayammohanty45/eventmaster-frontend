import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [dash, pend] = await Promise.all([
      API.get('/admin/dashboard/'),
      API.get('/bookings/pending-verifications/'),
    ]);
    setData(dash.data);
    setPending(pend.data);
    setLoading(false);
  };

  const confirmPayment = async (id) => {
    try {
      await API.post(`/bookings/${id}/confirm-payment/`);
      setActionMsg('✅ Payment confirmed! Ticket issued.');
      setPending(p => p.filter(b => b.id !== id));
      fetchAll();
    } catch (e) { setActionMsg('❌ ' + (e.response?.data?.error || 'Failed')); }
    setTimeout(() => setActionMsg(''), 4000);
  };

  const rejectPayment = async (id) => {
    if (!window.confirm('Reject this payment? Booking will be cancelled and seats restored.')) return;
    try {
      await API.post(`/bookings/${id}/reject-payment/`);
      setActionMsg('❌ Booking rejected. Seats restored.');
      setPending(p => p.filter(b => b.id !== id));
      fetchAll();
    } catch (e) { setActionMsg('Error: ' + (e.response?.data?.error || 'Failed')); }
    setTimeout(() => setActionMsg(''), 4000);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  const stats = [
    { emoji: '🎪', label: 'Total Events', value: data.total_events, color: '#7c3aed' },
    { emoji: '👥', label: 'Total Users', value: data.total_users, color: '#14b8a6' },
    { emoji: '🎟️', label: 'Total Bookings', value: data.total_bookings, color: '#f59e0b' },
    { emoji: '✅', label: 'Confirmed', value: data.confirmed_bookings, color: '#10b981' },
    { emoji: '⏳', label: 'Pending', value: data.pending_verifications, color: '#f43f5e' },
    { emoji: '₹', label: 'Revenue', value: `₹${data.total_revenue?.toLocaleString()}`, color: '#a855f7' },
  ];

  return (
    <div className="page">
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div>
            <h1 style={s.title}>Admin Dashboard</h1>
            <p style={s.sub}>Platform overview</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/admin/events" className="btn btn-primary">+ Add Event</Link>
            <Link to="/admin/bookings" className="btn btn-secondary">All Bookings</Link>
          </div>
        </div>
      </div>

      <div style={s.wrap}>
        {actionMsg && (
          <div style={{ ...s.actionMsg, background: actionMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', borderColor: actionMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)', color: actionMsg.startsWith('✅') ? '#10b981' : '#f43f5e' }}>
            {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map(st => (
            <div key={st.label} style={{ ...s.statCard, borderColor: st.color + '30' }}>
              <div style={{ ...s.statIcon, background: st.color + '20', color: st.color }}>{st.emoji}</div>
              <div style={s.statVal}>{st.value ?? 0}</div>
              <div style={s.statLbl}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* ── PENDING PAYMENT VERIFICATIONS ── */}
        {pending.length > 0 && (
          <div style={s.pendingSection}>
            <div style={s.pendingHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={s.pendingAlert}>⚡</div>
                <div>
                  <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Payment Verifications Needed</h3>
                  <p style={{ color: '#f59e0b', fontSize: 13, marginTop: 2 }}>{pending.length} booking{pending.length > 1 ? 's' : ''} waiting for your confirmation</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pending.map(b => (
                <div key={b.id} style={s.pendingCard}>
                  <div style={s.pendingLeft}>
                    <div style={s.pendingRef}>#{b.booking_ref}</div>
                    <h4 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{b.event?.title}</h4>
                    <div style={s.pendingMeta}>
                      <span>👤 {b.username}</span>
                      <span>📅 {b.event?.date}</span>
                      <span>🎟️ {b.num_tickets} ticket{b.num_tickets > 1 ? 's' : ''}</span>
                      <span>💰 ₹{b.total_amount?.toFixed(2)}</span>
                    </div>
                    {b.utr_number && (
                      <div style={s.utrBox}>
                        <span style={{ color: '#8080a0', fontSize: 12 }}>UTR / Transaction ID:</span>
                        <span style={{ color: '#a855f7', fontWeight: 700, fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 }}>{b.utr_number}</span>
                      </div>
                    )}
                    <p style={{ color: '#8080a0', fontSize: 12, marginTop: 6 }}>
                      🕐 Submitted: {new Date(b.updated_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div style={s.pendingActions}>
                    <p style={{ color: '#a0a0b8', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                      Check BharatPe app<br />for ₹{b.total_amount?.toFixed(2)} payment
                    </p>
                    <button onClick={() => confirmPayment(b.id)} className="btn btn-success"
                      style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                      ✅ Confirm & Issue Ticket
                    </button>
                    <button onClick={() => rejectPayment(b.id)} className="btn btn-danger"
                      style={{ width: '100%', justifyContent: 'center' }}>
                      ❌ Reject & Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && (
          <div style={s.nopending}>
            <span style={{ fontSize: 32 }}>✅</span>
            <p style={{ color: '#10b981', fontWeight: 600, marginTop: 8 }}>No pending verifications</p>
          </div>
        )}

        {/* Bottom grid */}
        <div style={s.bottom}>
          <div style={s.section}>
            <h3 style={s.secTitle}>Recent Bookings</h3>
            {data.recent_bookings?.map(b => (
              <div key={b.id} style={s.bRow}>
                <div style={s.bAvatar}>{b.username?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{b.username}</div>
                  <div style={{ color: '#8080a0', fontSize: 12 }}>{b.event?.title} · {b.num_tickets} tickets</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>₹{b.total_amount?.toFixed(2)}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: b.status === 'confirmed' ? '#10b981' : b.status === 'pending_verification' ? '#f59e0b' : '#f43f5e' }}>
                    {b.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.section}>
            <h3 style={s.secTitle}>Events by Category</h3>
            {data.category_stats?.map(c => (
              <div key={c.category} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: '#c0c0d8' }}>{c.category || 'Uncategorized'}</span>
                  <span style={{ color: '#a855f7', fontWeight: 600 }}>{c.count}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${(c.count / (data.total_events || 1)) * 100}%`, background: 'linear-gradient(90deg,#7c3aed,#a855f7)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  hero: { background: 'linear-gradient(135deg,#0d0a1a,#0a1020)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '44px 32px 30px' },
  heroInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 34, fontWeight: 700, color: 'white' },
  sub: { color: '#8080a0', fontSize: 14, marginTop: 4 },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
  actionMsg: { border: '1px solid', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 600, marginBottom: 20 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14, marginBottom: 28 },
  statCard: { background: '#16161f', border: '1px solid', borderRadius: 14, padding: 22, textAlign: 'center' },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 12px' },
  statVal: { fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 4 },
  statLbl: { color: '#8080a0', fontSize: 12 },
  pendingSection: { background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 24, marginBottom: 28 },
  pendingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pendingAlert: { width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, animation: 'pulseGlow 2s infinite', flexShrink: 0 },
  pendingCard: { background: '#16161f', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: 20, display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' },
  pendingLeft: { flex: 1, minWidth: 260 },
  pendingRef: { display: 'inline-block', background: 'rgba(124,58,237,0.15)', color: '#a855f7', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, marginBottom: 8 },
  pendingMeta: { display: 'flex', gap: 14, color: '#8080a0', fontSize: 13, flexWrap: 'wrap', marginBottom: 10 },
  utrBox: { display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, padding: '8px 12px', marginTop: 8 },
  pendingActions: { minWidth: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  nopendig: { textAlign: 'center', padding: '20px 0', marginBottom: 28 },
  nopending: { textAlign: 'center', padding: '20px 0', marginBottom: 28 },
  bottom: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  section: { background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 22 },
  secTitle: { fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 18 },
  bRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  bAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 },
};