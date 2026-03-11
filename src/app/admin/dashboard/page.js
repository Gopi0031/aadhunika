'use client';

import './dashboard.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import HeroManager from '../components/HeroManager';
import SpecialistsSection from '../components/SpecialistsSection';
import BookingsSection from '../components/BookingsSection';
import ContactsSection from '../components/ContactsSection';
import DoctorsManager from '../components/DoctorsManager';
import CalendarManager from '../components/CalendarManager';

import {
  Calendar, MessageSquare, Users, Clock, TrendingUp,
  BookOpen, Phone, LayoutDashboard, LogOut, Image,
  Menu, X, CalendarDays,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'bookings',    label: 'Bookings',        icon: BookOpen },
  { id: 'calendar',   label: 'Slot Management', icon: CalendarDays },
  { id: 'doctors',    label: 'Doctors',         icon: Users },
  { id: 'contacts',   label: 'Contacts',        icon: Phone },
  { id: 'specialists',label: 'Specialists',     icon: Users },
  { id: 'hero',       label: 'Hero Section',    icon: Image },
];

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
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const [stats, setStats] = useState({
    totalBookings: 0, pendingBookings: 0,
    todayBookings: 0, confirmedBookings: 0, totalContacts: 0,
  });

  const [revenue, setRevenue] = useState({
    todayRevenue: 0, monthRevenue: 0, totalRevenue: 0, doctorWise: [],
  });

  const [revenueTab, setRevenueTab] = useState('today');

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  useEffect(() => {
    if (!sessionStorage.getItem('adminAuth')) router.replace('/admin/login');
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingRes, contactRes, revRes] = await Promise.all([
          fetch('/api/booking'),
          fetch('/api/contact'),
          fetch('/api/revenue?byDoctor=1'),
        ]);

        const bookings = bookingRes.ok ? await bookingRes.json() : [];
        const contactData = contactRes.ok ? await contactRes.json() : [];
        const contacts = Array.isArray(contactData) ? contactData : [];

        const today = new Date().toISOString().split('T')[0];

        setStats({
          totalBookings:    bookings.length,
          pendingBookings:  bookings.filter(b => b.status === 'pending').length,
          todayBookings:    bookings.filter(b => b.date === today).length,
          confirmedBookings:bookings.filter(b => b.status === 'confirmed').length,
          totalContacts:    contacts.length,
        });

        if (revRes.ok) {
          const rev = await revRes.json();
          setRevenue({
            todayRevenue:  rev.todayRevenue  || 0,
            monthRevenue:  rev.monthRevenue  || 0,
            totalRevenue:  rev.totalRevenue  || 0,
            doctorWise:    rev.doctorWise    || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, [activeSection]);

  const handleSectionChange = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('adminAuth');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const getSectionTitle = () =>
    menuItems.find(m => m.id === activeSection)?.label ?? 'Dashboard';

  const currentRevenueValue =
    revenueTab === 'today' ? revenue.todayRevenue
    : revenueTab === 'month' ? revenue.monthRevenue
    : revenue.totalRevenue;

  // max revenue for bar-width calculation
  const maxDocRev = Math.max(
    1,
    ...(revenue.doctorWise || []).map(d =>
      revenueTab === 'today' ? d.todayRevenue
      : revenueTab === 'month' ? d.monthRevenue
      : d.totalRevenue
    )
  );

  return (
    <div className="admin-dashboard">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
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
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">MAIN MENU</p>
          {menuItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-active' : ''}`}
                onClick={() => handleSectionChange(item.id)}
              >
                <div className="sidebar-nav-icon"><item.icon size={20} /></div>
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

      {/* ===== MAIN ===== */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
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
              <span className="topbar-admin-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content">

          {/* ── DASHBOARD HOME ── */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-home">

              {/* Welcome Banner */}
              <div className="dash-welcome">
                <div>
                  <h2>Welcome back, Admin 👋</h2>
                  <p>Here's what's happening at your hospital today.</p>
                </div>
                <div className="dash-welcome-date">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="dash-stats-grid">
                <StatCard icon={<Calendar size={24}/>}      number={stats.totalBookings}    label="Total Bookings"  color="teal"   />
                <StatCard icon={<Clock size={24}/>}         number={stats.pendingBookings}  label="Pending"         color="orange" />
                <StatCard icon={<TrendingUp size={24}/>}    number={stats.todayBookings}    label="Today"           color="blue"   />
                <StatCard icon={<MessageSquare size={24}/>} number={stats.confirmedBookings}label="Confirmed"       color="green"  />
                <StatCard icon={<Users size={24}/>}         number={stats.totalContacts}    label="Contacts"        color="purple" />
                
              </div>
                            {/* Revenue Section */}
              <div className="dash-revenue-section">
                <div className="dash-revenue-header">
                  <h3>Revenue Overview</h3>
                  <div className="rev-tab-group">
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'month', label: 'This Month' },
                      { id: 'total', label: 'All Time' },
                    ].map(t => (
                      <button
                        key={t.id}
                        className={`rev-tab-btn ${revenueTab === t.id ? 'rev-tab-active' : ''}`}
                        onClick={() => setRevenueTab(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revenue Summary Cards */}
                <div className="rev-summary-grid">
                  <div className="rev-summary-card rev-primary">
                    <div className="rev-summary-icon"><TrendingUp size={22}/></div>
                    <div>
                      <p className="rev-summary-value">{formatINR(currentRevenueValue)}</p>
                      <p className="rev-summary-label">
                        {revenueTab === 'today' ? 'Today\'s Revenue'
                          : revenueTab === 'month' ? 'This Month\'s Revenue'
                          : 'Total Revenue'}
                      </p>
                    </div>
                  </div>
                  <div className="rev-summary-card rev-secondary">
                    <div className="rev-summary-icon rev-icon-purple"><Users size={22}/></div>
                    <div>
                      <p className="rev-summary-value">{revenue.doctorWise?.length || 0}</p>
                      <p className="rev-summary-label">Contributing Doctors</p>
                    </div>
                  </div>
                  <div className="rev-summary-card rev-secondary">
                    <div className="rev-summary-icon rev-icon-blue"><Calendar size={22}/></div>
                    <div>
                      <p className="rev-summary-value">{formatINR(revenue.monthRevenue)}</p>
                      <p className="rev-summary-label">Month Revenue</p>
                    </div>
                  </div>
                </div>

                {/* Doctor-wise Revenue */}
                <div className="rev-doctor-table">
                  <div className="rev-doctor-table-header">
                    <span>Doctor</span>
                    <span>Department</span>
                    <span>Revenue</span>
                  </div>

                  <div className="rev-doctor-list">
                    {(revenue.doctorWise || []).length === 0 ? (
                      <div className="rev-empty">No paid revenue recorded yet.</div>
                    ) : (
                      (revenue.doctorWise || []).slice(0, 10).map((d, i) => {
                        const val =
                          revenueTab === 'today'  ? d.todayRevenue
                          : revenueTab === 'month' ? d.monthRevenue
                          : d.totalRevenue;
                        const pct = Math.round((val / maxDocRev) * 100);

                        return (
                          <div key={d.doctorId || i} className="rev-doctor-row">
                            <div className="rev-doctor-name-cell">
                              <div className="rev-doctor-avatar">
                                {(d.doctorName || 'D')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="rev-doctor-name">{d.doctorName || 'Doctor'}</p>
                                <div className="rev-bar-wrap">
                                  <div className="rev-bar" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </div>
                            <span className="rev-doctor-dept">{d.dept || '—'}</span>
                            <span className="rev-doctor-amount">{formatINR(val)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>


              {/* Quick Actions */}
              <div className="dash-quick-actions">
                <h3>Quick Actions</h3>
                <div className="dash-quick-grid">
                  <button className="dash-quick-btn" onClick={() => handleSectionChange('bookings')}>
                    <BookOpen size={20}/><span>View Bookings</span>
                  </button>
                  <button className="dash-quick-btn" onClick={() => handleSectionChange('calendar')}>
                    <CalendarDays size={20}/><span>Manage Slots</span>
                  </button>
                  <button className="dash-quick-btn" onClick={() => handleSectionChange('doctors')}>
                    <Users size={20}/><span>Manage Doctors</span>
                  </button>
                  <button className="dash-quick-btn" onClick={() => handleSectionChange('contacts')}>
                    <Phone size={20}/><span>View Contacts</span>
                  </button>
                </div>
              </div>


            </div>
          )}

          {/* OTHER SECTIONS */}
          {activeSection === 'bookings'    && <BookingsSection />}
          {activeSection === 'calendar'    && <CalendarManager />}
          {activeSection === 'doctors'     && <DoctorsManager />}
          {activeSection === 'contacts'    && <ContactsSection />}
          {activeSection === 'specialists' && <SpecialistsSection />}
          {activeSection === 'hero'        && <HeroManager />}

        </div>
      </main>
    </div>
  );
}
