// src/app/admin/dashboard/page.js
'use client';

import './dashboard.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
/* ===== ADMIN COMPONENTS ===== */
import HeroManager from '../components/HeroManager';
import SpecialistsSection from '../components/SpecialistsSection';
import BookingsSection from '../components/BookingsSection';
import ContactsSection from '../components/ContactsSection';
import DoctorsManager from '../components/DoctorsManager';
import CalendarManager from '../components/CalendarManager';

/* ===== ICONS ===== */
import {
  Calendar,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  BookOpen,
  Phone,
  LayoutDashboard,
  LogOut,
  Image,
  Menu,
  X,
  CalendarDays,
} from 'lucide-react';

/* =======================
   SIDEBAR MENU
======================= */
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'calendar', label: 'Slot Management', icon: CalendarDays },
  { id: 'doctors', label: 'Doctors (New)', icon: Users },
  { id: 'contacts', label: 'Contacts', icon: Phone },
  { id: 'specialists', label: 'Specialists', icon: Users },
  { id: 'hero', label: 'Hero Section', icon: Image },
];

/* =======================
   STAT CARD
======================= */
const StatCard = ({ icon, number, label, color }) => (
  <div className={`dash-stat-card dash-stat-${color}`}>
    <div className="dash-stat-icon-box">{icon}</div>
    <div className="dash-stat-info">
      <p className="dash-stat-number">{number}</p>
      <p className="dash-stat-label">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    confirmedBookings: 0,
    totalContacts: 0,
  });

  /* =======================
     REVENUE STATE (NEW)
  ======================= */
  const [revenue, setRevenue] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    totalRevenue: 0,
    doctorWise: [],
  });

  const [revenueTab, setRevenueTab] = useState('today'); // today | month | total

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

   // ✅ PASTE HERE — before the fetch useEffect
  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      router.replace('/admin/login');
    }
  }, []);

  // Fetch real stats from MongoDB + Revenue
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const bookingRes = await fetch('/api/booking');
        let bookings = [];
        if (bookingRes.ok) {
          bookings = await bookingRes.json();
        }

        const contactRes = await fetch('/api/contact');
        let contacts = [];
        if (contactRes.ok) {
          const contactData = await contactRes.json();
          contacts = Array.isArray(contactData) ? contactData : [];
        }

        const today = new Date().toISOString().split('T')[0];

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b) => b.status === 'pending').length,
          todayBookings: bookings.filter((b) => b.date === today).length,
          confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
          totalContacts: contacts.length,
        });

        // ✅ Revenue fetch (Hospital + Doctor-wise)
        const revRes = await fetch('/api/revenue?byDoctor=1');
        if (revRes.ok) {
          const rev = await revRes.json();
          setRevenue({
            todayRevenue: rev.todayRevenue || 0,
            monthRevenue: rev.monthRevenue || 0,
            totalRevenue: rev.totalRevenue || 0,
            doctorWise: rev.doctorWise || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [activeSection]);

  // Handle section change
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  // Logout
const handleLogout = async () => {
  // ✅ Clear auth flag
  sessionStorage.removeItem('adminAuth');
  await fetch('/api/auth/logout', { method: 'POST' });
  router.push('/admin/login');
};


  // Get section title
  const getSectionTitle = () => {
    const item = menuItems.find((m) => m.id === activeSection);
    return item ? item.label : 'Dashboard';
  };

  const currentRevenueValue =
    revenueTab === 'today'
      ? revenue.todayRevenue
      : revenueTab === 'month'
      ? revenue.monthRevenue
      : revenue.totalRevenue;

  return (
    <div className="admin-dashboard">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">🏥</span>
            <div className="sidebar-logo-text">
              <h2>Aadhunika</h2>
              <p>Admin Panel</p>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">MAIN MENU</p>

          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-active' : ''}`}
                onClick={() => handleSectionChange(item.id)}
              >
                <div className="sidebar-nav-icon">
                  <item.icon size={20} />
                </div>
                <span className="sidebar-nav-label-text">{item.label}</span>
                {isActive && <div className="sidebar-active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="topbar-title">
              <h1>{getSectionTitle()}</h1>
              <p className="topbar-breadcrumb">Admin / {getSectionTitle()}</p>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-admin-badge">
              <div className="topbar-admin-avatar">A</div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-home">
              <div className="dash-welcome">
                <h2>Welcome back, Admin 👋</h2>
                <p>Here's what's happening at your hospital today.</p>
              </div>

              <div className="dash-stats-grid">
                <StatCard
                  icon={<Calendar size={24} />}
                  number={stats.totalBookings}
                  label="Total Bookings"
                  color="teal"
                />
                <StatCard
                  icon={<Clock size={24} />}
                  number={stats.pendingBookings}
                  label="Pending"
                  color="orange"
                />
                <StatCard
                  icon={<TrendingUp size={24} />}
                  number={stats.todayBookings}
                  label="Today"
                  color="blue"
                />
                <StatCard
                  icon={<MessageSquare size={24} />}
                  number={stats.confirmedBookings}
                  label="Confirmed"
                  color="green"
                />
                <StatCard
                  icon={<Users size={24} />}
                  number={stats.totalContacts}
                  label="Contacts"
                  color="purple"
                />
              </div>

              {/* Quick Actions */}
              <div className="dash-quick-actions">
                <h3>Quick Actions</h3>
                <div className="dash-quick-grid">
                  <button className="dash-quick-btn" onClick={() => setActiveSection('bookings')}>
                    <BookOpen size={20} />
                    <span>View Bookings</span>
                  </button>
                  <button className="dash-quick-btn" onClick={() => setActiveSection('calendar')}>
                    <CalendarDays size={20} />
                    <span>Manage Slots</span>
                  </button>
                  <button className="dash-quick-btn" onClick={() => setActiveSection('doctors')}>
                    <Users size={20} />
                    <span>Manage Doctors</span>
                  </button>
                  <button className="dash-quick-btn" onClick={() => setActiveSection('contacts')}>
                    <Phone size={20} />
                    <span>View Contacts</span>
                  </button>
                </div>
              </div>

              {/* =======================
                  REVENUE (NEW)
              ======================= */}
              <div className="dash-quick-actions">
                <h3>Revenue</h3>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'month', label: 'This Month' },
                    { id: 'total', label: 'Total' },
                  ].map((t) => {
                    const active = revenueTab === t.id;
                    return (
                      <button
                        key={t.id}
                        className="dash-quick-btn"
                        style={{
                          maxWidth: 170,
                          background: active ? '#0F766E' : '#F8FAFC',
                          borderColor: active ? '#0F766E' : '#E2E8F0',
                          color: active ? '#fff' : '#475569',
                        }}
                        onClick={() => setRevenueTab(t.id)}
                      >
                        <span style={{ fontWeight: 800 }}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <StatCard
                    icon={<TrendingUp size={24} />}
                    number={formatINR(currentRevenueValue)}
                    label={
                      revenueTab === 'today'
                        ? 'Today Revenue'
                        : revenueTab === 'month'
                        ? 'This Month Revenue'
                        : 'Total Revenue'
                    }
                    color="green"
                  />
                  <StatCard
                    icon={<Users size={24} />}
                    number={revenue.doctorWise?.length || 0}
                    label="Doctors Contributing"
                    color="purple"
                  />
                  <StatCard
                    icon={<BookOpen size={24} />}
                    number="PAID"
                    label="Revenue from Paid Bookings"
                    color="blue"
                  />
                </div>

                {/* Doctor-wise Revenue List */}
                <div
                  style={{
                    marginTop: 18,
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      background: '#F8FAFC',
                      borderBottom: '1px solid #F1F5F9',
                      fontWeight: 800,
                      color: '#0F172A',
                    }}
                  >
                    Doctor-wise Revenue ({revenueTab})
                  </div>

                  <div style={{ padding: 16, display: 'grid', gap: 10 }}>
                    {(revenue.doctorWise || []).slice(0, 10).map((d) => {
                      const val =
                        revenueTab === 'today'
                          ? d.todayRevenue
                          : revenueTab === 'month'
                          ? d.monthRevenue
                          : d.totalRevenue;

                      return (
                        <div
                          key={d.doctorId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            padding: '12px 14px',
                            border: '1px solid #E2E8F0',
                            borderRadius: 12,
                            background: '#fff',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 800,
                                color: '#0F172A',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {d.doctorName || 'Doctor'}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                              {d.dept || '—'}
                            </div>
                          </div>

                          <div style={{ fontWeight: 900, color: '#0F766E' }}>
                            {formatINR(val)}
                          </div>
                        </div>
                      );
                    })}

                    {(revenue.doctorWise || []).length === 0 && (
                      <div style={{ padding: 16, color: '#64748B', fontWeight: 700 }}>
                        No paid revenue yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeSection === 'bookings' && <BookingsSection />}

          {/* CALENDAR MANAGER */}
          {activeSection === 'calendar' && <CalendarManager />}

          {/* DOCTORS MANAGER */}
          {activeSection === 'doctors' && <DoctorsManager />}

          {/* CONTACTS */}
          {activeSection === 'contacts' && <ContactsSection />}

          {/* SPECIALISTS */}
          {activeSection === 'specialists' && <SpecialistsSection />}

          {/* HERO SECTION */}
          {activeSection === 'hero' && <HeroManager />}
        </div>
      </main>
    </div>
  );
}