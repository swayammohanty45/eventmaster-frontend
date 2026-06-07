import React from 'react';
import { Link } from 'react-router-dom';

export default function TicketReceipt({ booking, event, onClose }) {
  const now = new Date().toLocaleString('en-IN');

  const print = () => {
    const printContent = document.getElementById('ticket-print').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Ticket - ${booking.booking_ref}</title>
      <style>
        body { font-family: Calibri, sans-serif; padding: 20px; background: white; color: black; }
        .ticket { border: 2px dashed #7c3aed; border-radius: 16px; padding: 24px; max-width: 500px; margin: auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: 800; color: #7c3aed; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .ticket-num { text-align: center; background: #f3f0ff; border-radius: 10px; padding: 16px; margin: 16px 0; }
        .tnum { font-size: 28px; font-weight: 800; color: #7c3aed; letter-spacing: 3px; font-family: monospace; }
        .seats { color: #7c3aed; font-weight: 700; }
        .footer { text-align: center; margin-top: 16px; color: #999; font-size: 12px; }
      </style>
      </head><body>${printContent}</body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="payment-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="payment-modal" style={{ maxWidth: 460 }} className="pop-in">

        {/* Ticket header */}
        <div style={s.ticketHeader}>
          <div style={s.successIcon} className="float">🎟️</div>
          <h3 style={{ color: '#10b981', fontSize: 22, fontWeight: 800, marginTop: 12 }}>Your Ticket is Confirmed!</h3>
          <p style={{ color: '#a0a0b8', fontSize: 14, marginTop: 4 }}>Payment verified by admin</p>
        </div>

        {/* Printable area */}
        <div id="ticket-print">
          <div className="ticket">
            <div className="header">
              <div className="title">⚡ EventMaster</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Official Event Ticket</div>
            </div>

            {/* Ticket number - big and prominent */}
            <div style={s.ticketNumBox}>
              <p style={{ color: '#8080a0', fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>TICKET NUMBER</p>
              <p style={s.ticketNum}>{booking.ticket_number}</p>
              <p style={{ color: '#8080a0', fontSize: 11, marginTop: 6 }}>Show this at entry gate</p>
            </div>

            {/* Barcode visual */}
            <div style={s.barcode}>
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} style={{ width: Math.random() > 0.5 ? 3 : 2, height: '100%', background: '#111', borderRadius: 1 }} />
              ))}
            </div>

            {/* Event details */}
            <div style={s.details}>
              <TicketRow label="Event" value={event.title} bold />
              <TicketRow label="Date" value={event.date} />
              <TicketRow label="Time" value={event.time} />
              <TicketRow label="Venue" value={event.venue} />
              <TicketRow label="Seats" value={booking.seat_labels?.length > 0 ? booking.seat_labels.join(', ') : `${booking.num_tickets} ticket(s)`} highlight />
              <TicketRow label="Booking Ref" value={booking.booking_ref} />
              <TicketRow label="Name" value={booking.username} />
              <div style={s.divider} />
              <TicketRow label="Amount Paid" value={`₹${booking.total_amount?.toFixed(2)}`} bold />
              <TicketRow label="Issued On" value={now} small />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={print} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            🖨️ Print Ticket
          </button>
          <Link to="/my-bookings" className="btn btn-primary" onClick={onClose}
            style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
            📋 My Bookings
          </Link>
        </div>
        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: '#606080', fontSize: 13, cursor: 'pointer', padding: '10px 0', marginTop: 6 }}>
          Close
        </button>
      </div>
    </div>
  );
}

function TicketRow({ label, value, bold, highlight, small }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#8080a0', fontSize: 13 }}>{label}</span>
      <span style={{ color: highlight ? '#a855f7' : bold ? 'white' : '#c0c0d8', fontWeight: bold || highlight ? 700 : 400, fontSize: small ? 11 : 13 }}>{value}</span>
    </div>
  );
}

const s = {
  ticketHeader: { textAlign: 'center', marginBottom: 20 },
  successIcon: { fontSize: 52, display: 'block' },
  ticketNumBox: { background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08))', border: '2px dashed rgba(124,58,237,0.4)', borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 14 },
  ticketNum: { color: '#a855f7', fontSize: 26, fontWeight: 800, letterSpacing: 4, fontFamily: 'monospace' },
  barcode: { height: 50, background: 'white', borderRadius: 8, padding: '6px 12px', display: 'flex', gap: 2, alignItems: 'center', marginBottom: 14, overflow: 'hidden' },
  details: { background: '#0e0e16', borderRadius: 12, padding: '4px 16px' },
  divider: { height: 1, background: 'rgba(124,58,237,0.2)', margin: '8px 0' },
};