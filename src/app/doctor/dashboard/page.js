'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Calendar, User, Phone, Mail, LogOut,
  Stethoscope, CheckCircle, XCircle,
  TrendingUp, CalendarDays, Menu, X, Pencil, Check,
  Clock, Activity, ChevronRight, Bell, RefreshCw
} from 'lucide-react';

/* ── Spinner keyframe injected once ── */
const SpinnerStyle = () => (
  <style>{`
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes expandIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
    .dd-fade { animation: fadeSlideUp 0.35s ease both; }
    .dd-expand { animation: expandIn 0.2s ease both; }
    .dd-nav-btn:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
    .dd-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .dd-booking-row:hover { background: #F8FAFC !important; }
    .dd-pill:hover { border-color: #0F766E !important; color: #0F766E !important; }
    .dd-action-btn:hover { filter: brightness(0.93); transform: translateY(-1px); }
    .dd-zoom-link:hover { text-decoration: underline; }
  `}</style>
);

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

  // 🔥 RESCHEDULE STATE
  const [rescheduleData, setRescheduleData] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { router.push('/login'); return; }
    const stored = localStorage.getItem(`doctorSession_${id}`);
    if (!stored) { router.push('/login'); return; }
    const doc = JSON.parse(stored);
    setDoctor(doc);
    setEditData({ name: doc.name, phone: doc.phone, specialization: doc.specialization });
    fetchBookings(doc.dept, doc._id);
  }, []);

  const fetchBookings = async (dept, docId) => {
    try {
      const url = docId ? `/api/booking?doctorId=${docId}` : `/api/booking?dept=${dept}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) localStorage.removeItem(`doctorSession_${id}`);
    router.push('/login');
  };

  const handleUpdateStatus = async (bookingId, status, extraData = {}) => {
    try {
      const res = await fetch('/api/booking', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status, ...extraData }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b._id === bookingId
          ? { ...b, status,
              meetingLink:     data.meetingLink     || b.meetingLink,
              meetingId:       data.meetingId       || b.meetingId,
              meetingPassword: data.meetingPassword || b.meetingPassword,
              date:            data.newDate         || b.date,
              time:            data.newTime         || b.time,
            } : b
        ));
        toast.success(
          status === 'rescheduled' ? '✅ Appointment Rescheduled!' :
          status === 'confirmed' && data.meetingLink ? '✅ Confirmed! Zoom link sent.' : 
          `Booking ${status}`
        );
        setRescheduleData(null); // Close modal
      } else {
        toast.error('Failed to update status');
      }
    } catch { toast.error('Failed to update status'); }
  };

  // 🔥 RESCHEDULE LOGIC
  const openRescheduleModal = (booking) => {
    setRescheduleData({ booking, date: '', time: '', reason: '', slots: [], loadingSlots: false });
  };

  const fetchAvailableSlots = async (dateStr, dept) => {
    setRescheduleData(prev => ({ ...prev, date: dateStr, time: '', loadingSlots: true }));
    try {
      const res = await fetch(`/api/slots?date=${dateStr}&department=${encodeURIComponent(dept)}`);
      const data = await res.json();
      if (data.slots) {
        const available = data.slots.filter(s => s.status !== 'closed' && s.status !== 'booked');
        setRescheduleData(prev => ({ ...prev, slots: available }));
      } else {
        setRescheduleData(prev => ({ ...prev, slots: [] }));
      }
    } catch {
      toast.error('Failed to fetch slots');
    } finally {
      setRescheduleData(prev => ({ ...prev, loadingSlots: false }));
    }
  };

  const submitReschedule = () => {
    if (!rescheduleData.date || !rescheduleData.time) return toast.error('Select new date and time');
    handleUpdateStatus(rescheduleData.booking._id, 'rescheduled', {
      newDate: rescheduleData.date,
      newTime: rescheduleData.time,
      cancelReason: rescheduleData.reason
    });
  };

  const handleSaveProfile = async () => {
    if (!editData.name?.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      const res = await fetch(`/api/doctors?id=${doctor._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doctor, ...editData }),
      });
      if (res.ok) {
        const updated = { ...doctor, ...editData };
        localStorage.setItem(`doctorSession_${doctor._id}`, JSON.stringify(updated));
        setDoctor(updated); setEditMode(false);
        toast.success('Profile updated!');
      }
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const today             = new Date().toISOString().split('T')[0];
  const todayBookings     = bookings.filter(b => b.date === today);
  const pendingBookings   = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const dateBookings      = bookings.filter(b => b.date === selectedDate);
  const filteredBookings  = filterStatus === 'all'
    ? bookings : bookings.filter(b => b.status === filterStatus);

  const greeting = new Date().getHours() < 12 ? 'Morning'
    : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  const statusMeta = (s) => ({
    pending:     { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
    confirmed:   { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
    rescheduled: { bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' },
    cancelled:   { bg: '#FEE2E2', color: '#EF4444', border: '#FECACA' },
    completed:   { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
  }[s] || { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'schedule', label: 'My Schedule', icon: CalendarDays },
    { id: 'bookings', label: 'All Bookings', icon: Calendar },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  if (!doctor) return null;

  /* ── inline styles object S ── */
  const S = {
    root: { display:'flex', minHeight:'100vh', fontFamily:"'Segoe UI',sans-serif", background:'#F1F5F9', color:'#0F172A' },
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:40 },
    sidebar: (open) => ({
      width: 260,
      background:'linear-gradient(180deg,#0F766E 0%,#065F46 100%)',
      display:'flex', flexDirection:'column', flexShrink:0,
      position:'fixed', top:0, left:0, bottom:0, zIndex:50,
      transform: open ? 'translateX(0)' : 'translateX(-100%)',
      transition:'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
      boxShadow:'4px 0 24px rgba(0,0,0,0.18)',
    }),
    sidebarHeader: {
      padding:'22px 16px 18px', borderBottom:'1px solid rgba(255,255,255,0.1)',
      display:'flex', alignItems:'center', gap:12,
    },
    avatarLg: {
      width:46, height:46, borderRadius:14, flexShrink:0,
      background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.3)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:20, fontWeight:800, color:'#fff',
    },
    navBtn: (active) => ({
      display:'flex', alignItems:'center', gap:11,
      padding:'11px 13px', borderRadius:11, border:'none',
      background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
      color: active ? '#fff' : 'rgba(255,255,255,0.65)',
      fontWeight: active ? 700 : 500, fontSize:14,
      cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      transition:'all 0.2s', width:'100%',
    }),
    logoutBtn: {
      display:'flex', alignItems:'center', gap:9, width:'100%',
      padding:'11px 13px', borderRadius:11,
      background:'rgba(239,68,68,0.18)', border:'none',
      color:'#FCA5A5', fontWeight:700, fontSize:14,
      cursor:'pointer', fontFamily:'inherit', marginTop:8,
    },
    topbar: {
      background:'#fff', borderBottom:'1px solid #E2E8F0',
      padding:'0 20px', height:64,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      position:'sticky', top:0, zIndex:30,
      boxShadow:'0 1px 6px rgba(0,0,0,0.05)', gap:12,
    },
    iconBtn: {
      background:'none', border:'none', cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#64748B', padding:6, borderRadius:8,
    },
    doctorChip: {
      display:'flex', alignItems:'center', gap:8,
      background:'#F0FDFA', border:'1px solid #CCFBF1',
      borderRadius:10, padding:'6px 12px',
    },
    avatarSm: {
      width:26, height:26, borderRadius:8,
      background:'#0F766E', color:'#fff',
      fontSize:12, fontWeight:800,
      display:'flex', alignItems:'center', justifyContent:'center',
    },
    card: {
      background:'#fff', borderRadius:18, border:'1px solid #E2E8F0',
      boxShadow:'0 2px 10px rgba(0,0,0,0.04)', overflow:'hidden',
    },
    cardHeader: {
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'18px 22px', borderBottom:'1px solid #E2E8F0', gap:10,
    },
    cardTitle: {
      display:'flex', alignItems:'center', gap:8,
      fontSize:15, fontWeight:800, color:'#0F172A', margin:0,
    },
    countChip: {
      background:'#F0FDFA', color:'#0F766E', border:'1px solid #CCFBF1',
      borderRadius:20, padding:'2px 12px', fontSize:12, fontWeight:800,
    },
    statCard: {
      background:'#fff', borderRadius:16, padding:'20px 18px',
      border:'1px solid #E2E8F0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
      position:'relative', overflow:'hidden', cursor:'default',
      transition:'transform 0.2s ease, box-shadow 0.2s ease',
    },
    input: {
      padding:'10px 14px', borderRadius:10,
      border:'1.5px solid #CBD5E1', fontSize:14,
      fontFamily:'inherit', outline:'none',
      width:'100%', boxSizing:'border-box', background:'#fff',
      color:'#0F172A',
    },
    btnPrimary: {
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      padding:'12px 20px', borderRadius:11, border:'none',
      background:'linear-gradient(135deg,#0F766E,#059669)',
      color:'#fff', fontWeight:800, fontSize:14,
      cursor:'pointer', fontFamily:'inherit',
    },
    btnGhost: {
      padding:'12px 20px', borderRadius:11,
      border:'1.5px solid #CBD5E1', background:'#F1F5F9',
      color:'#64748B', fontWeight:700, fontSize:14,
      cursor:'pointer', fontFamily:'inherit',
    },
  };

  return (
    <div style={S.root}>
      <SpinnerStyle />

      {/* ── RESCHEDULE MODAL ── */}
      {rescheduleData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="dd-fade" style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 450, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #D97706, #B45309)', padding: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🔄 Reschedule Appointment</h3>
              <button onClick={() => setRescheduleData(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#475569' }}>
                Rescheduling <strong>{rescheduleData.booking.name}</strong> ({rescheduleData.booking.department}).
              </p>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>New Date *</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} value={rescheduleData.date} onChange={e => fetchAvailableSlots(e.target.value, rescheduleData.booking.department)} style={{ ...S.input, marginBottom: 16 }} />

              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>New Time Slot *</label>
              {rescheduleData.loadingSlots ? (
                <div style={{ padding: 10, color: '#64748B', fontSize: 13, background: '#F1F5F9', borderRadius: 8, marginBottom: 16 }}>Loading slots...</div>
              ) : rescheduleData.date ? (
                rescheduleData.slots.length > 0 ? (
                  <select value={rescheduleData.time} onChange={e => setRescheduleData(prev => ({ ...prev, time: e.target.value }))} style={{ ...S.input, marginBottom: 16 }}>
                    <option value="">-- Select Time --</option>
                    {rescheduleData.slots.map(s => <option key={s.time} value={s.time}>{s.time}</option>)}
                  </select>
                ) : (
                  <div style={{ padding: 10, color: '#DC2626', fontSize: 13, background: '#FEF2F2', borderRadius: 8, marginBottom: 16 }}>No slots available on this date.</div>
                )
              ) : (
                <div style={{ padding: 10, color: '#64748B', fontSize: 13, background: '#F1F5F9', borderRadius: 8, marginBottom: 16 }}>Select a date first</div>
              )}

              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Reason for Rescheduling (Sent to Patient)</label>
              <textarea rows={2} value={rescheduleData.reason} onChange={e => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))} placeholder="e.g. Doctor in surgery..." style={{ ...S.input, resize: 'none', marginBottom: 20 }} />

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setRescheduleData(null)}>Cancel</button>
                <button style={{ ...S.btnPrimary, flex: 1, background: 'linear-gradient(135deg, #D97706, #B45309)' }} onClick={submitReschedule}>Confirm Reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {sidebarOpen && <div style={S.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar(sidebarOpen)}>
        <div style={S.sidebarHeader}>
          <div style={S.avatarLg}>{doctor.name.charAt(0).toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ margin:0, fontWeight:700, color:'#fff', fontSize:14,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {doctor.name}
            </p>
            <p style={{ margin:'2px 0 0', fontSize:11, color:'rgba(255,255,255,0.65)' }}>
              {doctor.dept}
            </p>
            <span style={{ fontSize:10, color:'#6EE7B7', fontWeight:700 }}>● Online</span>
          </div>
          <button style={S.iconBtn} onClick={() => setSidebarOpen(false)}>
            <X size={18} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:3, overflowY:'auto' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'schedule', label: 'My Schedule', icon: CalendarDays },
            { id: 'bookings', label: 'All Bookings', icon: Calendar },
            { id: 'profile', label: 'My Profile', icon: User },
          ].map(item => (
            <button
              key={item.id}
              style={S.navBtn(activeSection===item.id)}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={17} />
              <span style={{ flex:1 }}>{item.label}</span>
              {item.id === 'bookings' && pendingBookings.length > 0 && (
                <span style={{ background:'#FBBF24', color:'#78350F', borderRadius:20,
                  padding:'1px 8px', fontSize:11, fontWeight:800 }}>
                  {pendingBookings.length}
                </span>
              )}
              <ChevronRight size={13} color="rgba(255,255,255,0.4)" />
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding:'14px 10px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 8px',
            fontSize:12, color:'rgba(255,255,255,0.6)' }}>
            <span>Total Seen</span>
            <strong style={{ color:'#fff' }}>{completedBookings.length}</strong>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 8px',
            fontSize:12, color:'rgba(255,255,255,0.6)' }}>
            <span>Pending</span>
            <strong style={{ color:'#FBBF24' }}>{pendingBookings.length}</strong>
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar */}
        <header style={S.topbar}>
          <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
            <button style={S.iconBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div style={{ minWidth:0 }}>
              <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:'#0F172A',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {menuItems.find(m => m.id === activeSection)?.label}
              </h1>
              <p style={{ margin:0, fontSize:11, color:'#64748B' }}>Doctor Portal · {doctor.dept}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            {pendingBookings.length > 0 && (
              <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:10, background:'#FEF3C7', color:'#D97706', cursor:'pointer' }}>
                <Bell size={17} />
                <span style={{ position:'absolute', top:-4, right:-4, background:'#EF4444', color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {pendingBookings.length}
                </span>
              </div>
            )}
            <div style={S.doctorChip}>
              <div style={S.avatarSm}>{doctor.name.charAt(0)}</div>
              <span style={{ fontSize:13, fontWeight:700, color:'#0F766E' }}>
                {doctor.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, padding:'clamp(16px,3vw,28px)', maxWidth:1080, width:'100%', margin:'0 auto' }}>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:80, color:'#64748B', gap:16 }}>
              <div style={{ width:38, height:38, border:'3px solid #CCFBF1', borderTopColor:'#0F766E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <p style={{ fontWeight:600, margin:0 }}>Loading your data...</p>
            </div>
          ) : (
            <>
              {/* ══ DASHBOARD ══ */}
              {activeSection === 'dashboard' && (
                <div className="dd-fade">
                  {/* Welcome Banner */}
                  <div style={{
                    background:'linear-gradient(135deg,#0F766E,#059669,#0284C7)',
                    borderRadius:20, padding:'clamp(20px,3vw,30px)',
                    marginBottom:22, color:'#fff',
                    display:'flex', justifyContent:'space-between',
                    alignItems:'center', flexWrap:'wrap', gap:16,
                    position:'relative', overflow:'hidden',
                  }}>
                    <div>
                      <h2 style={{ margin:'0 0 6px', fontSize:'clamp(17px,3vw,22px)', fontWeight:800 }}>
                        Good {greeting}, {doctor.name.split(' ')[0]}! 👋
                      </h2>
                      <p style={{ margin:0, fontSize:13, opacity:0.82 }}>
                        {doctor.dept} · {doctor.specialization || 'Specialist'}
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ margin:0, fontWeight:800, fontSize:15 }}>
                        {new Date().toLocaleDateString('en-IN', { weekday:'long' })}
                      </p>
                      <p style={{ margin:'3px 0 0', fontSize:12, opacity:0.8 }}>
                        {new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end',
                        marginTop:7, background:'rgba(255,255,255,0.15)',
                        padding:'4px 10px', borderRadius:20, fontSize:12 }}>
                        <Clock size={12} /> {todayBookings.length} today
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',
                    gap:14, marginBottom:22 }}>
                    {[
                      { label:'Total Bookings',   value:bookings.length,          icon:'📋', color:'#3B82F6', bar:'#3B82F6' },
                      { label:"Today's Patients", value:todayBookings.length,      icon:'📅', color:'#0F766E', bar:'#0F766E' },
                      { label:'Pending',          value:pendingBookings.length,    icon:'⏳', color:'#D97706', bar:'#FBBF24' },
                      { label:'Confirmed',        value:confirmedBookings.length,  icon:'✅', color:'#059669', bar:'#059669' },
                    ].map((s, i) => (
                      <div key={i} style={S.statCard} className="dd-stat-card">
                        <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
                        <div style={{ fontSize:30, fontWeight:900, color:s.color }}>{s.value}</div>
                        <div style={{ fontSize:12, color:'#64748B', fontWeight:600, marginTop:4 }}>{s.label}</div>
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:s.bar, borderRadius:'0 0 16px 16px' }} />
                      </div>
                    ))}
                  </div>

                  {/* Today's appointments */}
                  <div style={S.card}>
                    <div style={S.cardHeader}>
                      <h3 style={S.cardTitle}><CalendarDays size={17} /> Today's Appointments</h3>
                      <span style={S.countChip}>{todayBookings.length}</span>
                    </div>
                    {todayBookings.length === 0
                      ? <EmptyState icon="🎉" msg="No appointments today — enjoy your day!" />
                      : todayBookings.map(b => (
                          <BookingCard key={b._id} booking={b} onStatus={handleUpdateStatus} onReschedule={openRescheduleModal} statusMeta={statusMeta} />
                        ))}
                  </div>
                </div>
              )}

              {/* ══ SCHEDULE ══ */}
              {activeSection === 'schedule' && (
                <div className="dd-fade">
                  <div style={{ ...S.card, marginBottom:20 }}>
                    <div style={S.cardHeader}>
                      <h3 style={S.cardTitle}><CalendarDays size={17} /> Pick a Date</h3>
                    </div>
                    <div style={{ padding:'16px 22px 20px' }}>
                      <input
                        type="date" value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        style={{ ...S.input, maxWidth:240 }}
                      />
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeader}>
                      <h3 style={S.cardTitle}>
                        <Activity size={17} />
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday:'long', day:'numeric', month:'long', year:'numeric',
                        })}
                      </h3>
                      <span style={S.countChip}>{dateBookings.length}</span>
                    </div>
                    {dateBookings.length === 0
                      ? <EmptyState icon="📭" msg="No appointments on this date" />
                      : [...dateBookings]
                          .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                          .map(b => (
                            <BookingCard key={b._id} booking={b} onStatus={handleUpdateStatus} onReschedule={openRescheduleModal} statusMeta={statusMeta} />
                          ))}
                  </div>
                </div>
              )}

              {/* ══ ALL BOOKINGS ══ */}
              {activeSection === 'bookings' && (
                <div className="dd-fade" style={S.card}>
                  <div style={S.cardHeader}>
                    <h3 style={S.cardTitle}><Calendar size={17} /> All Bookings</h3>
                    <span style={S.countChip}>{filteredBookings.length}</span>
                  </div>

                  {/* Filter pills */}
                  <div style={{ display:'flex', gap:7, flexWrap:'wrap',
                    padding:'14px 22px', borderBottom:'1px solid #E2E8F0' }}>
                    {['all','pending','confirmed','rescheduled','cancelled','completed'].map(s => {
                      const count = s === 'all' ? bookings.length
                        : bookings.filter(b => b.status === s).length;
                      const active = filterStatus === s;
                      return (
                        <button key={s}
                          style={{
                            display:'flex', alignItems:'center', gap:5,
                            padding:'5px 13px', borderRadius:20,
                            border: active ? '2px solid #0F766E' : '1.5px solid #E2E8F0',
                            background: active ? '#0F766E' : '#F1F5F9',
                            color: active ? '#fff' : '#64748B',
                            fontSize:12, fontWeight:700, cursor:'pointer',
                            fontFamily:'inherit', transition:'all 0.2s', whiteSpace:'nowrap',
                          }}>
                          {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                          <span style={{
                            background: active ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                            color: active ? '#fff' : '#64748B',
                            borderRadius:20, padding:'0 6px', fontSize:10, fontWeight:800,
                          }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {filteredBookings.length === 0
                    ? <EmptyState icon="📋" msg="No bookings found" />
                    : [...filteredBookings]
                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                        .map(b => (
                          <BookingCard key={b._id} booking={b} onStatus={handleUpdateStatus} onReschedule={openRescheduleModal} statusMeta={statusMeta} showDate />
                        ))}
                </div>
              )}

              {/* ══ PROFILE ══ */}
              {activeSection === 'profile' && (
                <div className="dd-fade" style={{ maxWidth:560 }}>
                  <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                    border:'1px solid #E2E8F0', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>

                    {/* Hero */}
                    <div style={{ background:'linear-gradient(135deg,#0F766E,#059669)',
                      padding:'32px 24px', textAlign:'center' }}>
                      <div style={{ width:80, height:80, borderRadius:24, margin:'0 auto 14px',
                        background:'rgba(255,255,255,0.22)', border:'3px solid rgba(255,255,255,0.4)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:34, fontWeight:900, color:'#fff' }}>
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                      <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 6px' }}>
                        {doctor.name}
                      </h2>
                      <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, margin:0 }}>
                        {doctor.specialization || doctor.dept} · {doctor.dept}
                      </p>
                      {/* Stats */}
                      <div style={{ display:'flex', justifyContent:'center', gap:28,
                        marginTop:20, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.15)' }}>
                        {[
                          { label:'Bookings',  value: bookings.length },
                          { label:'Completed', value: completedBookings.length },
                          { label:'Pending',   value: pendingBookings.length },
                        ].map((s,i) => (
                          <div key={i} style={{ textAlign:'center' }}>
                            <strong style={{ display:'block', fontSize:22, fontWeight:900, color:'#fff' }}>
                              {s.value}
                            </strong>
                            <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding:28 }}>
                      {editMode ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                          <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700,
                            color:'#0F766E', textTransform:'uppercase' }}>✏️ Edit Profile</p>
                          {[
                            { label:'Full Name',      key:'name',           type:'text' },
                            { label:'Phone',          key:'phone',          type:'tel'  },
                            { label:'Specialization', key:'specialization', type:'text' },
                          ].map(f => (
                            <div key={f.key}>
                              <label style={{ fontSize:12, fontWeight:700, color:'#374151',
                                display:'block', marginBottom:6, textTransform:'uppercase' }}>
                                {f.label}
                              </label>
                              <input type={f.type} style={S.input}
                                value={editData[f.key] || ''}
                                onChange={e => setEditData({ ...editData, [f.key]: e.target.value })} />
                            </div>
                          ))}
                          <div style={{ display:'flex', gap:10, marginTop:6 }}>
                            <button style={S.btnGhost} onClick={() => setEditMode(false)}>
                              Cancel
                            </button>
                            <button style={{ ...S.btnPrimary, flex:2 }}
                              onClick={handleSaveProfile} disabled={saving}>
                              <Check size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            {[
                              { icon:<User size={15} />,        label:'Full Name',        value: doctor.name },
                              { icon:<Mail size={15} />,        label:'Email',            value: doctor.email },
                              { icon:<Phone size={15} />,       label:'Phone',            value: doctor.phone || '—' },
                              { icon:<Stethoscope size={15} />, label:'Department',       value: doctor.dept },
                              { icon:<CheckCircle size={15} />, label:'Specialization',   value: doctor.specialization || '—' },
                              { icon:<TrendingUp size={15} />,  label:'Consultation Fee', value: doctor.fee ? `₹${doctor.fee}` : '—' },
                            ].map((row, i, arr) => (
                              <div key={i} style={{
                                display:'flex', alignItems:'center', gap:14, padding:'14px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                              }}>
                                <div style={{ width:36, height:36, borderRadius:10, background:'#F0FDFA',
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  color:'#0F766E', flexShrink:0 }}>
                                  {row.icon}
                                </div>
                                <div>
                                  <p style={{ margin:0, fontSize:11, color:'#94A3B8',
                                    fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                                    {row.label}
                                  </p>
                                  <p style={{ margin:'2px 0 0', fontSize:15, fontWeight:600, color:'#1E293B' }}>
                                    {row.value}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button style={{ ...S.btnPrimary, width:'100%', marginTop:20 }}
                            onClick={() => setEditMode(true)}>
                            <Pencil size={15} /> Edit Profile
                          </button>
                        </>
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

// Empty State component
function EmptyState({ icon, msg }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', color:'#94A3B8', gap:10 }}>
      <div style={{ fontSize:36 }}>{icon}</div>
      <p style={{ fontWeight:600, margin:0, fontSize:14 }}>{msg}</p>
    </div>
  );
}

// Booking Card component
function BookingCard({ booking: b, onStatus, onReschedule, statusMeta, showDate }) {
  const [expanded, setExpanded] = useState(false);
  const s = statusMeta(b.status);

  return (
    <div style={{
      borderBottom:'1px solid #F1F5F9',
      transition:'background 0.15s, transform 0.3s',
      cursor:'pointer',
      borderRadius: expanded ? 8 : 0,
      boxShadow: expanded ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
      background:'#fff',
      marginBottom:8,
      padding:'14px 22px',
      display:'flex',
      flexDirection:'column',
      gap:10,
    }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display:'flex', alignItems:'center', gap:13 }}>
        {/* Avatar */}
        <div style={{ width:42, height:42, borderRadius:12, flexShrink:0,
          background:'linear-gradient(135deg,#CCFBF1,#A7F3D0)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:800, fontSize:17, color:'#0F766E' }}>
          {b.name?.charAt(0)?.toUpperCase()}
        </div>
        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:0, fontWeight:700, fontSize:14, color:'#1E293B',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {b.name}
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:4 }}>
            {showDate && (
              <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20,
                background:'#EFF6FF', color:'#3B82F6' }}>📅 {b.date}</span>
            )}
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20,
              background:'#F0FDFA', color:'#0F766E' }}>🕐 {b.time}</span>
            <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20,
              background:'#F1F5F9', color:'#64748B' }}>{b.appointmentType}</span>
            {b.paymentStatus === 'PAID' && (
              <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20,
                background:'#D1FAE5', color:'#059669' }}>💳 ₹{b.amountPaid}</span>
            )}
          </div>
        </div>
        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end',
          gap:6, flexShrink:0 }}>
          <span style={{ fontSize:11, fontWeight:800, padding:'3px 11px', borderRadius:20,
            background:s.bg, color:s.color, border:`1px solid ${s.border}`,
            textTransform:'capitalize', whiteSpace:'nowrap' }}>
            {b.status || 'pending'}
          </span>
          <span style={{ fontSize:17, color:'#94A3B8', transition:'transform 0.25s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display:'inline-block' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding:'0 22px 18px', borderTop:'1px solid #F1F5F9' }} className="dd-expand">
          {/* contact info */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:'12px 0 10px' }}>
            {b.email && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12,
                color:'#64748B', background:'#F8FAFC', padding:'5px 10px',
                borderRadius:8, border:'1px solid #E2E8F0' }}>
                <Mail size={12} /> {b.email}
              </div>
            )}
            {b.phone && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12,
                color:'#64748B', background:'#F8FAFC', padding:'5px 10px',
                borderRadius:8, border:'1px solid #E2E8F0' }}>
                <Phone size={12} /> {b.phone}
              </div>
            )}
            {b.doctorName && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12,
                color:'#64748B', background:'#F8FAFC', padding:'5px 10px',
                borderRadius:8, border:'1px solid #E2E8F0' }}>
                <Stethoscope size={12} /> Dr. {b.doctorName}
              </div>
            )}
          </div>

          {/* message */}
          {b.message && (
            <div style={{ fontSize:12, color:'#64748B', background:'#F8FAFC',
              borderLeft:'3px solid #CBD5E1', padding:'8px 12px',
              borderRadius:'0 8px 8px 0', marginBottom:10 }}>
              💬 {b.message}
            </div>
          )}

          {/* zoom meeting & pass */}
          {b.appointmentType === 'Online' && b.meetingLink && (b.status === 'confirmed' || b.status === 'rescheduled') && (
            <div style={{ background:'#EFF6FF', border:'1.5px solid #93C5FD', borderRadius:10, padding:'12px 14px', marginBottom:10 }}>
              <p style={{ margin:'0 0 5px', fontSize:11, fontWeight:800, color:'#1E40AF' }}>📹 Zoom Meeting</p>
              <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="dd-zoom-link" style={{ fontSize:12, color:'#2563EB', fontWeight:600, wordBreak:'break-all' }}>
                {b.meetingLink}
              </a>
              {b.meetingPassword && (
                <p style={{ margin:'6px 0 0', fontSize:11, color:'#92400E', background:'#FEF3C7', padding:'4px 8px', borderRadius:6 }}>
                  🔐 Password: <code style={{ fontFamily:'monospace', fontWeight:800 }}>{b.meetingPassword}</code>
                </p>
              )}
            </div>
          )}

          {/* zoom link pending */}
          {b.appointmentType === 'Online' && !b.meetingLink && b.status === 'pending' && (
            <div style={{ fontSize:11, fontWeight:600, color:'#92400E', background:'#FEF3C7', border:'1px solid #FCD34D', padding:'7px 11px', borderRadius:8, marginBottom:10 }}>
              ⚠️ Zoom link will be auto-created on confirmation
            </div>
          )}

          {/* actions */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
            {(b.status === 'pending' || b.status === 'rescheduled') && (
              <button
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'7px 14px', borderRadius:9, border:'none',
                  background:'#D1FAE5', color:'#059669',
                  fontSize:12, fontWeight:700, cursor:'pointer',
                  fontFamily:'inherit', transition:'all 0.2s'
                }}
                onClick={() => onStatus(b._id, 'confirmed')}>
                <CheckCircle size={13} /> {b.appointmentType === 'Online' && !b.meetingLink ? 'Confirm + Zoom' : 'Confirm'}
              </button>
            )}
            {b.status === 'confirmed' && (
              <button
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'7px 14px', borderRadius:9, border:'none',
                  background:'#E0F2FE', color:'#0369A1',
                  fontSize:12, fontWeight:700, cursor:'pointer',
                  fontFamily:'inherit', transition:'all 0.2s'
                }}
                onClick={() => onStatus(b._id, 'completed')}>
                <CheckCircle size={13} /> Mark Complete
              </button>
            )}
            {(b.status !== 'cancelled' && b.status !== 'completed') && (
              <>
                <button
                  style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'7px 14px', borderRadius:9, border:'none',
                    background:'#FEF3C7', color:'#D97706',
                    fontSize:12, fontWeight:700, cursor:'pointer',
                    fontFamily:'inherit', transition:'all 0.2s'
                  }}
                  onClick={() => onReschedule(b)}>
                  <RefreshCw size={13} /> Reschedule
                </button>
                <button
                  style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'7px 14px', borderRadius:9, border:'none',
                    background:'#FEE2E2', color:'#EF4444',
                    fontSize:12, fontWeight:700, cursor:'pointer',
                    fontFamily:'inherit', transition:'all 0.2s'
                  }}
                  onClick={() => onStatus(b._id, 'cancelled')}>
                  <XCircle size={13} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}