// app/services/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const departments = [
  {
    name: 'Pulmonology',
    desc: 'Comprehensive respiratory care including bronchoscopy, PFT, and advanced lung disease management.',
    icon: '🫁',
    color: '#0F766E',
  },
  {
    name: 'Gynaecology & Obstetrics',
    desc: "Women's health, pregnancy care, safe childbirth, and advanced infertility treatments.",
    icon: '👩‍⚕️',
    color: '#7c3aed',
  },
  {
    name: 'Orthopedics & Polytrauma',
    desc: 'Bone & joint disorders, trauma care, and advanced orthopedic surgical procedures.',
    icon: '🦴',
    color: '#b45309',
  },
  {
    name: 'ENT',
    desc: 'Expert ear, nose, throat care with endoscopic procedures and precision diagnostics.',
    icon: '👂',
    color: '#0284c7',
  },
  {
    name: 'General Medicine',
    desc: 'Primary care for chronic conditions, preventive health management, and internal medicine.',
    icon: '🩺',
    color: '#059669',
  },
  {
    name: 'General Surgery',
    desc: 'Laparoscopic and minimally invasive surgical procedures with rapid recovery.',
    icon: '🏥',
    color: '#dc2626',
  },
];

const hospitalServices = [
  { icon: '🫀', name: 'ICU & NICU with Ventilators' },
  { icon: '🚑', name: 'Trauma & Emergency' },
  { icon: '🔬', name: 'Laboratory Services' },
  { icon: '💊', name: 'Pharmacy (24/7)' },
  { icon: '🩻', name: 'X-Ray & Ultrasound' },
  { icon: '🏥', name: 'Operation Theater' },
  { icon: '🫀', name: '2D Echocardiography' },
  { icon: '📋', name: 'Insurance Desk' },
  { icon: '🩸', name: 'Dialysis Support' },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
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
    <section className="services-page">
      {/* Header */}
      <div
        ref={headerRef}
        className="services-header"
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
      <div className="services-tabs">
        <button
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          🏥 Clinical Departments
        </button>
        <button
          className={`tab-btn ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          ⚙️ Facilities & Services
        </button>
      </div>

      {/* Departments Tab */}
      <div className={`tab-content ${activeTab === 'departments' ? 'active' : ''}`}>
        <h2 className="section-title">Clinical Departments</h2>
        <div ref={gridRef} className="services-grid">
          {departments.map((dept, index) => (
            <div
              key={dept.name}
              className="service-card"
              style={{
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s ease ${index * 0.1}s`,
              }}
            >
              <span className="service-icon">{dept.icon}</span>
              <h3>{dept.name}</h3>
              <p>{dept.desc}</p>
              <Link href="/booking" className="service-link">
                Book Appointment →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities Tab */}
      <div className={`tab-content ${activeTab === 'facilities' ? 'active' : ''}`}>
        <h2 className="section-title">Hospital Facilities & Services</h2>
        <div className="facility-grid">
          {hospitalServices.map((service, index) => (
            <div
              key={index}
              className="facility-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{service.icon}</div>
              {service.name}
            </div>
          ))}
        </div>
      </div>

      {/* Patient Journey */}
      <div className="services-guide">
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
  );
}