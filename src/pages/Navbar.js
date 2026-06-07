import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  if (!user) return null;
  const active = path => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav style={s.nav}>
      <Link to="/events" style={s.logo}>⚡ EventMaster</Link>
      <div style={s.links}>
        <NavLink to="/events" label="Events" active={active('/events') && !pathname.startsWith('/admin')} />
        <NavLink to="/my-bookings" label="My Bookings" active={active('/my-bookings')} />
        <NavLink to="/wishlist" label="Wishlist" active={active('/wishlist')} />
        {isAdmin && <NavLink to="/admin" label="Dashboard" active={active('/admin')} />}
      </div>
      <div style={s.right}>
        <div style={s.avatar}>{user.username[0].toUpperCase()}</div>
        <span style={s.uname}>{user.username}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => { logout(); nav('/login'); }}>Logout</button>
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{ ...s.link, ...(active ? s.linkActive : {}) }}>{label}</Link>
  );
}

const s = {
  nav: { background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', padding: '0 32px', height: 60, gap: 32 },
  logo: { fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: '#f0f0f8', textDecoration: 'none', flexShrink: 0 },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: { textDecoration: 'none', color: '#a0a0b8', padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  linkActive: { color: '#c084fc', background: 'rgba(124,58,237,0.15)' },
  right: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 },
  uname: { color: '#c0c0d8', fontSize: 13, fontWeight: 500 },
};
