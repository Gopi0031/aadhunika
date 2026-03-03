'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const departments = [
  { name: 'Pulmonology & Critical Care', desc: 'Comprehensive respiratory care and intensive monitoring for life-threatening conditions.', icon: '🫁', color: '#16a34a' },
  { name: 'Obstetrics & Gynaecology', desc: "Comprehensive women's health, maternity care, safe childbirth, and gynecological treatments.", icon: '🤰', color: '#2563eb' },
  { name: 'Orthopedics & Trauma', desc: 'Specialized care for bone and joint disorders, and emergency trauma management.', icon: '🦴', color: '#16a34a' },
  { name: 'Ear Nose & Throat; Endoscopic & Microscopic Surgeries', desc: 'Advanced ENT care featuring minimally invasive endoscopic and precision microscopic procedures.', icon: '👂', color: '#2563eb' },
  { name: 'General & Laparoscopic Surgeries', desc: 'Expert surgical care including minimally invasive laparoscopic procedures for faster recovery.', icon: '🏥', color: '#16a34a' },
  { name: 'Neurology, Cardiology, Nephrology', desc: 'Specialized medical care for the brain and nervous system, heart conditions, and kidney diseases.', icon: '🧠', color: '#2563eb' },
  { name: 'Gastroenterology, Urology', desc: 'Expert diagnostic and therapeutic management of digestive system disorders and urinary tract conditions.', icon: '⚕️', color: '#16a34a' },
  { name: 'General Medicine, Dermatology', desc: 'Comprehensive primary healthcare, internal medicine, and specialized skin, hair, and nail care.', icon: '🩺', color: '#2563eb' },
];

