import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './pages/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import MyBookings from './pages/MyBookings';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminBookings from './pages/AdminBookings';

function Guard({ children, adminOnly }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}><div className="spinner"/></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/events" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/events" : "/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Guard><EventList /></Guard>} />
        <Route path="/events/:id" element={<Guard><EventDetail /></Guard>} />
        <Route path="/my-bookings" element={<Guard><MyBookings /></Guard>} />
        <Route path="/wishlist" element={<Guard><Wishlist /></Guard>} />
        <Route path="/admin" element={<Guard adminOnly><AdminDashboard /></Guard>} />
        <Route path="/admin/events" element={<Guard adminOnly><AdminEvents /></Guard>} />
        <Route path="/admin/bookings" element={<Guard adminOnly><AdminBookings /></Guard>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
