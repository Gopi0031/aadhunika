'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, User, Phone, Mail, LogOut,
  Stethoscope, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Users, CalendarDays, Menu, X, Pencil, Check,
} from 'lucide-react';

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor]               = useState(null);
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [editMode, setEditMode]           = useState(false);
  const [editData, setEditData]           = useState({});
  const [saving, setSaving]               = useState(false);
  const [filterStatus, setFilterStatus]   = useState('all');
  const [selectedDate, setSelectedDate]   = useState(
    new Date().toISOString().split('T')[0]
  );

  // ── Auth check ──
// AFTER ✅
useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');

  if (!id) { router.push('/doctor/login'); return; }

  const stored = localStorage.getItem(`doctorSession_${id}`);
  if (!stored) { router.push('/doctor/login'); return; }

  const doc = JSON.parse(stored);
  setDoctor(doc);
  setEditData({ name: doc.name, phone: doc.phone, specialization: doc.specialization });
  fetchBookings(doc.dept, doc._id);
}, []);

  // ✅ FIXED
const fetchBookings = async (dept, docId) => {
  try {
   const url = docId ? `/api/booking?doctorId=${docId}` : `/api/booking?dept=${dept}`;
const res = await fetch(url);
if (!res.ok) throw new Error();
const data = await res.json();
setBookings(data);
    setBookings(data);
  } catch {
    toast.error('Failed to load bookings');
  } finally {
    setLoading(false);
  }
};


