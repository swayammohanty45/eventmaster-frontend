import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';
import PaymentGateway from './PaymentGateway';
import TicketReceipt from './TicketReceipt';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [payBooking, setPayBooking] = useState(null);
  const [ticketBooking, setTicketBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    API.get('/bookings/mine/').then(r => { setBookings(r.data); setLoading(false); });
  };

  const cancel = async id => {
    if (!window.confirm('Cancel this booking? Your seats will be released.')) return;
    try {
      await API.post(`/bookings/${id}/cancel/`);
      setBookings(bks => bks.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (e) { alert(e.response?.data?.error || 'Cannot cancel this booking'); }
  };

  const onPaySuccess = () => {
    setBookings(bks => bks.map(b => b.id === payBooking.id ? { ...b, status: 'pending_verification' } : b));
    setPayBooking(null);
    fetchBookings();
  };

  const getStatusColor = (status) => ({
    confirmed: '#10b981',
    pending_verification: '#f59e0b',
    pending_payment: '#a855f7',
    cancelled: '#f43f5e',
    rejected: '#f43f5e',
  }[status] || '#a0a0b8');

  const getStatusLabel = (status) => ({
    confirmed: '✅ Confirmed',
    pending_verification: '⏳ Pending Verification',
    pending_payment: '💳 Payment Pending',
    cancelled: '❌ Cancelled',
    rejected: '❌ Rejected',
  }[status] || status);

  const list = filter === 'all' ? bookings : bookings.filter(b =>
    filter === 'confirmed' ? b.status === 'confirmed' :
    filter === 'pending' ? ['pending_payment','pending_verification'].includes(b.status) :
    ['cancelled','rejected'].includes(b.status)
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  return (
    <div className="page">
      {payBooking && (
        <PaymentGateway booking={payBooking} onSuccess={onPaySuccess} onClose={() => setPayBooking(null)} />
      )}
      {ticketBooking && (
        <TicketReceipt booking={ticketBooking} event={ticketBooking.event} onClose={() => setTicketBooking(null)} />
      )}

      <div style={s.hero}>
        <h1 style={s.title}>My Bookings</h1>
        <p style={s.sub}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
      </div>

      <div style={s.wrap}>
        <div style={s.tabs}>
          {[['all','All',bookings.length],
            ['confirmed','Confirmed',bookings.filter(b=>b.status==='confirmed').length],
            ['pending','Pending',bookings.filter(b=>['pending_payment','pending_verification'].includes(b.status)).length],
            ['cancelled','Cancelled',bookings.filter(b=>['cancelled','rejected'].includes(b.status)).length]
          ].map(([key, label, count]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ ...s.tab, ...(filter === key ? s.tabActive : {}) }}>
              {label} <span style={s.count}>{count}</span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div style={s.empty} className="pop-in">
            <div className="float" style={{ fontSize: 52 }}>🎟️</div>
            <h3 style={{ color: 'white', marginTop: 12 }}>No bookings here</h3>
            <Link to="/events" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Events</Link>
          </div>
        ) : (
          <div style={s.list}>
            {list.map((b, i) => (
              <div key={b.id} style={{ ...s.card, borderColor: b.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : b.status.includes('pending') ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)' }}
                className="pop-in card-hover">
                <div style={s.cardLeft}>
                  <div style={s.ref}>#{b.booking_ref}</div>
                  {b.ticket_number && (
                    <div style={s.ticketNum}>🎟️ {b.ticket_number}</div>
                  )}
                  <h3 style={s.evTitle}>{b.event?.title}</h3>
                  <div style={s.meta}>
                    <span>📅 {b.event?.date}</span>
                    <span>📍 {b.event?.venue}</span>
                    <span>🎟️ {b.num_tickets} ticket{b.num_tickets !== 1 ? 's' : ''}</span>
                  </div>
                  {/* Seat labels */}
                  {b.seat_labels?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {b.seat_labels.map(sl => (
                        <span key={sl} style={{ background: 'rgba(124,58,237,0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{sl}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <span style={{ color: getStatusColor(b.status), fontWeight: 700, fontSize: 13 }}>
                      {getStatusLabel(b.status)}
                    </span>
                  </div>
                </div>

                <div style={s.cardRight}>
                  <div style={s.amount}>₹{b.total_amount?.toFixed(2)}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {/* Show ticket button for confirmed */}
                    {b.status === 'confirmed' && (
                      <button onClick={() => setTicketBooking(b)} className="btn btn-success btn-sm"
                        style={{ justifyContent: 'center' }}>
                        🎟️ View Ticket
                      </button>
                    )}
                    {/* Pay now for pending payment */}
                    {b.status === 'pending_payment' && (
                      <button onClick={() => setPayBooking(b)} className="btn btn-primary btn-sm"
                        style={{ justifyContent: 'center' }}>
                        💳 Pay Now
                      </button>
                    )}
                    {/* Cancel for pending */}
                    {['pending_payment', 'pending_verification'].includes(b.status) && (
                      <button onClick={() => cancel(b.id)} className="btn btn-danger btn-sm"
                        style={{ justifyContent: 'center' }}>
                        ❌ Cancel
                      </button>
                    )}
                    <Link to={`/events/${b.event?.id}`} className="btn btn-secondary btn-sm"
                      style={{ textAlign: 'center' }}>View Event</Link>
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
  title: { fontSize: 36, fontWeight: 700, color: 'white', maxWidth: 1100, margin: '0 auto' },
  sub: { color: '#8080a0', fontSize: 14, maxWidth: 1100, margin: '6px auto 0' },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a0a0b8', padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' },
  tabActive: { background: 'rgba(124,58,237,0.2)', borderColor: 'rgba(124,58,237,0.4)', color: '#c084fc' },
  count: { background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '1px 7px', fontSize: 11 },
  empty: { textAlign: 'center', padding: '80px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: { background: '#16161f', border: '1px solid', borderRadius: 16, padding: 24, display: 'flex', justifyContent: 'space-between', gap: 20, transition: 'all 0.2s' },
  cardLeft: { flex: 1 },
  ref: { display: 'inline-block', background: 'rgba(124,58,237,0.15)', color: '#a855f7', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' },
  ticketNum: { display: 'inline-block', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, marginBottom: 8, marginLeft: 8, letterSpacing: '1px' },
  evTitle: { fontSize: 19, fontWeight: 700, color: 'white', marginBottom: 8 },
  meta: { display: 'flex', gap: 16, color: '#8080a0', fontSize: 13, flexWrap: 'wrap' },
  cardRight: { textAlign: 'right', flexShrink: 0, minWidth: 130 },
  amount: { fontSize: 24, fontWeight: 700, color: 'white' },
};