// src/app/services/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const departments = [
  { name: 'Pulmonology & Critical Care', desc: 'Comprehensive respiratory care and intensive monitoring for life-threatening conditions.', icon: '🫁', color: '#0F766E' },
  { name: 'Obstetrics & Gynaecology', desc: "Comprehensive women's health, maternity care, safe childbirth, and gynecological treatments.", icon: '🤰', color: '#7c3aed' },
  { name: 'Orthopedics & Trauma', desc: 'Specialized care for bone and joint disorders, and emergency trauma management.', icon: '🦴', color: '#0F766E' },
  { name: 'Ear Nose & Throat; Endoscopic & Microscopic Surgeries', desc: 'Advanced ENT care featuring minimally invasive endoscopic and precision microscopic procedures.', icon: '👂', color: '#7c3aed' },
  { name: 'General & Laparoscopic Surgeries', desc: 'Expert surgical care including minimally invasive laparoscopic procedures for faster recovery.', icon: '🏥', color: '#0F766E' },
  { name: 'Neurology, Cardiology, Nephrology', desc: 'Specialized medical care for the brain and nervous system, heart conditions, and kidney diseases.', icon: '🧠', color: '#7c3aed' },
  { name: 'Gastroenterology, Urology', desc: 'Expert diagnostic and therapeutic management of digestive system disorders and urinary tract conditions.', icon: '⚕️', color: '#0F766E' },
  { name: 'General Medicine, Dermatology', desc: 'Comprehensive primary healthcare, internal medicine, and specialized skin, hair, and nail care.', icon: '🩺', color: '#7c3aed' },
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

function useReveal(threshold = 0.1, delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay, threshold]);
  return [ref, visible];
}

function DeptCard({ dept, index, visible }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: 'clamp(22px, 3vw, 32px)',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: hovered ? dept.color + '40' : 'rgba(0,0,0,0.07)',
        boxShadow: hovered ? `0 20px 50px ${dept.color}18` : '0 4px 20px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: `all 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${index * 0.08}s`,
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-10px)' : 'translateY(0)') : 'translateY(30px)',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${dept.color}, ${dept.color}88)`,
        transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 0.4s ease',
      }} />

      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: dept.color + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem',
        transform: hovered ? 'scale(1.15) rotate(8deg)' : 'none',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: `0 4px 14px ${dept.color}25`,
      }}>
        {dept.icon}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 800, color: dept.color, margin: 0, lineHeight: 1.4 }}>
        {dept.name}
      </h3>
      <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: 0, flex: 1 }}>
        {dept.desc}
      </p>
      <Link
        href="/booking"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 700, color: dept.color,
          textDecoration: 'none', marginTop: 4,
          transition: 'gap 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.gap = '12px'}
        onMouseLeave={e => e.currentTarget.style.gap = '6px'}
      >
        Book Appointment →
      </Link>
    </div>
  );
}

