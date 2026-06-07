import React, { useState, useEffect } from 'react';
import API from '../api/client';
import bharatpeQR from '../bharatpe_qr.png';

const UPI_ID = 'BHARATPE2C0T0Z1G2A51103@unitype';

export default function PaymentGateway({ booking, onSuccess, onClose }) {
  const [step, setStep] = useState('qr');      // qr → utr → submitted
  const [utr, setUtr] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(600);     // 10 min countdown

  // Countdown timer
  useEffect(() => {
    if (step !== 'qr') return;
    const t = setInterval(() => setTimer(p => {
      if (p <= 1) { clearInterval(t); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [step]);

  const mins = String(Math.floor(timer / 60)).padStart(2, '0');
  const secs = String(timer % 60).padStart(2, '0');

  const amount = booking.total_amount?.toFixed(2);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=EventMaster&am=${amount}&cu=INR&tn=Booking-${booking.booking_ref}`;

  const openUpiApp = (app) => {
    const links = {
      gpay:    `tez://upi/pay?pa=${UPI_ID}&pn=EventMaster&am=${amount}&cu=INR`,
      phonepe: `phonepe://pay?pa=${UPI_ID}&pn=EventMaster&am=${amount}&cu=INR`,
      paytm:   `paytmmp://pay?pa=${UPI_ID}&pn=EventMaster&am=${amount}&cu=INR`,
      bhim:    `upi://pay?pa=${UPI_ID}&pn=EventMaster&am=${amount}&cu=INR`,
    };
    window.location.href = links[app];
  };

  const handleSubmitUTR = async () => {
    if (!utr.trim()) return setError('Please enter UTR / Transaction ID');
    if (utr.trim().length < 6) return setError('UTR must be at least 6 characters');
    setSubmitting(true); setError('');
    try {
      await API.post(`/bookings/${booking.id}/submit-utr/`, { utr_number: utr.trim() });
      setStep('submitted');
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || 'Submission failed. Try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="payment-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="payment-modal" style={{ maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* ── STEP 1: QR + UPI Apps ── */}
        {step === 'qr' && (
          <div className="pop-in">
            {/* Header */}
            <div style={s.header}>
              <div>
                <h3 style={s.title}>Pay via UPI</h3>
                <p style={s.sub}>{booking.event?.title}</p>
              </div>
              <button onClick={onClose} style={s.closeBtn}>✕</button>
            </div>

            {/* Amount */}
            <div style={s.amountBox}>
              <div>
                <p style={{ color: '#a0a0b8', fontSize: 12, marginBottom: 4 }}>Amount to Pay</p>
                <p style={{ color: 'white', fontSize: 32, fontWeight: 800 }}>₹{amount}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#a0a0b8', fontSize: 12, marginBottom: 4 }}>Expires in</p>
                <p style={{ color: timer < 60 ? '#f43f5e' : '#f59e0b', fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>
                  {mins}:{secs}
                </p>
              </div>
            </div>

            
            {/* QR Code */}
<div style={s.qrBox}>
  {/* Amount reminder - BIG and clear */}
  <div style={{
    background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))',
    border: '2px solid rgba(168,85,247,0.5)',
    borderRadius: 12, padding: '12px 16px',
    textAlign: 'center', marginBottom: 16
  }}>
    <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
      ⚠️ ENTER THIS AMOUNT WHEN SCANNING
    </p>
    <p style={{ color: 'white', fontSize: 36, fontWeight: 800 }}>₹{amount}</p>
    <p style={{ color: '#a0a0b8', fontSize: 12 }}>
      {booking.num_tickets} ticket{booking.num_tickets > 1 ? 's' : ''} × ₹{booking.event?.price}
    </p>
  </div>

  <p style={{ color: '#a0a0b8', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
    Scan QR code with any UPI app
  </p>
  <div style={s.qrFrame}>
    <QRDisplay upiId={UPI_ID} amount={amount} ref_={booking.booking_ref} />
  </div>
  <div style={s.upiIdBox}>
    <span style={{ color: '#8080a0', fontSize: 12 }}>UPI ID</span>
    <span style={{ color: '#a855f7', fontWeight: 700, fontSize: 14 }}>{UPI_ID}</span>
  </div>
</div>
            {/* UPI App buttons */}
            <p style={{ color: '#a0a0b8', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
              — or pay directly with —
            </p>
            <div style={s.upiApps}>
              {[
                { id: 'gpay',    name: 'Google Pay', color: '#4285F4', emoji: '🔵' },
                { id: 'phonepe', name: 'PhonePe',    color: '#5f259f', emoji: '🟣' },
                { id: 'paytm',   name: 'Paytm',      color: '#00BAF2', emoji: '🔷' },
                { id: 'bhim',    name: 'BHIM',        color: '#FF6B35', emoji: '🟠' },
              ].map(app => (
                <button key={app.id} onClick={() => openUpiApp(app.id)} style={{ ...s.appBtn, borderColor: app.color + '40' }}>
                  <span style={{ fontSize: 24 }}>{app.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#c0c0d8' }}>{app.name}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setStep('utr')} className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
              ✅ I've Paid — Enter Transaction ID
            </button>
            <p style={{ color: '#606080', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
              After payment, enter your UTR/Transaction ID for verification
            </p>
          </div>
        )}

        {/* ── STEP 2: Enter UTR ── */}
        {step === 'utr' && (
          <div className="pop-in">
            <div style={s.header}>
              <button onClick={() => setStep('qr')} style={s.backBtn}>← Back</button>
              <button onClick={onClose} style={s.closeBtn}>✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48 }}>🧾</div>
              <h3 style={s.title2}>Enter Transaction ID</h3>
              <p style={{ color: '#8080a0', fontSize: 14, marginTop: 6 }}>
                Enter the UTR / Transaction ID from your UPI app after payment
              </p>
            </div>

            {/* How to find UTR */}
            <div style={s.helpBox}>
              <p style={{ color: '#f59e0b', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📱 How to find UTR?</p>
              {[
                'GPay → Transaction History → select payment → copy 12-digit UTR',
                'PhonePe → History → select payment → Transaction ID',
                'Paytm → Passbook → select payment → UTR Number',
              ].map((tip, i) => (
                <p key={i} style={{ color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>• {tip}</p>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.lbl}>UTR / Transaction ID *</label>
              <input
                value={utr}
                onChange={e => setUtr(e.target.value)}
                placeholder="e.g. 426912345678"
                style={{ fontSize: 16, letterSpacing: 1, fontFamily: 'monospace' }}
              />
            </div>

            <div style={s.summaryBox}>
              <SummaryRow label="Booking Ref" value={booking.booking_ref} />
              <SummaryRow label="Event" value={booking.event?.title} />
              <SummaryRow label="Tickets" value={`${booking.num_tickets} ticket${booking.num_tickets > 1 ? 's' : ''}`} />
              <SummaryRow label="Amount Paid" value={`₹${amount}`} highlight />
              <SummaryRow label="UPI ID" value={UPI_ID} small />
            </div>

            {error && <div style={s.errBox}>{error}</div>}

            <button onClick={handleSubmitUTR} disabled={submitting} className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
              {submitting ? '⏳ Submitting...' : '🔒 Submit for Verification'}
            </button>
            <p style={{ color: '#606080', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
              Admin will verify your payment within a few minutes
            </p>
          </div>
        )}

        {/* ── STEP 3: Submitted ── */}
        {step === 'submitted' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }} className="pop-in">
            <div style={{ fontSize: 56 }} className="float">⏳</div>
            <h3 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginTop: 20 }}>
              Payment Submitted!
            </h3>
            <p style={{ color: '#a0a0b8', marginTop: 10, lineHeight: 1.7 }}>
              Your UTR has been submitted.<br />
              Admin will verify and confirm your ticket shortly.
            </p>
            <div style={s.statusBox}>
              <div style={s.statusRow}>
                <span style={s.statusDot} />
                <span style={{ color: '#f59e0b', fontSize: 14 }}>Pending Admin Verification</span>
              </div>
              <p style={{ color: '#8080a0', fontSize: 12, marginTop: 8 }}>Check My Bookings for updates</p>
            </div>
            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: 20 }}>
              View My Bookings →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Simple QR visual component
 
import { QRCodeSVG } from 'qrcode.react';

function QRDisplay({ upiId, amount, ref_ }) {
  const upiString = `upi://pay?pa=${upiId}&pn=Swayam+Mohanty&am=${amount}&cu=INR&tn=${ref_}&mc=0000`;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 200, height: 200, margin: '0 auto',
        background: 'white', borderRadius: 12, padding: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <QRCodeSVG
          value={upiString}
          size={176}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
        />
      </div>
      <p style={{ color: '#8080a0', fontSize: 11, marginTop: 8 }}>Ref: {ref_}</p>
    </div>
  );
}

function SummaryRow({ label, value, highlight, small }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#8080a0', fontSize: 13 }}>{label}</span>
      <span style={{ color: highlight ? '#10b981' : '#c0c0d8', fontWeight: highlight ? 700 : 400, fontSize: small ? 11 : 13 }}>{value}</span>
    </div>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { color: 'white', fontSize: 20, fontWeight: 700 },
  title2: { color: 'white', fontSize: 22, fontWeight: 700, marginTop: 10 },
  sub: { color: '#8080a0', fontSize: 13, marginTop: 3 },
  closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: 8, fontSize: 14, cursor: 'pointer', flexShrink: 0 },
  backBtn: { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c084fc', padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  amountBox: { background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  qrBox: { background: '#0e0e16', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, marginBottom: 16 },
  qrFrame: { marginBottom: 16 },
  upiIdBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '10px 14px' },
  upiApps: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 },
  appBtn: { background: '#1a1a26', border: '1px solid', borderRadius: 12, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' },
  helpBox: { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 16, marginBottom: 18 },
  lbl: { display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0b8', marginBottom: 8 },
  summaryBox: { background: '#0e0e16', borderRadius: 12, padding: '4px 16px' },
  errBox: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginTop: 12 },
  statusBox: { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 16, marginTop: 20 },
  statusRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulseGlow 1.5s infinite' },
};