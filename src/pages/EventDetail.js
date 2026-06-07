import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import SeatSelector from './SeatSelector';
import PaymentGateway from './PaymentGateway';

export default function EventDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSeats, setShowSeats] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookedData, setBookedData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    API.get(`/events/${id}/`).then(r => { setEvent(r.data); setLoading(false); });
  }, [id]);

  const handleSeatConfirm = async (seats) => {
    setShowSeats(false);
    setSelectedSeats(seats);
    setBooking(true); setError('');
    try {
      const { data } = await API.post(`/events/${id}/book/`, {
        seat_labels: seats.map(s => s.seat_label),
        num_tickets: seats.length
      });
      setBookedData(data);
      setEvent(prev => ({ ...prev, available_seats: prev.available_seats - seats.length }));
      setShowPayment(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Booking failed. Try again.');
    }
    setBooking(false);
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Cancel this booking? Your seats will be released.')) return;
    try {
      await API.post(`/bookings/${bookedData.id}/cancel/`);
      setBookedData(null);
      setSelectedSeats([]);
      setShowPayment(false);
      setEvent(prev => ({ ...prev, available_seats: prev.available_seats + selectedSeats.length }));
    } catch (e) {
      setError(e.response?.data?.error || 'Cancel failed');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: 80, color: 'white' }}>Event not found</div>;

  const pct = event.total_seats > 0 ? Math.round(((event.total_seats - event.available_seats) / event.total_seats) * 100) : 0;

  return (
    <div className="page">
      {showSeats && (
        <SeatSelector event={event} onConfirm={handleSeatConfirm} onClose={() => setShowSeats(false)} />
      )}
      {showPayment && bookedData && (
        <PaymentGateway
          booking={{ ...bookedData, event }}
          onSuccess={() => setShowPayment(false)}
          onClose={() => setShowPayment(false)}
        />
      )}

      <div style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroInner}>
          <Link to="/events" style={s.back}>← Back to Events</Link>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={s.catBadge}>{event.category || 'Event'}</span>
            {event.is_featured && <span style={s.featBadge}>⭐ Featured</span>}
          </div>
          <h1 style={s.title}>{event.title}</h1>
          <div style={s.metaRow}>
            <span>📅 {event.date} at {event.time}</span>
            <span>📍 {event.venue}</span>
          </div>
        </div>
      </div>

      <div style={s.body}>
        <div>
          <div style={s.section}>
            <h3 style={s.secTitle}>About this Event</h3>
            <p style={{ color: '#c0c0d8', lineHeight: 1.8, fontSize: 15 }}>{event.description || 'No description provided.'}</p>
          </div>
          <div style={s.infoGrid}>
            {[['📅','Date',event.date],['⏰','Time',event.time],['📍','Venue',event.venue],
              ['🏷️','Category',event.category||'General'],['🎟️','Seats Left',`${event.available_seats}`],
              ['💰','Price',event.price==0?'FREE':`₹${event.price}`]].map(([icon,label,val])=>(
              <div key={label} style={s.infoCard}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ color: '#8080a0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={s.bookCard}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
              <span style={s.bigPrice}>{event.price==0?'FREE':`₹${event.price}`}</span>
              {event.price>0 && <span style={{ color: '#a0a0b8', fontSize: 14 }}>per seat</span>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: '#a0a0b8' }}>{event.available_seats}/{event.total_seats} seats left</span>
                <span style={{ color: pct>=80?'#f59e0b':'#10b981', fontWeight: 700 }}>{pct}% full</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: pct>=80?'linear-gradient(90deg,#f59e0b,#ef4444)':'linear-gradient(90deg,#7c3aed,#a855f7)', transition: 'width 1s ease' }} />
              </div>
            </div>

            {error && <div style={s.errBox}>{error}</div>}

            {/* Selected seats preview */}
            {selectedSeats.length > 0 && (
              <div style={s.selectedBox}>
                <p style={{ color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>Selected Seats</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedSeats.map(seat => (
                    <span key={seat.id} style={s.seatTag}>{seat.seat_label}</span>
                  ))}
                </div>
              </div>
            )}

            {!isAdmin && event.available_seats > 0 && !bookedData && (
              <>
                <button onClick={() => setShowSeats(true)} disabled={booking} className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                  {booking ? '⏳ Booking...' : '🪑 Select Seats & Book'}
                </button>
                <p style={{ color: '#606080', fontSize: 12, textAlign: 'center' }}>
                  🔐 Choose your seats · Pay via UPI
                </p>
              </>
            )}

            {bookedData && !showPayment && (
              <div>
                <div style={s.statusBox}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                  <p style={{ color: '#f59e0b', fontWeight: 700, fontSize: 15 }}>Pending Verification</p>
                  <p style={{ color: '#8080a0', fontSize: 12, marginTop: 4 }}>Admin will confirm shortly</p>
                </div>
                <button onClick={() => setShowPayment(true)} className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                  💳 Complete Payment
                </button>
                <button onClick={handleCancelBooking} className="btn btn-danger"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                  ❌ Cancel Booking
                </button>
                <Link to="/my-bookings" className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                  📋 View My Bookings
                </Link>
              </div>
            )}

            {event.available_seats===0 && !bookedData && (
              <div style={s.soldOut}>🎟️ Sold Out</div>
            )}

            {isAdmin && (
              <Link to={`/admin/events?edit=${event.id}`} className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                ✏️ Edit Event
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  hero: { background: 'linear-gradient(135deg,#0d0a1a,#0a1020)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '44px 0 36px', position: 'relative', overflow: 'hidden' },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%,rgba(124,58,237,0.18),transparent 60%)', pointerEvents: 'none' },
  heroInner: { maxWidth: 1100, margin: '0 auto', padding: '0 24px', position: 'relative' },
  back: { display: 'inline-block', color: '#a0a0b8', textDecoration: 'none', fontSize: 14, marginBottom: 18 },
  catBadge: { background: 'rgba(124,58,237,0.2)', color: '#c084fc', border: '1px solid rgba(124,58,237,0.3)', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  featBadge: { background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  title: { fontSize: 38, fontWeight: 700, color: 'white', marginBottom: 14, lineHeight: 1.2 },
  metaRow: { display: 'flex', gap: 24, color: '#8080a0', fontSize: 14, flexWrap: 'wrap' },
  body: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' },
  section: { background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24, marginBottom: 20 },
  secTitle: { fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 14 },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  infoCard: { background: '#16161f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' },
  bookCard: { background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 26, position: 'sticky', top: 80 },
  bigPrice: { fontSize: 36, fontWeight: 700, color: 'white' },
  errBox: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 },
  selectedBox: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 },
  seatTag: { background: 'rgba(124,58,237,0.25)', color: '#c084fc', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 },
  statusBox: { textAlign: 'center', padding: '16px 0', marginBottom: 14 },
  soldOut: { textAlign: 'center', padding: 16, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12, color: '#f43f5e', fontWeight: 700, fontSize: 16 },
};