function FacilityCard({ service, index, visible }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 20px',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: hovered ? 'rgba(15,118,110,0.3)' : 'rgba(0,0,0,0.07)',
        boxShadow: hovered ? '0 16px 40px rgba(15,118,110,0.13)' : '0 4px 14px rgba(0,0,0,0.06)',
        fontSize: 15, fontWeight: 600,
        color: '#1E293B', lineHeight: 1.5,
        textAlign: 'center',
        transition: `all 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${index * 0.06}s`,
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(30px)',
      }}
    >
      <div style={{
        fontSize: '2rem', marginBottom: 12,
        transform: hovered ? 'scale(1.2) rotate(5deg)' : 'none',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'inline-block',
      }}>
        {service.icon}
      </div>
      <div>{service.name}</div>
    </div>
  );
}

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('departments');
  const [heroRef, heroVisible]     = useReveal(0.05);
  const [tabsRef, tabsVisible]     = useReveal(0.1);
  const [gridRef, gridVisible]     = useReveal(0.1);
  const [facRef,  facVisible]      = useReveal(0.1);
  const [guideRef, guideVisible]   = useReveal(0.1);
  const [ctaRef, ctaVisible]       = useReveal(0.1);

  return (
    <div style={{ background: '#FFFFF0', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── HERO ── */}
      <div
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 60%, #059669 100%)',
    padding: 'clamp(80px,12vw,20px) 24px clamp(50px,8vw,90px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      >
        {/* Decorative circles */}
        {[{ w: 400, h: 400, top: -150, right: -100, op: 0.05 },
          { w: 250, h: 250, bottom: -80, left: -60, op: 0.04 }].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
            background: `rgba(255,255,255,${c.op})`,
            top: c.top, bottom: c.bottom, right: c.right, left: c.left,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.25)',
          color: '#fff', padding: '7px 20px', borderRadius: 50,
          fontSize: 12, fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', marginBottom: 20,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(-20px)',
          transition: 'all 0.8s ease 0.2s',
        }}>
          <span style={{ width: 8, height: 8, background: '#15f5ba', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          What We Offer
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 6vw, 64px)', fontWeight: 800,
          color: '#fff', margin: '0 0 18px', lineHeight: 1.12,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.3s',
        }}>
          Our Medical{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00f7ff, #15f5ba)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Services</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.85)',
          maxWidth: 600, margin: '0 auto',
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.4s',
        }}>
          At Aadhunika Multispeciality Hospital, we deliver comprehensive healthcare
          with state-of-the-art technology, expert specialists, and 24/7 facilities.
        </p>

        {/* Wave bottom */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#FFFFF0" />
          </svg>
        </div>
      </div>

      {/* ── TABS ── */}
      <div
        ref={tabsRef}
        style={{
          display: 'flex', justifyContent: 'center', gap: 12,
          padding: '48px 24px 20px', flexWrap: 'wrap',
          opacity: tabsVisible ? 1 : 0,
          transform: tabsVisible ? 'none' : 'translateY(20px)',
          transition: 'all 0.7s ease',
        }}
      >
        {[
          { key: 'departments', label: '🏥 Clinical Departments' },
          { key: 'facilities',  label: '⚙️ Facilities & Services' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 28px', borderRadius: 50,
              borderWidth: 2, borderStyle: 'solid',
              borderColor: activeTab === tab.key ? 'transparent' : '#E5E7EB',
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, #0F766E, #059669)'
                : '#fff',
              color: activeTab === tab.key ? '#fff' : '#374151',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: activeTab === tab.key
                ? '0 6px 20px rgba(15,118,110,0.35)'
                : '0 2px 8px rgba(0,0,0,0.06)',
              transform: activeTab === tab.key ? 'translateY(-2px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DEPARTMENTS ── */}
      {activeTab === 'departments' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 60px' }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(22px, 3.5vw, 32px)',
            fontWeight: 800, color: '#0F766E', marginBottom: 36, position: 'relative',
          }}>
            Clinical Departments
            <span style={{
              display: 'block', width: 60, height: 4, margin: '12px auto 0',
              background: 'linear-gradient(135deg, #0F766E, #15f5ba)', borderRadius: 2,
            }} />
          </h2>
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {departments.map((dept, i) => (
              <DeptCard key={dept.name} dept={dept} index={i} visible={gridVisible} />
            ))}
          </div>
        </div>
      )}

      {/* ── FACILITIES ── */}
      {activeTab === 'facilities' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 60px' }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(22px, 3.5vw, 32px)',
            fontWeight: 800, color: '#0F766E', marginBottom: 36,
          }}>
            Hospital Facilities & Services
            <span style={{
              display: 'block', width: 60, height: 4, margin: '12px auto 0',
              background: 'linear-gradient(135deg, #0F766E, #15f5ba)', borderRadius: 2,
            }} />
          </h2>
          <div
            ref={facRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {hospitalServices.map((service, i) => (
              <FacilityCard key={i} service={service} index={i} visible={facVisible} />
            ))}
          </div>
        </div>
      )}

      {/* ── PATIENT JOURNEY ── */}
      <div
        ref={guideRef}
        style={{
          maxWidth: 760, margin: '0 auto 60px', padding: '0 24px',
          opacity: guideVisible ? 1 : 0,
          transform: guideVisible ? 'none' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #F0FDFA, #ECFDF5)',
          borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)',
          borderWidth: 1, borderStyle: 'solid', borderColor: '#CCFBF1',
          boxShadow: '0 4px 20px rgba(15,118,110,0.1)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F766E', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            🗺️ Patient Care Journey
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '✔', text: 'Seamless walk-in & online appointment bookings' },
              { icon: '✔', text: 'Advanced diagnostics — PFT, Echo, Bronchoscopy & more' },
              { icon: '✔', text: 'Expert specialist consultations & continuous ICU monitoring' },
              { icon: '✔', text: 'Structured follow-up plans with insurance coordination' },
              { icon: '✔', text: 'Around-the-clock emergency & critical care services' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  fontSize: 15, color: '#065F46', fontWeight: 600,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 10, borderWidth: 1, borderStyle: 'solid',
                  borderColor: 'rgba(255,255,255,0.9)', lineHeight: 1.5,
                  display: 'flex', alignItems: 'center', gap: 12,
                  opacity: guideVisible ? 1 : 0,
                  transform: guideVisible ? 'none' : 'translateX(-20px)',
                  transition: `all 0.5s ease ${i * 0.1}s`,
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #059669, #0F766E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>✓</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div
        ref={ctaRef}
        style={{
          background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 50%, #059669 100%)',
          padding: 'clamp(50px, 8vw, 90px) 24px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'none' : 'translateY(40px)',
          transition: 'all 0.9s ease',
        }}
      >
        {[{ w: 350, h: 350, top: -130, right: -80, op: 0.06 },
          { w: 200, h: 200, bottom: -60, left: -40, op: 0.04 }].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
            background: `rgba(255,255,255,${c.op})`,
            top: c.top, bottom: c.bottom, right: c.right, left: c.left,
            pointerEvents: 'none',
          }} />
        ))}

        <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, color: '#fff', marginBottom: 14, position: 'relative' }}>
          Ready to Book Your Appointment?
        </h2>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto 36px', position: 'relative' }}>
          Our specialists are ready to provide the best care. Book online in minutes.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link
            href="/booking"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6B0000, #9b0000)',
              color: '#fff', padding: '15px 36px', borderRadius: 50,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(107,0,0,0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(107,0,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(107,0,0,0.4)'; }}
          >
            📅 Book Appointment
          </Link>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              color: '#fff', padding: '15px 36px', borderRadius: 50,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'none'; }}
          >
            📞 Contact Us
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.3);opacity:0.7;} }
        @keyframes float { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-10px);} }
        @media(max-width:640px){ }
      `}</style>
    </div>
  );
}
