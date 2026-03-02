// src/app/contact/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [heroRef, heroVisible] = useReveal(0.05);
  const [formRef, formVisible] = useReveal(0.1);
  const [infoRef, infoVisible] = useReveal(0.1);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('📤 Sending your message...');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.success) {
        toast.success('✅ Message sent! We will contact you shortly.');
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        toast.error('❌ ' + data.message);
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error('❌ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: <MapPin size={22} />,
      label: 'Address',
      value: 'Guntur, Andhra Pradesh, India - 522002',
      sub: 'Near Main Bus Stand',
      color: '#0F766E',
      bg: '#F0FDFA',
    },
    {
      icon: <Phone size={22} />,
      label: 'Phone',
      value: '+91 6305650469',
      sub: 'Available 24/7 for emergencies',
      href: 'tel:+916305650469',
      color: '#7c3aed',
      bg: '#F5F3FF',
    },
    {
      icon: <Mail size={22} />,
      label: 'Email',
      value: 'nagalakshmiakurathi.ak@gmail.com',
      sub: 'Reply within 24 hours',
      href: 'mailto:nagalakshmiakurathi.ak@gmail.com',
      color: '#0284c7',
      bg: '#F0F9FF',
    },
    {
      icon: <Clock size={22} />,
      label: 'Working Hours',
      value: 'Mon – Sat: 8:00 AM – 8:00 PM',
      sub: 'Emergency: 24/7 Available',
      color: '#b45309',
      bg: '#FFFBEB',
    },
  ];

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 16px',
    marginBottom: '16px',
    borderRadius: '12px',
    border: `2px solid ${focusedField === field ? '#0F766E' : '#E5E7EB'}`,
    fontSize: '15px',
    background: 'transparent',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(15,118,110,0.1)' : 'none',
    transform: focusedField === field ? 'translateY(-1px)' : 'none',
  });

  return (
    <div style={{ background: '#FFFFF0', minHeight: '100vh' }}>

      {/* ===== HERO BANNER ===== */}
      <div
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 60%, #059669 100%)',
          padding: 'clamp(80px, 12vw, 140px) 24px clamp(50px, 8vw, 90px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(-30px)',
          transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {/* Decorative circles */}
        {[
          { w: 300, h: 300, top: -100, right: -80, op: 0.06 },
          { w: 200, h: 200, bottom: -60, left: -50, op: 0.04 },
          { w: 150, h: 150, top: 30, left: '20%', op: 0.05 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
            background: 'rgba(255,255,255,' + c.op + ')',
            top: c.top, bottom: c.bottom, right: c.right, left: c.left,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
          padding: '7px 20px', borderRadius: 50, fontSize: 12,
          fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          marginBottom: 20,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.2s',
        }}>
          <span style={{ width: 8, height: 8, background: '#15f5ba', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          Get In Touch
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 800,
          color: '#fff', margin: '0 0 16px', lineHeight: 1.15,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.3s',
        }}>
          Contact <span style={{ background: 'linear-gradient(135deg, #00f7ff, #15f5ba)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Aadhunika</span> Hospital
        </h1>
        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.85)',
          maxWidth: 550, margin: '0 auto',
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.4s',
        }}>
          We're here to help with appointments, medical enquiries, and emergency guidance — 24/7.
        </p>

        {/* Wave divider */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#FFFFF0" />
          </svg>
        </div>
      </div>

      {/* ===== CONTACT CARDS ROW ===== */}
      <div style={{ padding: '60px 24px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20, marginBottom: 60,
        }}>
          {contactItems.map((item, i) => (
            <ContactCard key={i} item={item} delay={i * 0.1} />
          ))}
        </div>

        {/* ===== FORM + INFO GRID ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40, alignItems: 'flex-start',
        }}>

          {/* FORM */}
          <div
            ref={formRef}
            style={{
              background: '#fff', borderRadius: 24,
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              padding: 'clamp(24px, 4vw, 44px)',
              opacity: formVisible ? 1 : 0,
              transform: formVisible ? 'none' : 'translateX(-40px)',
              transition: 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <span style={{
                display: 'inline-block', background: 'linear-gradient(135deg, rgba(15,118,110,0.1), rgba(5,150,105,0.1))',
                color: '#0F766E', padding: '5px 16px', borderRadius: 50,
                fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
                textTransform: 'uppercase', border: '1px solid rgba(15,118,110,0.2)',
                marginBottom: 12,
              }}>Send Message</span>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: '#0F766E', margin: 0 }}>
                We'd love to hear from you
              </h2>
            </div>

            {submitted ? (
              <SuccessState />
            ) : (
              <form onSubmit={handleSubmit}>
                {[
                  { name: 'name', type: 'text', placeholder: '👤 Full Name', label: 'Full Name' },
                  { name: 'email', type: 'email', placeholder: '📧 Email Address', label: 'Email' },
                  { name: 'phone', type: 'tel', placeholder: '📱 Phone Number', label: 'Phone' },
                ].map((field) => (
                  <div key={field.name}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      {field.label} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={inputStyle(field.name)}
                    />
                  </div>
                ))}

                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Message <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="message"
                  placeholder="💬 How can we help you?"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 110 }}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%', padding: '15px 24px',
                    background: isSubmitting
                      ? '#9CA3AF'
                      : 'linear-gradient(135deg, #6B0000, #9b0000)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontSize: 16, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.3s ease',
                    boxShadow: isSubmitting ? 'none' : '0 6px 20px rgba(107,0,0,0.35)',
                    fontFamily: 'inherit', letterSpacing: '0.5px',
                  }}
                  onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(107,0,0,0.45)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(107,0,0,0.35)'; }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Sending...
                    </>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 14 }}>
                  🔒 Your information is safe with us
                </p>
              </form>
            )}
          </div>

          {/* INFO PANEL */}
          <div
            ref={infoRef}
            style={{
              opacity: infoVisible ? 1 : 0,
              transform: infoVisible ? 'none' : 'translateX(40px)',
              transition: 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s',
            }}
          >
            {/* Map Embed */}
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              marginBottom: 24, height: 280,
              position: 'relative',
            }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122960.80789488487!2d80.35714857812499!3d16.306527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a7562e4d4bdf3%3A0x7b6a7e4a3e7e1a0!2sGuntur%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Aadhunika Hospital Location"
              />
            </div>

            {/* Info Card */}
            <div style={{
              background: '#fff', borderRadius: 20,
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.07)',
              padding: 'clamp(20px, 3vw, 32px)',
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F766E', marginBottom: 24, paddingBottom: 14, borderBottom: '2px solid rgba(15,118,110,0.12)' }}>
                🏥 Hospital Information
              </h2>

              {contactItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  marginBottom: 20, padding: '14px 16px', borderRadius: 12,
                  background: item.bg, border: `1px solid ${item.color}22`,
                  transition: 'all 0.3s ease', cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: '#fff', color: item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 2px 10px ${item.color}30`, flexShrink: 0,
                    transition: 'transform 0.3s ease',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
                      {item.label}
                    </p>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, textDecoration: 'none', wordBreak: 'break-all' }}>
                        {item.value}
                      </a>
                    ) : (
                      <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, margin: 0 }}>{item.value}</p>
                    )}
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '3px 0 0' }}>{item.sub}</p>
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: 8, padding: '18px 20px',
                background: 'linear-gradient(135deg, #F0FDFA, #ECFDF5)',
                borderRadius: 12, border: '1px solid #CCFBF1',
              }}>
                <p style={{ fontSize: 14, color: '#065F46', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                  💚 Our dedicated team is always ready to assist you with appointments, medical enquiries, and emergency guidance around the clock.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div style={{ height: 60 }} />
    </div>
  );
}

function ContactCard({ item, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 20, padding: '24px 20px',
        border: `1px solid ${hovered ? item.color + '40' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: hovered ? `0 16px 40px ${item.color}20` : '0 4px 15px rgba(0,0,0,0.06)',
        textAlign: 'center', cursor: 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-8px)' : 'none') : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: item.bg, color: item.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
        transform: hovered ? 'scale(1.15) rotate(8deg)' : 'none',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: `0 4px 14px ${item.color}25`,
      }}>
        {item.icon}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
        {item.label}
      </p>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', margin: 0, wordBreak: 'break-word' }}>
        {item.href ? <a href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>{item.value}</a> : item.value}
      </p>
    </div>
  );
}

function SuccessState() {
  return (
    <div style={{
      textAlign: 'center', padding: '40px 20px',
      animation: 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #10B981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(16,185,129,0.4)',
      }}>
        <CheckCircle size={40} color="#fff" />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginBottom: 10 }}>
        Message Sent!
      </h3>
      <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
        Thank you for reaching out. Our team will contact you within 24 hours.
      </p>
    </div>
  );
}