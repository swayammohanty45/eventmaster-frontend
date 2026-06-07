import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.password2) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await register(form);
      nav('/events');
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join('. ') : 'Registration failed. Try a different username.');
    }
    setLoading(false);
  };

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.card}>
        <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>🎪</div>
        <h2 style={s.title}>Create your account</h2>
        <p style={s.sub}>Already have one? <Link to="/login" style={s.link}>Sign in</Link></p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={submit} style={s.form}>
          <div style={s.row}>
            <Field label="First Name" {...f('first_name')} placeholder="John" />
            <Field label="Last Name" {...f('last_name')} placeholder="Doe" />
          </div>
          <Field label="Username *" {...f('username')} placeholder="johndoe" required />
          <Field label="Email *" type="email" {...f('email')} placeholder="john@example.com" required />
          <Field label="Password *" type="password" {...f('password')} placeholder="Min. 6 characters" required />
          <Field label="Confirm Password *" type="password" {...f('password2')} placeholder="Re-enter password" required />
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0b8', marginBottom: 6 }}>{label}</label>
      <input {...props} />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse,rgba(124,58,237,0.12),transparent 60%)', pointerEvents: 'none' },
  card: { background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '44px 40px', maxWidth: 500, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1, textAlign: 'center' },
  title: { fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6 },
  sub: { color: '#a0a0b8', fontSize: 14, marginBottom: 24 },
  link: { color: '#a855f7', textDecoration: 'none', fontWeight: 600 },
  err: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: 10, fontSize: 14, marginBottom: 16, textAlign: 'left' },
  form: { display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
};
