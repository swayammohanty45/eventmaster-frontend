import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.username, form.password);
      nav(user.profile?.role === 'admin' ? '/admin' : '/events');
    } catch {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.card}>
        <div style={s.left}>
          <div style={s.tag}>✦ Event Platform</div>
          <h1 style={s.title}>Welcome<br />back.</h1>
          <p style={s.sub}>Your next unforgettable experience is just a login away.</p>
          {['Book events instantly', 'Track your tickets', 'Save to wishlist'].map(f => (
            <div key={f} style={s.feat}>
              <span style={s.dot} /> {f}
            </div>
          ))}
        </div>
        <div style={s.right}>
          <h2 style={s.formTitle}>Sign In</h2>
          <p style={s.formSub}>New here? <Link to="/register" style={s.link}>Create account</Link></p>
          {error && <div style={s.err}>{error}</div>}
          <form onSubmit={submit} style={s.form}>
            <div>
              <label style={s.lbl}>Username</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Enter username" required />
            </div>
            <div>
              <label style={s.lbl}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', top: '-30%', left: '30%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(124,58,237,0.15),transparent 60%)', pointerEvents: 'none' },
  card: { display: 'flex', maxWidth: 820, width: '100%', background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 },
  left: { flex: '1.1', background: 'linear-gradient(135deg,#1a0a3e,#0d1a2e)', padding: '56px 44px', display: 'flex', flexDirection: 'column', gap: 20 },
  tag: { display: 'inline-block', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)', color: '#c084fc', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, width: 'fit-content' },
  title: { fontFamily: 'Syne,sans-serif', fontSize: 44, fontWeight: 800, color: 'white', lineHeight: 1.1 },
  sub: { color: '#8080a0', fontSize: 14, lineHeight: 1.6 },
  feat: { color: '#a0a0b8', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, display: 'inline-block' },
  right: { flex: 1, padding: '56px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  formTitle: { fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6 },
  formSub: { color: '#a0a0b8', fontSize: 14, marginBottom: 24 },
  link: { color: '#a855f7', textDecoration: 'none', fontWeight: 600 },
  err: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: 10, fontSize: 14, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  lbl: { display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0b8', marginBottom: 6 },
};
