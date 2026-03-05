'use client';

import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Calendar, User, Phone, Mail, LogOut,
  Stethoscope, CheckCircle, XCircle,
  TrendingUp, CalendarDays, Menu, X, Pencil, Check,
  Clock, Activity, Bell, RefreshCw, Search
} from 'lucide-react';

const SIDEBAR_W = 270;
const DESKTOP_BP = 1024;

export default function DoctorDashboard() {
  const router = useRouter();

  const [doctor, setDoctor]               = useState(null);
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isDesktop, setIsDesktop]         = useState(false);

  const [editMode, setEditMode]   = useState(false);
  const [editData, setEditData]   = useState({});
  const [saving, setSaving]       = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reschedule
  const [rescheduleData, setRescheduleData] = useState(null);

  // ✅ Revenue (NEW)
  const [revenue, setRevenue] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    totalRevenue: 0,
  });
  const [revenueTab, setRevenueTab] = useState('today'); // today | month | total
  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  useEffect(() => {
    const onResize = () => {
      const d = window.innerWidth >= DESKTOP_BP;
      setIsDesktop(d);
      setSidebarOpen(d ? true : false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { router.push('/login'); return; }

    const stored = localStorage.getItem(`doctorSession_${id}`);
    if (!stored) { router.push('/login'); return; }

    const doc = JSON.parse(stored);
    setDoctor(doc);
    setEditData({ name: doc.name, phone: doc.phone, specialization: doc.specialization });

    fetchBookings(doc.dept, doc._id);
    fetchRevenue(doc._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!isDesktop) setSidebarOpen(false);
        setRescheduleData(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDesktop]);

  const fetchRevenue = async (docId) => {
    try {
      const res = await fetch(`/api/revenue?doctorId=${docId}`);
      if (!res.ok) return;
      const rev = await res.json();
      setRevenue({
        todayRevenue: rev.todayRevenue || 0,
        monthRevenue: rev.monthRevenue || 0,
        totalRevenue: rev.totalRevenue || 0,
      });
    } catch {
      // keep silent
    }
  };

  const fetchBookings = async (dept, docId) => {
    setLoading(true);
    try {
      const url = docId ? `/api/booking?doctorId=${docId}` : `/api/booking?dept=${dept}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) localStorage.removeItem(`doctorSession_${id}`);
    router.push('/login');
  };

  const handleUpdateStatus = async (bookingId, status, extraData = {}) => {
    try {
      const res = await fetch('/api/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status, ...extraData }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b._id === bookingId
          ? {
              ...b,
              status,
              meetingLink:     data.meetingLink     || b.meetingLink,
              meetingId:       data.meetingId       || b.meetingId,
              meetingPassword: data.meetingPassword || b.meetingPassword,
              date:            data.newDate         || b.date,
              time:            data.newTime         || b.time,
            }
          : b
        ));

        toast.success(
          status === 'rescheduled' ? '✅ Appointment Rescheduled!' :
          status === 'confirmed' && data.meetingLink ? '✅ Confirmed! Zoom link sent.' :
          `Booking ${status}`
        );

        setRescheduleData(null);

        // optional refresh revenue quickly (since status/payment may affect totals)
        if (doctor?._id) fetchRevenue(doctor._id);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openRescheduleModal = (booking) => {
    setRescheduleData({
      booking,
      date: '',
      time: '',
      reason: '',
      slots: [],
      loadingSlots: false,
    });
  };

  const fetchAvailableSlots = async (dateStr, dept) => {
    setRescheduleData(prev => ({ ...prev, date: dateStr, time: '', loadingSlots: true }));
    try {
      const res = await fetch(`/api/slots?date=${dateStr}&department=${encodeURIComponent(dept)}`);
      const data = await res.json();
      const available = data?.slots
        ? data.slots.filter(s => s.status !== 'closed' && s.status !== 'booked')
        : [];
      setRescheduleData(prev => ({ ...prev, slots: available }));
    } catch {
      toast.error('Failed to fetch slots');
      setRescheduleData(prev => ({ ...prev, slots: [] }));
    } finally {
      setRescheduleData(prev => ({ ...prev, loadingSlots: false }));
    }
  };

  const submitReschedule = () => {
    if (!rescheduleData?.date || !rescheduleData?.time) {
      toast.error('Select new date and time');
      return;
    }
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doctor, ...editData }),
      });

      if (res.ok) {
        const updated = { ...doctor, ...editData };
        localStorage.setItem(`doctorSession_${doctor._id}`, JSON.stringify(updated));
        setDoctor(updated);
        setEditMode(false);
        toast.success('Profile updated!');
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const todayBookings     = useMemo(() => bookings.filter(b => b.date === today), [bookings, today]);
  const pendingBookings   = useMemo(() => bookings.filter(b => b.status === 'pending'), [bookings]);
  const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings]);
  const completedBookings = useMemo(() => bookings.filter(b => b.status === 'completed'), [bookings]);
  const dateBookings      = useMemo(() => bookings.filter(b => b.date === selectedDate), [bookings, selectedDate]);

  const filteredBookings = useMemo(() => {
    const byStatus = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);
    const q = searchTerm.trim().toLowerCase();
    if (!q) return byStatus;

    return byStatus.filter(b => {
      const s = `${b.name || ''} ${b.email || ''} ${b.phone || ''}`.toLowerCase();
      return s.includes(q);
    });
  }, [bookings, filterStatus, searchTerm]);

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
    { id: 'schedule',  label: 'My Schedule', icon: CalendarDays },
    { id: 'bookings',  label: 'All Bookings', icon: Calendar },
    { id: 'profile',   label: 'My Profile', icon: User },
  ];

  const handleRefresh = () => {
    if (!doctor) return;
    fetchBookings(doctor.dept, doctor._id);
    fetchRevenue(doctor._id);
  };

  if (!doctor) return null;

  const currentRevenue =
    revenueTab === 'today'
      ? revenue.todayRevenue
      : revenueTab === 'month'
      ? revenue.monthRevenue
      : revenue.totalRevenue;

  const S = {
    root: {
      display: 'flex',
      minHeight: '100vh',
      background: '#F1F5F9',
      color: '#0F172A',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden',
    },

    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 90,
      backdropFilter: 'blur(4px)',
    },

    sidebar: {
      width: SIDEBAR_W,
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      overflowY: 'auto',
      borderRight: '1px solid rgba(255,255,255,0.05)',

      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,

      transform: (isDesktop || sidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease',
      boxShadow: !isDesktop && sidebarOpen ? '4px 0 15px rgba(0,0,0,0.12)' : 'none',
    },

    sidebarHeader: {
      padding: '24px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      gap: 12,
    },

    sidebarLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 0,
    },

    sidebarLogoIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      flexShrink: 0,
    },

    sidebarLogoTitle: {
      margin: 0,
      fontSize: 16,
      fontWeight: 800,
      color: '#fff',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    sidebarLogoSub: {
      margin: '3px 0 0',
      fontSize: 11,
      fontWeight: 600,
      color: '#64748B',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    sidebarCloseBtn: {
      display: isDesktop ? 'none' : 'flex',
      width: 34,
      height: 34,
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.10)',
      color: '#94A3B8',
    },

    sidebarNav: { flex: 1, padding: '16px 12px' },

    sidebarNavLabel: {
      margin: '0 0 12px',
      padding: '0 12px',
      fontSize: 11,
      fontWeight: 700,
      color: '#475569',
      letterSpacing: '1.2px',
      textTransform: 'uppercase',
    },

    navItem: (active) => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 16px',
      marginBottom: 4,
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      position: 'relative',
      background: active ? 'linear-gradient(135deg, #0F766E, #14B8A6)' : 'transparent',
      color: active ? '#fff' : '#94A3B8',
      fontSize: 14,
      fontWeight: active ? 700 : 600,
    }),

    navIconBox: {
      width: 22,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    navText: { flex: 1, minWidth: 0 },

    navActiveIndicator: {
      position: 'absolute',
      right: -12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 4,
      height: 24,
      background: '#14B8A6',
      borderRadius: '4px 0 0 4px',
    },

    navPill: {
      background: '#FBBF24',
      color: '#78350F',
      borderRadius: 999,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 900,
    },

    sidebarFooter: {
      padding: '16px 12px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
    },

    miniRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 8px',
      fontSize: 12,
      color: 'rgba(255,255,255,0.6)',
    },

    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%',
      padding: '12px 16px',
      border: 'none',
      borderRadius: 10,
      background: 'rgba(220, 38, 38, 0.12)',
      color: '#F87171',
      fontSize: 14,
      fontWeight: 800,
      cursor: 'pointer',
    },

    mainWrap: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      marginLeft: isDesktop ? SIDEBAR_W : 0,
      height: '100vh',
      overflow: 'hidden',
      transition: 'margin-left 0.3s ease',
    },

    topbar: {
      height: 70,
      flexShrink: 0,
      background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isDesktop ? '0 32px' : '0 16px',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    },

    topbarMenuBtn: {
      display: isDesktop ? 'none' : 'flex',
      width: 40,
      height: 40,
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      background: '#F1F5F9',
      color: '#475569',
      alignItems: 'center',
      justifyContent: 'center',
    },

    title: {
      margin: 0,
      fontSize: isDesktop ? 22 : 18,
      fontWeight: 800,
      color: '#0F172A',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: 1.1,
    },

    subtitle: {
      margin: '3px 0 0',
      fontSize: 13,
      color: '#94A3B8',
      display: isDesktop ? 'block' : 'none',
    },

    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      border: '1px solid #E2E8F0',
      background: '#F1F5F9',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#475569',
    },

    badge: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      background: '#F1F5F9',
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 700,
      color: '#475569',
    },

    avatar: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 800,
    },

    content: {
      flex: 1,
      overflowY: 'auto',
      padding: isDesktop ? '28px 32px' : '20px 16px',
      background: '#F1F5F9',
    },

    card: {
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    },

    cardHeader: {
      padding: '18px 24px',
      background: '#F8FAFC',
      borderBottom: '1px solid #F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    },

    cardTitle: {
      margin: 0,
      fontSize: 16,
      fontWeight: 800,
      color: '#0F172A',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
    },

    chip: {
      padding: '6px 14px',
      borderRadius: 999,
      background: '#F0FDFA',
      border: '1px solid #CCFBF1',
      color: '#0F766E',
      fontSize: 12,
      fontWeight: 900,
    },

    input: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: '1.5px solid #CBD5E1',
      background: '#fff',
      outline: 'none',
      fontSize: 14,
      color: '#0F172A',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },

    btnPrimary: {
      padding: '12px 18px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      background: '#0F766E',
      color: '#fff',
      fontWeight: 800,
      fontSize: 14,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },

    btnGhost: {
      padding: '12px 18px',
      borderRadius: 10,
      border: '1.5px solid #CBD5E1',
      cursor: 'pointer',
      background: '#F1F5F9',
      color: '#475569',
      fontWeight: 800,
      fontSize: 14,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
  };

  return (
    <div style={S.root}>
      {!isDesktop && sidebarOpen && (
        <div style={S.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={S.sidebarLogoIcon}>🩺</div>
            <div style={{ minWidth: 0 }}>
              <h2 style={S.sidebarLogoTitle}>{doctor.name}</h2>
              <p style={S.sidebarLogoSub}>
                {doctor.dept} · {doctor.specialization || 'Specialist'}
              </p>
            </div>
          </div>

          <button style={S.sidebarCloseBtn} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav style={S.sidebarNav}>
          <p style={S.sidebarNavLabel}>MAIN MENU</p>

          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                style={S.navItem(isActive)}
                onClick={() => {
                  setActiveSection(item.id);
                  if (!isDesktop) setSidebarOpen(false);
                }}
              >
                <div style={S.navIconBox}>
                  <item.icon size={20} />
                </div>

                <span style={S.navText}>{item.label}</span>

                {item.id === 'bookings' && pendingBookings.length > 0 && (
                  <span style={S.navPill}>{pendingBookings.length}</span>
                )}

                {isActive && <div style={S.navActiveIndicator} />}
              </button>
            );
          })}
        </nav>

        <div style={S.sidebarFooter}>
          <div style={{ padding: '0 4px 10px' }}>
            <div style={S.miniRow}>
              <span>Total Seen</span>
              <strong style={{ color: '#fff' }}>{completedBookings.length}</strong>
            </div>
            <div style={S.miniRow}>
              <span>Pending</span>
              <strong style={{ color: '#FBBF24' }}>{pendingBookings.length}</strong>
            </div>
          </div>

          <button style={S.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={S.mainWrap}>
        <header style={S.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <button style={S.topbarMenuBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>

            <div style={{ minWidth: 0 }}>
              <h1 style={S.title}>
                {menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p style={S.subtitle}>
                Doctor / {menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button style={S.iconBtn} onClick={handleRefresh} title="Refresh">
              <RefreshCw size={18} />
            </button>

            {pendingBookings.length > 0 && (
              <div style={{
                position: 'relative',
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706'
              }}>
                <Bell size={18} />
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#EF4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {pendingBookings.length}
                </span>
              </div>
            )}

            <div style={S.badge}>
              <div style={S.avatar}>{doctor.name?.charAt(0)?.toUpperCase()}</div>
              <span style={{ display: isDesktop ? 'inline' : 'none' }}>
                {doctor.name?.split(' ')?.[0] || 'Doctor'}
              </span>
            </div>
          </div>
        </header>

        <div style={S.content}>
          {loading ? (
            <LoadingInlineSpinner />
          ) : (
            <>
              {/* DASHBOARD */}
              {activeSection === 'dashboard' && (
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 55%, #0284C7 100%)',
                    padding: isDesktop ? '32px 36px' : '24px 18px',
                    borderRadius: 16,
                    color: '#fff',
                    boxShadow: '0 8px 24px rgba(15, 118, 110, 0.20)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 14,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: isDesktop ? 24 : 18, fontWeight: 900 }}>
                        Good {greeting}, {doctor.name?.split(' ')?.[0] || 'Doctor'}
                      </h2>
                      <p style={{ margin: '6px 0 0', opacity: 0.88, fontSize: 14 }}>
                        {doctor.dept} · {doctor.specialization || 'Specialist'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900 }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.85 }}>
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>

                      <div style={{
                        marginTop: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.15)',
                        fontSize: 12,
                        fontWeight: 800
                      }}>
                        <Clock size={14} />
                        {todayBookings.length} today
                      </div>
                    </div>
                  </div>

                  {/* ✅ Revenue Tabs */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'month', label: 'This Month' },
                      { id: 'total', label: 'Total' },
                    ].map((t) => {
                      const active = revenueTab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setRevenueTab(t.id)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 999,
                            border: active ? '2px solid #0F766E' : '1.5px solid #E2E8F0',
                            background: active ? '#0F766E' : '#F1F5F9',
                            color: active ? '#fff' : '#475569',
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div style={{
                    marginTop: 14,
                    display: 'grid',
                    gridTemplateColumns: isDesktop ? 'repeat(5, 1fr)' : 'repeat(2, 1fr)',
                    gap: 14
                  }}>
                    {[
                      { label: 'Total Bookings', value: bookings.length, icon: '📋', color: '#2563EB' },
                      { label: "Today's Patients", value: todayBookings.length, icon: '📅', color: '#0F766E' },
                      { label: 'Pending', value: pendingBookings.length, icon: '⏳', color: '#D97706' },
                      { label: 'Confirmed', value: confirmedBookings.length, icon: '✅', color: '#059669' },
                      {
                        label:
                          revenueTab === 'today'
                            ? 'Today Revenue'
                            : revenueTab === 'month'
                            ? 'This Month Revenue'
                            : 'Total Revenue',
                        value: formatINR(currentRevenue),
                        icon: '💰',
                        color: '#0F766E'
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: 14,
                          padding: 18,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                        }}
                      >
                        <div style={{
                          width: 50,
                          height: 50,
                          borderRadius: 12,
                          background: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24
                        }}>
                          {s.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>
                            {s.value}
                          </div>
                          <div style={{ marginTop: 6, fontSize: 13, color: '#64748B', fontWeight: 700 }}>
                            {s.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Today appointments */}
                  <div style={{ marginTop: 18, ...S.card }}>
                    <div style={S.cardHeader}>
                      <h3 style={S.cardTitle}>
                        <CalendarDays size={18} />
                        Today’s Appointments
                      </h3>
                      <span style={S.chip}>{todayBookings.length}</span>
                    </div>

                    {todayBookings.length === 0
                      ? <EmptyState icon="🎉" msg="No appointments today — enjoy your day!" />
                      : todayBookings.map(b => (
                          <BookingCard
                            key={b._id}
                            booking={b}
                            onStatus={handleUpdateStatus}
                            onReschedule={openRescheduleModal}
                            statusMeta={statusMeta}
                          />
                        ))}
                  </div>
                </div>
              )}

              {/* SCHEDULE */}
              {activeSection === 'schedule' && (
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={S.cardHeader}>
                      <h3 style={S.cardTitle}><CalendarDays size={18} /> Pick a Date</h3>
                    </div>
                    <div style={{ padding: 18 }}>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ ...S.input, maxWidth: 240 }}
                      />
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeader}>
                      <h3 style={S.cardTitle}>
                        <Activity size={18} />
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </h3>
                      <span style={S.chip}>{dateBookings.length}</span>
                    </div>

                    {dateBookings.length === 0
                      ? <EmptyState icon="📭" msg="No appointments on this date" />
                      : [...dateBookings]
                          .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                          .map(b => (
                            <BookingCard
                              key={b._id}
                              booking={b}
                              onStatus={handleUpdateStatus}
                              onReschedule={openRescheduleModal}
                              statusMeta={statusMeta}
                            />
                          ))}
                  </div>
                </div>
              )}

              {/* BOOKINGS */}
              {activeSection === 'bookings' && (
                <div style={S.card}>
                  <div style={S.cardHeader}>
                    <h3 style={S.cardTitle}><Calendar size={18} /> All Bookings</h3>
                    <span style={S.chip}>{filteredBookings.length}</span>
                  </div>

                  <div style={{
                    padding: 16,
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                        <Search size={16} />
                      </div>
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by patient name / email / phone"
                        style={{ ...S.input, paddingLeft: 36 }}
                      />
                    </div>

                    <button style={S.btnGhost} onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
                      Clear
                    </button>
                  </div>

                  <div style={{
                    padding: 16,
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8
                  }}>
                    {['all', 'pending', 'confirmed', 'rescheduled', 'cancelled', 'completed'].map(s => {
                      const count = s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length;
                      const active = filterStatus === s;

                      return (
                        <button
                          key={s}
                          onClick={() => setFilterStatus(s)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 999,
                            border: active ? '2px solid #0F766E' : '1.5px solid #E2E8F0',
                            background: active ? '#0F766E' : '#F1F5F9',
                            color: active ? '#fff' : '#475569',
                            cursor: 'pointer',
                            fontWeight: 900,
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8
                          }}
                        >
                          <span>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: active ? 'rgba(255,255,255,0.22)' : '#E2E8F0',
                            color: active ? '#fff' : '#475569',
                            fontSize: 11,
                            fontWeight: 900
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
                          <BookingCard
                            key={b._id}
                            booking={b}
                            onStatus={handleUpdateStatus}
                            onReschedule={openRescheduleModal}
                            statusMeta={statusMeta}
                            showDate
                          />
                        ))}
                </div>
              )}

              {/* PROFILE */}
              {activeSection === 'profile' && (
                <div style={{ maxWidth: 560 }}>
                  <div style={S.card}>
                    <div style={{
                      background: 'linear-gradient(135deg,#0F766E,#14B8A6)',
                      padding: '30px 24px',
                      textAlign: 'center',
                      color: '#fff'
                    }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        margin: '0 auto 12px',
                        background: 'rgba(255,255,255,0.20)',
                        border: '3px solid rgba(255,255,255,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32,
                        fontWeight: 900
                      }}>
                        {doctor.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
                        {doctor.name}
                      </h2>
                      <p style={{ margin: '6px 0 0', opacity: 0.85, fontWeight: 700, fontSize: 13 }}>
                        {doctor.specialization || doctor.dept} · {doctor.dept}
                      </p>
                    </div>

                    <div style={{ padding: 22 }}>
                      {editMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {[
                            { label: 'Full Name', key: 'name', type: 'text' },
                            { label: 'Phone', key: 'phone', type: 'tel' },
                            { label: 'Specialization', key: 'specialization', type: 'text' },
                          ].map(f => (
                            <div key={f.key}>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>
                                {f.label}
                              </label>
                              <input
                                type={f.type}
                                value={editData[f.key] || ''}
                                onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                                style={S.input}
                              />
                            </div>
                          ))}

                          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                            <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setEditMode(false)}>
                              Cancel
                            </button>
                            <button
                              style={{ ...S.btnPrimary, flex: 2, opacity: saving ? 0.8 : 1 }}
                              onClick={handleSaveProfile}
                              disabled={saving}
                            >
                              <Check size={16} />
                              {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <ProfileRow icon={<User size={16} />} label="Full Name" value={doctor.name} />
                          <ProfileRow icon={<Mail size={16} />} label="Email" value={doctor.email} />
                          <ProfileRow icon={<Phone size={16} />} label="Phone" value={doctor.phone || '—'} />
                          <ProfileRow icon={<Stethoscope size={16} />} label="Department" value={doctor.dept} />
                          <ProfileRow icon={<CheckCircle size={16} />} label="Specialization" value={doctor.specialization || '—'} />

                          <button
                            style={{ ...S.btnPrimary, width: '100%', marginTop: 14 }}
                            onClick={() => setEditMode(true)}
                          >
                            <Pencil size={16} />
                            Edit Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* RESCHEDULE MODAL (kept minimal) */}
          {rescheduleData && (
            <div
              onClick={() => setRescheduleData(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  width: '100%',
                  maxWidth: 460,
                  overflow: 'hidden',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.30)',
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #D97706, #B45309)',
                  padding: 18,
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                    Reschedule Appointment
                  </h3>
                  <button
                    onClick={() => setRescheduleData(null)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: 'none',
                      background: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ padding: 20 }}>
                  <p style={{ margin: '0 0 14px', fontSize: 14, color: '#475569' }}>
                    Rescheduling <strong>{rescheduleData.booking.name}</strong> ({rescheduleData.booking.department}).
                  </p>

                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748B', marginBottom: 6 }}>
                    New Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleData.date}
                    onChange={(e) => fetchAvailableSlots(e.target.value, rescheduleData.booking.department)}
                    style={{ ...S.input, marginBottom: 14 }}
                  />

                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748B', marginBottom: 6 }}>
                    New Time Slot *
                  </label>

                  {rescheduleData.loadingSlots ? (
                    <div style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: 10,
                      fontSize: 13,
                      color: '#64748B',
                      marginBottom: 14
                    }}>
                      Loading slots...
                    </div>
                  ) : rescheduleData.date ? (
                    rescheduleData.slots.length > 0 ? (
                      <select
                        value={rescheduleData.time}
                        onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                        style={{ ...S.input, marginBottom: 14 }}
                      >
                        <option value="">-- Select Time --</option>
                        {rescheduleData.slots.map(s => (
                          <option key={s.time} value={s.time}>{s.time}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 13,
                        color: '#DC2626',
                        marginBottom: 14
                      }}>
                        No slots available on this date.
                      </div>
                    )
                  ) : (
                    <div style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: 10,
                      fontSize: 13,
                      color: '#64748B',
                      marginBottom: 14
                    }}>
                      Select a date first
                    </div>
                  )}

                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748B', marginBottom: 6 }}>
                    Reason (Sent to Patient)
                  </label>
                  <textarea
                    rows={2}
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g. Doctor in surgery..."
                    style={{ ...S.input, resize: 'none', marginBottom: 16 }}
                  />

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ ...S.btnGhost, flex: 1 }} onClick={() => setRescheduleData(null)}>
                      Cancel
                    </button>
                    <button style={{ ...S.btnPrimary, flex: 1, background: '#D97706' }} onClick={submitReschedule}>
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function LoadingInlineSpinner() {
  const [deg, setDeg] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDeg(d => (d + 18) % 360), 30);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: 60,
      color: '#64748B'
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: '4px solid #CCFBF1',
        borderTopColor: '#0F766E',
        transform: `rotate(${deg}deg)`
      }} />
      <div style={{ fontWeight: 800 }}>Loading your data...</div>
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 60,
      color: '#9CA3AF',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 15, color: '#374151' }}>{msg}</div>
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid #F1F5F9'
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: '#F0FDFA',
        color: '#0F766E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 900,
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </div>
        <div style={{ marginTop: 2, fontSize: 15, fontWeight: 750, color: '#0F172A' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking: b, onStatus, onReschedule, statusMeta, showDate }) {
  const [expanded, setExpanded] = useState(false);
  const s = statusMeta(b.status);

  const detailsRef = useRef(null);
  const [detailsH, setDetailsH] = useState(0);

  useLayoutEffect(() => {
    if (!detailsRef.current) return;
    const el = detailsRef.current;

    const measure = () => setDetailsH(el.scrollHeight || 0);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const toggle = () => setExpanded(v => !v);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 14,
      margin: '12px 12px',
      overflow: 'hidden'
    }}>
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          padding: '16px 16px',
          background: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'linear-gradient(135deg,#CCFBF1,#A7F3D0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          color: '#0F766E',
          fontSize: 18,
          flexShrink: 0
        }}>
          {b.name?.charAt(0)?.toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 900,
            color: '#0F172A',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {b.name}
          </div>

          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {showDate && (
              <span style={{
                fontSize: 11,
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: 999,
                background: '#EFF6FF',
                color: '#2563EB'
              }}>
                📅 {b.date}
              </span>
            )}

            <span style={{
              fontSize: 11,
              fontWeight: 900,
              padding: '3px 9px',
              borderRadius: 999,
              background: '#F0FDFA',
              color: '#0F766E'
            }}>
              🕐 {b.time}
            </span>

            <span style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: 999,
              background: '#F1F5F9',
              color: '#64748B'
            }}>
              {b.appointmentType}
            </span>

            {b.paymentStatus === 'PAID' && (
              <span style={{
                fontSize: 11,
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: 999,
                background: '#D1FAE5',
                color: '#059669'
              }}>
                💳 ₹{b.amountPaid}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 900,
            padding: '4px 11px',
            borderRadius: 999,
            background: s.bg,
            color: s.color,
            border: `1px solid ${s.border}`,
            textTransform: 'capitalize',
            whiteSpace: 'nowrap'
          }}>
            {b.status || 'pending'}
          </span>

          <span style={{
            fontSize: 16,
            color: '#94A3B8',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▾
          </span>
        </div>
      </div>

      <div style={{
        overflow: 'hidden',
        maxHeight: expanded ? (detailsH + 24) : 0,
        opacity: expanded ? 1 : 0,
        transform: expanded ? 'translateY(0px)' : 'translateY(-6px)',
        transition: 'max-height 0.34s ease, opacity 0.22s ease, transform 0.22s ease',
      }}>
        <div ref={detailsRef} style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {b.email && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: 12,
                fontWeight: 700
              }}>
                <Mail size={14} /> {b.email}
              </div>
            )}

            {b.phone && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: 12,
                fontWeight: 700
              }}>
                <Phone size={14} /> {b.phone}
              </div>
            )}

            {b.doctorName && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: 12,
                fontWeight: 700
              }}>
                <Stethoscope size={14} /> Dr. {b.doctorName}
              </div>
            )}
          </div>

          {b.message && (
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #F1F5F9',
              borderLeft: '3px solid #CBD5E1',
              padding: '10px 12px',
              borderRadius: '0 10px 10px 0',
              color: '#475569',
              fontSize: 13,
              marginBottom: 10
            }}>
              <span style={{ fontWeight: 900 }}>Message:</span> {b.message}
            </div>
          )}

          {/* ZOOM MEETING LINK */}
{b.meetingLink && (
  <div style={{
    background: '#EFF6FF',
    padding: '14px',
    borderRadius: '10px',
    border: '2px solid #93C5FD',
    marginBottom: '10px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E40AF' }}>
        📹 ZOOM MEETING LINK
      </span>
      {b.status === 'confirmed' || b.status === 'rescheduled' ? (
        <span style={{ fontSize: '10px', background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #6EE7B7' }}>
          ✅ SENT TO PATIENT
        </span>
      ) : null}
    </div>

    <a
      href={b.meetingLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#2563EB', fontWeight: '600', fontSize: '13px', wordBreak: 'break-all', display: 'block', marginBottom: '8px', textDecoration: 'none' }}
    >
      {b.meetingLink}
    </a>

    {b.meetingPassword && (
      <div style={{
        fontSize: '12px', color: '#92400E', background: '#FEF3C7',
        padding: '6px 10px', borderRadius: '6px', marginBottom: '8px',
        border: '1px solid #FCD34D',
      }}>
        🔐 Password: <strong style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{b.meetingPassword}</strong>
      </div>
    )}

    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      <button
        onClick={() => navigator.clipboard.writeText(b.meetingLink).then(() => alert('Link copied!'))}
        style={{ background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', color: '#1E40AF', fontWeight: '600' }}
      >
        📋 Copy Link
      </button>

      <a
        href={b.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ background: '#2563EB', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', color: '#fff', fontWeight: '600', textDecoration: 'none' }}
      >
        🔗 Open
      </a>

      {/* HOST LINK — Doctor joins as host */}
      {b.hostLink && (
        <a
          href={b.hostLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: '#059669', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', color: '#fff', fontWeight: '600', textDecoration: 'none' }}
        >
          🎥 Start as Host
        </a>
      )}
    </div>
  </div>
)}

{/* PENDING ONLINE — no link yet */}
{b.appointmentType === 'Online' && !b.meetingLink && b.status === 'pending' && (
  <div style={{
    background: '#FEF3C7', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #FCD34D', marginBottom: '8px', fontSize: '12px', color: '#92400E',
  }}>
    ⚠️ Zoom link will be created when confirmed.
  </div>
)}


          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(b.status === 'pending' || b.status === 'rescheduled') && (
              <button
                onClick={() => onStatus(b._id, 'confirmed')}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: '#D1FAE5',
                  color: '#059669',
                  fontWeight: 900,
                  fontSize: 13,
                  display: 'inline-flex',
                  gap: 8,
                  alignItems: 'center'
                }}
              >
                <CheckCircle size={16} />
                Confirm
              </button>
            )}

            {b.status === 'confirmed' && (
              <button
                onClick={() => onStatus(b._id, 'completed')}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: '#DBEAFE',
                  color: '#2563EB',
                  fontWeight: 900,
                  fontSize: 13,
                  display: 'inline-flex',
                  gap: 8,
                  alignItems: 'center'
                }}
              >
                <CheckCircle size={16} />
                Mark Complete
              </button>
            )}

            {(b.status !== 'cancelled' && b.status !== 'completed') && (
              <>
                <button
                  onClick={() => onReschedule(b)}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: '#FEF3C7',
                    color: '#D97706',
                    fontWeight: 900,
                    fontSize: 13,
                    display: 'inline-flex',
                    gap: 8,
                    alignItems: 'center'
                  }}
                >
                  <RefreshCw size={16} />
                  Reschedule
                </button>

                <button
                  onClick={() => onStatus(b._id, 'cancelled')}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: '#FEE2E2',
                    color: '#EF4444',
                    fontWeight: 900,
                    fontSize: 13,
                    display: 'inline-flex',
                    gap: 8,
                    alignItems: 'center'
                  }}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}