const handleLogout = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  if (id) localStorage.removeItem(`doctorSession_${id}`);
  router.push('/doctor/login');
};

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const res = await fetch('/api/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev =>
          prev.map(b => b._id === bookingId
            ? {
                ...b,
                status,
                meetingLink:     data.meetingLink     || b.meetingLink,
                meetingId:       data.meetingId       || b.meetingId,
                meetingPassword: data.meetingPassword || b.meetingPassword,
              }
            : b
          )
        );
        toast.success(
          status === 'confirmed' && data.meetingLink
            ? '✅ Confirmed! Zoom link sent to patient.'
            : `Booking ${status}`
        );
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      const res = await fetch(`/api/doctors?id=${doctor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doctor, ...editData }),
      });
      if (res.ok) {
        const updated = { ...doctor, ...editData };
        localStorage.setItem('doctorSession', JSON.stringify(updated));
        setDoctor(updated);
        setEditMode(false);
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Computed stats ──
  const today             = new Date().toISOString().split('T')[0];
  const todayBookings     = bookings.filter(b => b.date === today);
  const pendingBookings   = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const dateBookings      = bookings.filter(b => b.date === selectedDate);

  // ── Filtered bookings for "All Bookings" tab ──
  const filteredBookings = bookings.filter(b =>
    filterStatus === 'all' ? true : b.status === filterStatus
  );

  if (!doctor) return null;

  // ── Styles ──
  const inp = {
    padding: '10px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1',
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
    width: '100%', boxSizing: 'border-box', background: '#fff',
  };

  const statusColor = (s) => ({
    pending:   { bg: '#FEF3C7', color: '#D97706',  border: '#FDE68A' },
    confirmed: { bg: '#D1FAE5', color: '#059669',  border: '#A7F3D0' },
    cancelled: { bg: '#FEE2E2', color: '#EF4444',  border: '#FECACA' },
    completed: { bg: '#E0F2FE', color: '#0369A1',  border: '#BAE6FD' },
  }[s] || { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard',   icon: TrendingUp  },
    { id: 'schedule',  label: 'My Schedule', icon: CalendarDays },
    { id: 'bookings',  label: 'All Bookings',icon: Calendar    },
    { id: 'profile',   label: 'My Profile',  icon: User        },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#F8FAFC' }}>

      {/* ── SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 260,
        background: 'linear-gradient(180deg, #0F766E 0%, #065F46 100%)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: '#fff',
              }}>
                {doctor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 14 }}>{doctor.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{doctor.dept}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map(item => {
            const active = activeSection === item.id;
            return (
              <button key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10, border: 'none',
                  background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontWeight: active ? 700 : 500, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  textAlign: 'left',
                }}>
                <item.icon size={18} />
                {item.label}
                {item.id === 'bookings' && pendingBookings.length > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#FBBF24', color: '#78350F',
                    borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 800,
                  }}>
                    {pendingBookings.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '11px 14px', borderRadius: 10,
            background: 'rgba(239,68,68,0.2)', border: 'none',
            color: '#FCA5A5', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 0 }}>

        {/* Topbar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #E2E8F0',
          padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#374151' }}>
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                {menuItems.find(m => m.id === activeSection)?.label}
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
                Doctor Portal · {doctor.dept}
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#F0FDFA', border: '1px solid #CCFBF1',
            borderRadius: 10, padding: '8px 14px',
          }}>
            <Stethoscope size={16} color="#0F766E" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F766E' }}>{doctor.name}</span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 'clamp(16px,3vw,32px)', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>
              <div style={{
                width: 40, height: 40, margin: '0 auto 16px',
                border: '3px solid #CCFBF1', borderTopColor: '#0F766E',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Loading your data...
            </div>
          ) : (
            <>
              {/* ══ DASHBOARD HOME ══ */}
              {activeSection === 'dashboard' && (
                <div>
                  {/* Welcome Banner */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0F766E, #059669)',
                    borderRadius: 20, padding: 'clamp(20px,3vw,32px)',
                    marginBottom: 24, color: '#fff',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: 16,
                  }}>
                    <div>
                      <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800 }}>
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
                        {doctor.name.split(' ')[0]}! 👋
                      </h2>
                      <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>
                        {doctor.dept} · {doctor.specialization || 'Specialist'}
                      </p>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9, textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>
                        📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p style={{ margin: '4px 0 0' }}>
                        Today's appointments: <strong>{todayBookings.length}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
                    {[
                      { label: 'Total Bookings',   value: bookings.length,           icon: '📋', color: '#3B82F6' },
                      { label: "Today's Patients", value: todayBookings.length,       icon: '📅', color: '#0F766E' },
                      { label: 'Pending',          value: pendingBookings.length,     icon: '⏳', color: '#D97706' },
                      { label: 'Confirmed',        value: confirmedBookings.length,   icon: '✅', color: '#16A34A' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        background: '#fff', borderRadius: 16, padding: '18px 20px',
                        border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B', fontWeight: 600 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Today's Appointments */}
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: 24,
                    border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                      📅 Today's Appointments
                      <span style={{ fontSize: 12, background: '#F0FDFA', color: '#0F766E', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>
                        {todayBookings.length}
                      </span>
                    </h3>
                    {todayBookings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94A3B8' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                        <p style={{ fontWeight: 600, margin: 0 }}>No appointments today</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {todayBookings.map(b => (
                          <BookingCard key={b._id} booking={b} onStatus={handleUpdateStatus} statusColor={statusColor} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ SCHEDULE ══ */}
              {activeSection === 'schedule' && (
                <div>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>📅 Filter by Date</h3>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      style={{ ...inp, maxWidth: 220 }}
                    />
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                      Appointments on{' '}
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                      <span style={{ marginLeft: 10, fontSize: 13, background: '#F0FDFA', color: '#0F766E', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>
                        {dateBookings.length}
                      </span>
                    </h3>
                    {dateBookings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94A3B8' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                        <p style={{ fontWeight: 600, margin: 0 }}>No appointments on this date</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {dateBookings
                          .sort((a, b) => a.time?.localeCompare(b.time))
                          .map(b => (
                            <BookingCard key={b._id} booking={b} onStatus={handleUpdateStatus} statusColor={statusColor} />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ ALL BOOKINGS ══ */}
              {activeSection === 'bookings' && (
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                      All Bookings — {doctor.dept}
                    </h3>
                    <span style={{ fontSize: 13, background: '#F0FDFA', color: '#0F766E', padding: '4px 14px', borderRadius: 20, fontWeight: 700, border: '1px solid #CCFBF1' }}>
                      {filteredBookings.length} total
                    </span>
                  </div>

                  {/* Status filter pills — now functional */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                    {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(s => {
                      const count = s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length;
                      const active = filterStatus === s;
                      return (
                        <button key={s}
                          onClick={() => setFilterStatus(s)}
                          style={{
                            padding: '5px 14px', borderRadius: 20,
                            border: active ? '2px solid #0F766E' : '1px solid #E2E8F0',
                            background: active ? '#0F766E' : '#F1F5F9',
                            color: active ? '#fff' : '#64748B',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            textTransform: 'capitalize', fontFamily: 'inherit',
                            transition: 'all 0.2s',
                          }}>
                          {s === 'all' ? `All (${count})` : `${s} (${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                      <p style={{ fontWeight: 600, margin: 0 }}>No bookings found</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[...filteredBookings]
                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                        .map(b => (
                          <BookingCard key={b._id} booking={b} onStatus={handleUpdateStatus} statusColor={statusColor} showDate />
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ PROFILE ══ */}
              {activeSection === 'profile' && (
                <div style={{ maxWidth: 600 }}>
                  <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    {/* Profile Header */}
                    <div style={{ background: 'linear-gradient(135deg, #0F766E, #059669)', padding: '32px 28px', textAlign: 'center' }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 auto 14px',
                      }}>
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                      <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: 22, fontWeight: 800 }}>{doctor.name}</h2>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                        {doctor.specialization || doctor.dept} · {doctor.dept}
                      </p>
                    </div>

                    {/* Profile Body */}
                    <div style={{ padding: '28px' }}>
                      {editMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>✏️ Edit Profile</p>
                          {[
                            { label: 'Full Name',       key: 'name',           type: 'text' },
                            { label: 'Phone',           key: 'phone',          type: 'tel'  },
                            { label: 'Specialization',  key: 'specialization', type: 'text' },
                          ].map(f => (
                            <div key={f.key}>
                              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                                {f.label}
                              </label>
                              <input
                                type={f.type}
                                value={editData[f.key] || ''}
                                onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                                style={inp}
                              />
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button onClick={() => setEditMode(false)} style={{
                              flex: 1, padding: '12px', borderRadius: 10,
                              border: '1.5px solid #CBD5E1', background: '#F1F5F9',
                              color: '#64748B', fontWeight: 700, cursor: 'pointer',
                              fontSize: 14, fontFamily: 'inherit',
                            }}>
                              Cancel
                            </button>
                            <button onClick={handleSaveProfile} disabled={saving} style={{
                              flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                              background: 'linear-gradient(135deg,#0F766E,#059669)', color: '#fff',
                              fontWeight: 800, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                              <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {[
                            { icon: <User size={16} />,        label: 'Full Name',        value: doctor.name },
                            { icon: <Mail size={16} />,        label: 'Email',            value: doctor.email },
                            { icon: <Phone size={16} />,       label: 'Phone',            value: doctor.phone || '—' },
                            { icon: <Stethoscope size={16} />, label: 'Department',       value: doctor.dept },
                            { icon: <CheckCircle size={16} />, label: 'Specialization',   value: doctor.specialization || '—' },
                            { icon: <TrendingUp size={16} />,  label: 'Consultation Fee', value: doctor.fee ? `₹${doctor.fee}` : '—' },
                          ].map((row, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                              borderBottom: i < 5 ? '1px solid #F1F5F9' : 'none',
                            }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10, background: '#F0FDFA',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#0F766E', flexShrink: 0,
                              }}>
                                {row.icon}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {row.label}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600, color: '#1E293B' }}>{row.value}</p>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => setEditMode(true)} style={{
                            marginTop: 20, width: '100%', padding: '13px',
                            borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg,#0F766E,#059669)',
                            color: '#fff', fontWeight: 800, fontSize: 15,
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}>
                            <Pencil size={16} /> Edit Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}


// ══════════════════════════════════════
// Booking Card Component
// ══════════════════════════════════════
function BookingCard({ booking: b, onStatus, statusColor, showDate }) {
  const s = statusColor(b.status);

  return (
    <div style={{
      background: '#FAFAFA', borderRadius: 14, padding: '16px 18px',
      border: '1px solid #E2E8F0', display: 'flex',
      justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 12, flexWrap: 'wrap',
    }}>
      {/* LEFT — Patient Info */}
      <div style={{ flex: 1, minWidth: 200 }}>

        {/* Name + Email row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #CCFBF1, #A7F3D0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15, color: '#0F766E', flexShrink: 0,
          }}>
            {b.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{b.name}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>{b.email}</p>
          </div>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {showDate && (
            <span style={{ fontSize: 11, background: '#EFF6FF', color: '#3B82F6', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
              📅 {b.date}
            </span>
          )}
          <span style={{ fontSize: 11, background: '#F0FDFA', color: '#0F766E', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
            🕐 {b.time}
          </span>
          {b.doctorName && (
            <span style={{ fontSize: 11, background: '#F0FDFA', color: '#0F766E', padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: '1px solid #CCFBF1' }}>
              👨‍⚕️ {b.doctorName}
            </span>
          )}
          <span style={{ fontSize: 11, background: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
            {b.appointmentType}
          </span>
          {b.phone && (
            <span style={{ fontSize: 11, background: '#FFF7ED', color: '#C2410C', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
              📱 {b.phone}
            </span>
          )}
          {b.paymentStatus === 'PAID' && (
            <span style={{ fontSize: 11, background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: '1px solid #6EE7B7' }}>
              💳 PAID ₹{b.amountPaid}
            </span>
          )}
        </div>

        {/* Message */}
        {b.message && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748B', background: '#F8FAFC', padding: '6px 10px', borderRadius: 8, borderLeft: '3px solid #CBD5E1' }}>
            💬 {b.message}
          </p>
        )}

        {/* ── Zoom link — confirmed online ── */}
        {b.appointmentType === 'Online' && b.meetingLink && b.status === 'confirmed' && (
          <div style={{
            marginTop: 10, padding: '10px 14px',
            background: '#EFF6FF', borderRadius: 10,
            border: '1.5px solid #93C5FD',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: '#1E40AF' }}>
              📹 ZOOM MEETING LINK
            </p>
            <a href={b.meetingLink} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#2563EB', fontWeight: 600, wordBreak: 'break-all', display: 'block' }}>
              {b.meetingLink}
            </a>
            {b.meetingPassword && (
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#92400E', background: '#FEF3C7', padding: '4px 8px', borderRadius: 6 }}>
                🔐 Password: <strong style={{ fontFamily: 'monospace' }}>{b.meetingPassword}</strong>
              </p>
            )}
          </div>
        )}

        {/* ── Pending online — no zoom yet ── */}
        {b.appointmentType === 'Online' && !b.meetingLink && b.status === 'pending' && (
          <div style={{
            marginTop: 8, padding: '8px 12px',
            background: '#FEF3C7', borderRadius: 8,
            border: '1px solid #FCD34D', fontSize: 11,
            color: '#92400E', fontWeight: 600,
          }}>
            ⚠️ Zoom link will be auto-created when you confirm
          </div>
        )}
      </div>

      {/* RIGHT — Status + Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>

        {/* Status Badge */}
        <span style={{
          fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20,
          background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          textTransform: 'capitalize',
        }}>
          {b.status || 'pending'}
        </span>

        {/* Pending actions */}
        {(b.status === 'pending' || !b.status) && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onStatus(b._id, 'confirmed')} style={{
              background: '#D1FAE5', color: '#059669', border: 'none',
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <CheckCircle size={13} />
              {b.appointmentType === 'Online' ? 'Confirm + Zoom' : 'Confirm'}
            </button>
            <button onClick={() => onStatus(b._id, 'cancelled')} style={{
              background: '#FEE2E2', color: '#EF4444', border: 'none',
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <XCircle size={13} /> Cancel
            </button>
          </div>
        )}

        {/* Confirmed → Mark Complete */}
        {b.status === 'confirmed' && (
          <button onClick={() => onStatus(b._id, 'completed')} style={{
            background: '#E0F2FE', color: '#0369A1', border: 'none',
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <CheckCircle size={13} /> Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
