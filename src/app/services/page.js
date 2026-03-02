// app/services/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const departments = [
  {
    name: 'Pulmonology & Critical Care',
    desc: 'Comprehensive respiratory care and intensive monitoring for life-threatening conditions.',
    icon: '🫁',
    color: '#16a34a', // Green
  },
  {
    name: 'Obstetrics & Gynaecology',
    desc: "Comprehensive women's health, maternity care, safe childbirth, and gynecological treatments.",
    icon: '🤰',
    color: '#2563eb', // Blue
  },
  {
    name: 'Orthopedics & Trauma',
    desc: 'Specialized care for bone and joint disorders, and emergency trauma management.',
    icon: '🦴',
    color: '#16a34a', // Green
  },
  {
    name: 'Ear Nose & Throat; Endoscopic & Microscopic Surgeries',
    desc: 'Advanced ENT care featuring minimally invasive endoscopic and precision microscopic procedures.',
    icon: '👂',
    color: '#2563eb', // Blue
  },
  {
    name: 'General & Laparoscopic Surgeries',
    desc: 'Expert surgical care including minimally invasive laparoscopic procedures for faster recovery.',
    icon: '🏥',
    color: '#16a34a', // Green
  },
  {
    name: 'Neurology, Cardiology, Nephrology',
    desc: 'Specialized medical care for the brain and nervous system, heart conditions, and kidney diseases.',
    icon: '🧠',
    color: '#2563eb', // Blue
  },
  {
    name: 'Gastroenterology, Urology',
    desc: 'Expert diagnostic and therapeutic management of digestive system disorders and urinary tract conditions.',
    icon: '⚕️',
    color: '#16a34a', // Green
  },
  {
    name: 'General Medicine, Dermatology',
    desc: 'Comprehensive primary healthcare, internal medicine, and specialized skin, hair, and nail care.',
    icon: '🩺',
    color: '#2563eb', // Blue
  }
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
  // { icon: '🩸', name: 'Hemodialysis & Renal Support Services' }
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