const hospitalServices = [
  { icon: '🫀', name: 'Intensive Care Unit (ICU) & Neonatal Intensive Care Unit (NICU) with Ventilator Support' },
  { icon: '🚨', name: 'Emergency & Trauma Care Services' },
  { icon: '🔬', name: 'Clinical Laboratory & Diagnostic Services' },
  { icon: '💊', name: '24/7 In-House Pharmacy Services' },
  { icon: '🩻', name: 'Radiology Services (X-Ray & Ultrasonography)' },
  { icon: '🏥', name: 'Modular Operation Theatres' },
  { icon: '🫀', name: '2D Echocardiography (Cardiac Imaging)' },
  { icon: '📋', name: 'Insurance & TPA Assistance Desk' },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('departments');
  const [headerRef, headerVisible] = useReveal();
  const [gridRef, gridVisible] = useReveal();

  return (
    <>
      <style>{`
        /* ── Services Page Layout ── */
        .sp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #fffff0 50%, #f0f9ff 100%);
          padding: clamp(90px, 12vw, 140px) clamp(16px, 4vw, 40px) 60px;
          font-family: 'Segoe UI', sans-serif;
        }

        /* ── Header ── */
        .sp-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 48px;
        }
        .sp-header .section-tag {
          display: inline-block;
          background: linear-gradient(135deg, rgba(15,118,110,0.1), rgba(5,150,105,0.1));
          color: #0F766E;
          padding: 5px 18px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          border: 1px solid rgba(15,118,110,0.2);
          margin-bottom: 14px;
        }
        .sp-header h1 {
          font-size: clamp(28px, 5vw, 46px);
          font-weight: 800;
          color: #0F766E;
          margin: 0 0 14px;
          line-height: 1.2;
        }
        .sp-header p {
          font-size: clamp(14px, 2vw, 17px);
          color: #374151;
          line-height: 1.7;
          margin: 0;
        }

        /* ── Tabs ── */
        .sp-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .sp-tab-btn {
          padding: 12px 28px;
          border-radius: 50px;
          border: 2px solid #E5E7EB;
          background: #fff;
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .sp-tab-btn:hover {
          border-color: #0F766E;
          color: #0F766E;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(15,118,110,0.15);
        }
        .sp-tab-btn.active {
          background: linear-gradient(135deg, #0F766E, #059669);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 6px 20px rgba(15,118,110,0.35);
          transform: translateY(-2px);
        }

        /* ── Tab Content ── */
        .sp-tab-content { display: none; }
        .sp-tab-content.active { display: block; }

        /* ── Section Title ── */
        .sp-section-title {
          text-align: center;
          font-size: clamp(22px, 3.5vw, 32px);
          font-weight: 800;
          color: #0F766E;
          margin-bottom: 32px;
          position: relative;
        }
        .sp-section-title::after {
          content: '';
          display: block;
          width: 60px;
          height: 4px;
          background: linear-gradient(135deg, #0F766E, #15f5ba);
          border-radius: 2px;
          margin: 12px auto 0;
        }

        /* ── Services Grid ── */
        .sp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Service Card ── */
        .sp-card {
          background: #fff;
          border-radius: 20px;
          padding: 28px 24px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }
        .sp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0F766E, #15f5ba);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .sp-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(15,118,110,0.15);
          border-color: rgba(15,118,110,0.2);
        }
        .sp-card:hover::before { transform: scaleX(1); }
        .sp-card .sp-icon {
          font-size: 2.4rem;
          line-height: 1;
        }
        .sp-card h3 {
          font-size: 16px;
          font-weight: 800;
          color: #0F766E;
          margin: 0;
          line-height: 1.4;
        }
        .sp-card p {
          font-size: 14px;
          color: #4B5563;
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }
        .sp-card .sp-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #0F766E;
          text-decoration: none;
          margin-top: 4px;
          transition: gap 0.2s ease;
        }
        .sp-card .sp-link:hover { gap: 10px; }

        /* ── Facility Grid ── */
        .sp-facility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .sp-facility-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px 20px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          font-size: 15px;
          font-weight: 600;
          color: #1E293B;
          line-height: 1.5;
          transition: all 0.3s ease;
          text-align: center;
        }
        .sp-facility-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(15,118,110,0.13);
          border-color: rgba(15,118,110,0.2);
        }

        /* ── Patient Journey ── */
        .sp-guide {
          max-width: 760px;
          margin: 56px auto 0;
          background: linear-gradient(135deg, #F0FDFA, #ECFDF5);
          border-radius: 20px;
          padding: clamp(24px, 4vw, 40px);
          border: 1px solid #CCFBF1;
          box-shadow: 0 4px 20px rgba(15,118,110,0.1);
        }
        .sp-guide h2 {
          font-size: 20px;
          font-weight: 800;
          color: #0F766E;
          margin: 0 0 20px;
        }
        .sp-guide ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sp-guide li {
          font-size: 15px;
          color: #065F46;
          font-weight: 600;
          padding: 12px 16px;
          background: rgba(255,255,255,0.7);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.9);
          line-height: 1.5;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .sp-grid { grid-template-columns: 1fr; }
          .sp-facility-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 400px) {
          .sp-facility-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="sp-page">
        {/* Header */}
        <div
          ref={headerRef}
          className="sp-header"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease',
          }}
        >
          <span className="section-tag">What We Offer</span>
          <h1>Our Medical Services</h1>
          <p>
            At Aadhunika Multispeciality Hospital, we deliver comprehensive healthcare
            with state-of-the-art technology, expert specialists, and 24/7 facilities
            designed to meet every healthcare need.
          </p>
        </div>

        {/* Tabs */}
        <div className="sp-tabs">
          <button
            className={`sp-tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            🏥 Clinical Departments
          </button>
          <button
            className={`sp-tab-btn ${activeTab === 'facilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('facilities')}
          >
            ⚙️ Facilities & Services
          </button>
        </div>

        {/* Departments Tab */}
        <div className={`sp-tab-content ${activeTab === 'departments' ? 'active' : ''}`}>
          <h2 className="sp-section-title">Clinical Departments</h2>
          <div ref={gridRef} className="sp-grid">
            {departments.map((dept, index) => (
              <div
                key={dept.name}
                className="sp-card"
                style={{
                  opacity: gridVisible ? 1 : 0,
                  transform: gridVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s ease ${index * 0.08}s`,
                }}
              >
                <span className="sp-icon">{dept.icon}</span>
                <h3>{dept.name}</h3>
                <p>{dept.desc}</p>
                <Link href="/booking" className="sp-link">
                  Book Appointment →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Tab */}
        <div className={`sp-tab-content ${activeTab === 'facilities' ? 'active' : ''}`}>
          <h2 className="sp-section-title">Hospital Facilities & Services</h2>
          <div className="sp-facility-grid">
            {hospitalServices.map((service, index) => (
              <div
                key={index}
                className="sp-facility-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{service.icon}</div>
                {service.name}
              </div>
            ))}
          </div>
        </div>

        {/* Patient Journey */}
        <div className="sp-guide">
          <h2>🗺️ Patient Care Journey</h2>
          <ul>
            <li>✔ Seamless walk-in & online appointment bookings</li>
            <li>✔ Advanced diagnostics — PFT, Echo, Bronchoscopy & more</li>
            <li>✔ Expert specialist consultations & continuous ICU monitoring</li>
            <li>✔ Structured follow-up plans with insurance coordination</li>
            <li>✔ Around-the-clock emergency & critical care services</li>
          </ul>
        </div>
      </section>
    </>
  );
}
