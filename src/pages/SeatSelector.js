import React, { useState, useEffect } from 'react';
import API from '../api/client';

export default function SeatSelector({ event, onConfirm, onClose }) {
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // Always regenerate seats based on total_seats
  const total = event.total_seats;
  const cols = Math.min(10, total);
  const rowsCount = Math.ceil(total / cols);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const generatedSeats = [];
  let created = 0;

  for (let r = 0; r < rowsCount; r++) {
    const rowLetter = letters[r];
    for (let n = 1; n <= cols; n++) {
      if (created >= total) break;
      generatedSeats.push({
        id: `${rowLetter}${n}`,
        row: rowLetter,
        number: n,
        seat_label: `${rowLetter}${n}`,
        status: 'available'
      });
      created++;
    }
    if (created >= total) break;
  }

  setSeats(generatedSeats);
  setLoading(false);
}, [event.id, event.total_seats]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked' || seat.status === 'blocked') return;
    setSelected(prev =>
      prev.find(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : [...prev, seat]
    );
  };

  // Group by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const total = (parseFloat(event.price) * selected.length).toFixed(2);

  return (
    <div className="payment-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal} className="pop-in">
        {/* Header */}
        <div style={s.header}>
          <div>
            <h3 style={s.title}>Select Your Seats</h3>
            <p style={s.sub}>{event.title} · ₹{event.price} per seat</p>
          </div>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* Screen indicator */}
        <div style={s.screenWrap}>
          <div style={s.screen}>STAGE / SCREEN</div>
          <div style={s.screenGlow} />
        </div>

        {/* Legend */}
        <div style={s.legend}>
          {[['#1e1e2a','rgba(255,255,255,0.12)','Available'],
            ['linear-gradient(135deg,#7c3aed,#a855f7)','transparent','Selected'],
            ['#2a1a1a','rgba(244,63,94,0.3)','Booked']].map(([bg, border, label]) => (
            <div key={label} style={s.legendItem}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: bg, border: `1px solid ${border}` }} />
              <span style={{ color: '#a0a0b8', fontSize: 12 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Seats grid */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : (
          <div style={s.seatsWrap}>
            {Object.entries(rows).map(([row, rowSeats]) => (
              <div key={row} style={s.row}>
                <span style={s.rowLabel}>{row}</span>
                <div style={s.rowSeats}>
                  {rowSeats.map(seat => {
                    const isSelected = selected.find(s => s.id === seat.id);
                    const isBooked = seat.status === 'booked' || seat.status === 'blocked';
                    return (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeat(seat)}
                        disabled={isBooked}
                        title={seat.seat_label}
                        style={{
                          ...s.seat,
                          background: isBooked ? '#2a1a1a' : isSelected ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#1e1e2a',
                          borderColor: isBooked ? 'rgba(244,63,94,0.3)' : isSelected ? 'transparent' : 'rgba(255,255,255,0.12)',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isSelected ? '0 0 8px rgba(168,85,247,0.6)' : 'none',
                        }}
                      >
                        {isBooked ? '✕' : seat.number}
                      </button>
                    );
                  })}
                </div>
                <span style={s.rowLabel}>{row}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div style={s.bottomBar}>
          <div>
            {selected.length > 0 ? (
              <>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                  {selected.length} seat{selected.length > 1 ? 's' : ''} selected:&nbsp;
                  <span style={{ color: '#a855f7' }}>{selected.map(s => s.seat_label).join(', ')}</span>
                </p>
                <p style={{ color: '#10b981', fontWeight: 700, fontSize: 18, marginTop: 4 }}>Total: ₹{total}</p>
              </>
            ) : (
              <p style={{ color: '#8080a0', fontSize: 14 }}>Select seats to continue</p>
            )}
          </div>
          <button
            onClick={() => selected.length > 0 && onConfirm(selected)}
            disabled={selected.length === 0}
            className="btn btn-primary btn-lg"
            style={{ opacity: selected.length === 0 ? 0.5 : 1 }}
          >
            Confirm {selected.length > 0 ? `${selected.length} Seat${selected.length > 1 ? 's' : ''}` : 'Seats'} →
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  modal: {
    background: '#111118', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: 28, maxWidth: 700, width: '100%',
    maxHeight: '92vh', overflowY: 'auto',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { color: 'white', fontSize: 20, fontWeight: 700 },
  sub: { color: '#8080a0', fontSize: 13, marginTop: 3 },
  closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: 8, fontSize: 14, cursor: 'pointer', flexShrink: 0 },
  screenWrap: { textAlign: 'center', marginBottom: 24, position: 'relative' },
  screen: { background: 'linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 4, padding: '6px 40px', color: '#c084fc', fontSize: 12, fontWeight: 700, letterSpacing: 3, display: 'inline-block' },
  screenGlow: { height: 2, background: 'linear-gradient(90deg,transparent,rgba(168,85,247,0.4),transparent)', marginTop: 4 },
  legend: { display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 20 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  seatsWrap: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  row: { display: 'flex', alignItems: 'center', gap: 10 },
  rowLabel: { color: '#606080', fontSize: 12, fontWeight: 700, width: 20, textAlign: 'center', flexShrink: 0 },
  rowSeats: { display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, justifyContent: 'center' },
  seat: {
    width: 32, height: 32, borderRadius: 6, border: '1px solid',
    color: 'white', fontSize: 10, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease', flexShrink: 0,
  },
  bottomBar: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
};