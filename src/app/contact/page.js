// src/app/contact/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';

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

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    handle: '@AadhunikaGroupIndia',
    href: 'https://www.facebook.com/people/Aadhunika-Group-India/61568169011116/',
    color: '#1877F2',
    bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    border: '#BFDBFE',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    handle: '@aadhunikamultispecialtyhospitl',
    href: 'https://www.instagram.com/aadhunikamultispecialtyhospitl/',
    color: '#E1306C',
    bg: 'linear-gradient(135deg, #FFF0F6, #FCE7F3)',
    border: '#FBCFE8',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="#E1306C" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    handle: '@Aadhunikamultispeciality',
    href: 'https://www.youtube.com/@Aadhunikamultispeciality',
    color: '#FF0000',
    bg: 'linear-gradient(135deg, #FFF5F5, #FEE2E2)',
    border: '#FECACA',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#fff"/>
      </svg>
    ),
  },
  {
    label: 'JustDial',
    handle: 'Aadhunika Hospital',
    href: 'https://www.justdial.com/Guntur/AADHUNIKA-MULTISPECIALITY-HOSPITAL-Beside-Kothapeta-Sivalayam-Kotha-Peta/9999PX863-X863-210402182220-D1I4_BZDET?auto=1&trkid=9966308896&term=adhunika',
    color: '#FF6B00',
    bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
    border: '#FED7AA',
    icon: (
      <span style={{
        fontSize: 13, fontWeight: 900, color: '#FF6B00',
        letterSpacing: '-0.5px', lineHeight: 1, fontFamily: 'serif',
      }}>JD</span>
    ),
  },
];

export default function ContactPage() {
  const [formData, setFormData]     = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [heroRef, heroVisible] = useReveal(0.05);
  const [formRef, formVisible] = useReveal(0.1);
  const [infoRef, infoVisible] = useReveal(0.1);
  const [socialRef, socialVisible] = useReveal(0.1);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('📤 Sending your message...');
    try {
      const res  = await fetch('/api/contact', {
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
      value: 'AADHUNIKA MULTISPECIALITY HOSPITAL, beside Sivalayam Street, Ganeshrao Peta, Kothapeta, Guntur, Andhra Pradesh, India - 522002',
      sub: 'Near Sivalayam Street',
      color: '#0F766E', bg: '#F0FDFA',
    },
    {
      icon: <Phone size={22} />,
      label: 'Phone',
      value: '+91 9492121131',
      sub: 'Available 24/7',
      href: 'tel:+919492121131',
      color: '#7c3aed', bg: '#F5F3FF',
    },
    {
      icon: <Mail size={22} />,
      label: 'Email',
      value: 'support@aadhunikahospital.com',
      sub: 'Reply within 24 hours',
      href: 'mailto:support@aadhunikahospital.com',
      color: '#0284c7', bg: '#F0F9FF',
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
    boxSizing: 'border-box',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(15,118,110,0.1)' : 'none',
    transform: focusedField === field ? 'translateY(-1px)' : 'none',
  });

  return (
    <>
      <style>{`
        @keyframes contactPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes contactBounceIn {
          0%   { opacity: 0; transform: scale(0.3); }
          50%  { opacity: 1; transform: scale(1.05); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes contactSpin {
          100% { transform: rotate(360deg); }
        }
        @keyframes socialSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .contact-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px 20px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          text-align: center;
          cursor: default;
          transition: all 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .contact-card:hover { transform: translateY(-8px); }
        .contact-card-icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .contact-card:hover .contact-card-icon { transform: scale(1.15) rotate(8deg); }
        .contact-card-label {
          font-size: 12px; font-weight: 700; color: #64748B;
          text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;
        }
        .contact-card-value {
          font-size: 14px; font-weight: 600; color: #1E293B;
          margin: 0; word-break: break-word;
        }

        .contact-info-item {
          display: flex; align-items: flex-start; gap: 14px;
          margin-bottom: 20px; padding: 14px 16px; border-radius: 12px;
          transition: all 0.3s ease; cursor: default;
        }
        .contact-info-item:hover { transform: translateX(6px); }
        .contact-info-icon-box {
          width: 46px; height: 46px; border-radius: 12px; background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform 0.3s ease;
        }

        .contact-send-btn {
          width: 100%; padding: 15px 24px; color: #fff; border: none;
          border-radius: 12px; font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          gap: 10px; transition: all 0.3s ease; letter-spacing: 0.5px;
          font-family: inherit; cursor: pointer;
        }
        .contact-send-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(107,0,0,0.45) !important;
        }

        /* ── Social card ── */
        .sc-social-card {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 18px; border-radius: 14px;
          text-decoration: none; cursor: pointer;
          flex: 1 1 180px; min-width: 160px; max-width: 260px;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          border: 1.5px solid #E5E7EB;
          background: #F9FAFB;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .sc-social-card:hover {
          transform: translateY(-5px) scale(1.03);
        }
        .sc-social-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sc-social-card:hover .sc-social-icon {
          transform: rotate(-8deg) scale(1.1);
        }
        .sc-social-arrow {
          margin-left: auto; font-size: 16px;
          color: #D1D5DB; flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .sc-social-card:hover .sc-social-arrow {
          transform: translateX(5px);
        }

        @media (max-width: 640px) {
          .contact-grid-cards    { grid-template-columns: 1fr !important; }
          .contact-form-info-grid { grid-template-columns: 1fr !important; }
          .contact-hero h1       { font-size: 28px !important; }
          .sc-social-card        { max-width: 100%; }
        }
      `}</style>

      <div  style={{ background: '#FFFFF0', minHeight: '100vh' }}>

        {/* ===== HERO ===== */}
        <div
          ref={heroRef}
          className="contact-hero"
          style={{
            background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 60%, #059669 100%)',
            padding: 'clamp(80px,12vw,10px) 24px clamp(50px,8vw,90px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'none' : 'translateY(-30px)',
            transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          {[
            { w:300, h:300, top:-100, right:-80, op:0.06 },
            { w:200, h:200, bottom:-60, left:-50, op:0.04 },
            { w:150, h:150, top:30, left:'20%', op:0.05 },
          ].map((c,i) => (
            <div key={i} style={{
              position:'absolute', width:c.w, height:c.h, borderRadius:'50%',
              background:`rgba(255,255,255,${c.op})`,
              top:c.top, bottom:c.bottom, right:c.right, left:c.left,
              pointerEvents:'none',
            }}/>
          ))}

          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)',
            border:'1px solid rgba(255,255,255,0.25)', color:'#fff',
            padding:'7px 20px', borderRadius:50, fontSize:12,
            fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase',
            marginBottom:20,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.2s',
          }}>
            <span style={{
              width:8, height:8, background:'#15f5ba', borderRadius:'50%',
              animation:'contactPulse 2s infinite', display:'inline-block',
            }}/>
            Get In Touch
          </div>

          <h1 style={{
            fontSize:'clamp(32px,6vw,60px)', fontWeight:800,
            color:'#fff', margin:'0 0 16px', lineHeight:1.15,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'none' : 'translateY(30px)',
            transition: 'all 0.8s ease 0.3s',
          }}>
            Contact{' '}
            <span style={{
              background:'linear-gradient(135deg,#00f7ff,#15f5ba)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>Aadhunika</span>{' '}Hospital
          </h1>

          <p style={{
            fontSize:'clamp(15px,2vw,18px)', color:'rgba(255,255,255,0.85)',
            maxWidth:550, margin:'0 auto',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.4s',
          }}>
            We're here to help with appointments, medical enquiries, and emergency guidance — 24/7.
          </p>

          <div style={{ position:'absolute', bottom:-1, left:0, right:0 }}>
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#FFFFF0"/>
            </svg>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div style={{ padding:'60px 24px 20px', maxWidth:1100, margin:'0 auto' }}>

          {/* Contact Cards */}
          <div className="contact-grid-cards" style={{
            display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
            gap:20, marginBottom:60,
          }}>
            {contactItems.map((item,i) => (
              <ContactCard key={i} item={item} delay={i * 0.1}/>
            ))}
          </div>

          {/* Form + Info Grid */}
          <div className="contact-form-info-grid" style={{
            display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',
            gap:40, alignItems:'flex-start',
          }}>

            {/* FORM */}
            <div ref={formRef} style={{
              background:'#fff', borderRadius:24,
              border:'1px solid rgba(0,0,0,0.07)',
              boxShadow:'0 8px 40px rgba(0,0,0,0.08)',
              padding:'clamp(24px,4vw,44px)',
              opacity: formVisible ? 1 : 0,
              transform: formVisible ? 'none' : 'translateX(-40px)',
              transition:'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}>
              <div style={{ marginBottom:28 }}>
                <span style={{
                  display:'inline-block',
                  background:'linear-gradient(135deg,rgba(15,118,110,0.1),rgba(5,150,105,0.1))',
                  color:'#0F766E', padding:'5px 16px', borderRadius:50,
                  fontSize:11, fontWeight:700, letterSpacing:'1.5px',
                  textTransform:'uppercase', border:'1px solid rgba(15,118,110,0.2)',
                  marginBottom:12,
                }}>Send Message</span>
                <h2 style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:800, color:'#0F766E', margin:0 }}>
                  We'd love to hear from you
                </h2>
              </div>

              {submitted ? <SuccessState/> : (
                <form onSubmit={handleSubmit}>
                  {[
                    { name:'name',  type:'text',  placeholder:'👤 Full Name',     label:'Full Name' },
                    { name:'email', type:'email', placeholder:'📧 Email Address', label:'Email' },
                    { name:'phone', type:'tel',   placeholder:'📱 Phone Number',  label:'Phone' },
                  ].map((field) => (
                    <div key={field.name}>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>
                        {field.label} <span style={{ color:'#ef4444' }}>*</span>
                      </label>
                      <input
                        type={field.type} name={field.name}
                        placeholder={field.placeholder} value={formData[field.name]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(field.name)}
                        onBlur={() => setFocusedField(null)}
                        required style={inputStyle(field.name)}
                      />
                    </div>
                  ))}

                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>
                    Message <span style={{ color:'#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="message" placeholder="💬 How can we help you?"
                    rows={4} value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required style={{ ...inputStyle('message'), resize:'vertical', minHeight:110 }}
                  />

                  <button
                    type="submit" disabled={isSubmitting}
                    className="contact-send-btn"
                    style={{
                      background: isSubmitting ? '#9CA3AF' : 'linear-gradient(135deg,#6B0000,#9b0000)',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: isSubmitting ? 'none' : '0 6px 20px rgba(107,0,0,0.35)',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={{
                          width:18, height:18,
                          border:'2px solid rgba(255,255,255,0.4)',
                          borderTopColor:'#fff', borderRadius:'50%',
                          animation:'contactSpin 0.8s linear infinite',
                        }}/>
                        Sending...
                      </>
                    ) : (
                      <><Send size={18}/> Send Message</>
                    )}
                  </button>

                  <p style={{ textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:14 }}>
                    🔒 Your information is safe with us
                  </p>
                </form>
              )}
            </div>

            {/* INFO PANEL */}
            <div ref={infoRef} style={{
              opacity: infoVisible ? 1 : 0,
              transform: infoVisible ? 'none' : 'translateX(40px)',
              transition:'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s',
            }}>
              {/* Map */}
              <div style={{
                borderRadius:20, overflow:'hidden',
                border:'1px solid rgba(0,0,0,0.08)',
                boxShadow:'0 8px 30px rgba(0,0,0,0.1)',
                marginBottom:24, height:280,
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2827.2078434934224!2d80.44725907514083!3d16.30016338441334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a757da004b6a7%3A0x20d5572b26d168f7!2sAADHUNIKA%20MULTISPECIALITY%20HOSPITAL!5e1!3m2!1sen!2sin!4v1772450776596!5m2!1sen!2sin"
                  width="100%" height="100%"
                  style={{ border:0, display:'block' }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Info Card */}
              <div style={{
                background:'#fff', borderRadius:20,
                border:'1px solid rgba(0,0,0,0.07)',
                boxShadow:'0 8px 30px rgba(0,0,0,0.07)',
                padding:'clamp(20px,3vw,32px)',
              }}>
                <h2 style={{
                  fontSize:20, fontWeight:800, color:'#0F766E',
                  marginBottom:24, paddingBottom:14,
                  borderBottom:'2px solid rgba(15,118,110,0.12)',
                }}>
                  🏥 Hospital Information
                </h2>

                {contactItems.map((item,i) => (
                  <div key={i} className="contact-info-item"
                    style={{ background:item.bg, border:`1px solid ${item.color}22` }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 4px 16px ${item.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; }}
                  >
                    <div className="contact-info-icon-box"
                      style={{ color:item.color, boxShadow:`0 2px 10px ${item.color}30` }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{
                        fontSize:11, fontWeight:700, color:'#64748B',
                        textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 4px',
                      }}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} style={{
                          fontSize:15, color:'#1E293B', fontWeight:600,
                          textDecoration:'none', wordBreak:'break-all',
                        }}>{item.value}</a>
                      ) : (
                        <p style={{ fontSize:15, color:'#1E293B', fontWeight:600, margin:0 }}>
                          {item.value}
                        </p>
                      )}
                      <p style={{ fontSize:12, color:'#94A3B8', margin:'3px 0 0' }}>{item.sub}</p>
                    </div>
                  </div>
                ))}

                {/* Green note */}
                <div style={{
                  marginTop:8, padding:'18px 20px',
                  background:'linear-gradient(135deg,#F0FDFA,#ECFDF5)',
                  borderRadius:12, border:'1px solid #CCFBF1',
                }}>
                  <p style={{ fontSize:14, color:'#065F46', lineHeight:1.7, margin:0, fontWeight:500 }}>
                    💚 Our dedicated team is always ready to assist you with appointments, medical enquiries, and emergency guidance around the clock.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FOLLOW US SECTION ===== */}
          <div
            ref={socialRef}
            style={{
              marginTop: 48,
              padding: '32px 28px',
              background: '#fff',
              borderRadius: 20,
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              opacity: socialVisible ? 1 : 0,
              transform: socialVisible ? 'none' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.15s',
            }}
          >
            {/* Section header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
              <div style={{
                width:4, height:22, background:'#0F766E',
                borderRadius:2, flexShrink:0,
              }}/>
              <p style={{
                fontSize:12, fontWeight:800, color:'#374151',
                textTransform:'uppercase', letterSpacing:'1.5px', margin:0,
              }}>Follow Us</p>
              <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:500, marginLeft:4 }}>
                — Stay connected with Aadhunika Hospital
              </span>
            </div>

            {/* Social Cards */}
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              {SOCIAL_LINKS.map((s, i) => (
                <SocialCard key={s.label} s={s} index={i} parentVisible={socialVisible}/>
              ))}
            </div>
          </div>

        </div>

        <div style={{ height:60 }}/>
      </div>
    </>
  );
}

// ── ContactCard ──
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
      className="contact-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? item.color + '40' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: hovered ? `0 16px 40px ${item.color}20` : '0 4px 15px rgba(0,0,0,0.06)',
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-8px)' : 'none') : 'translateY(30px)',
        transitionDelay: `${delay}s`,
      }}
    >
      <div className="contact-card-icon" style={{
        background: item.bg, color: item.color,
        boxShadow: `0 4px 14px ${item.color}25`,
        transform: hovered ? 'scale(1.15) rotate(8deg)' : 'none',
      }}>
        {item.icon}
      </div>
      <p className="contact-card-label">{item.label}</p>
      <p className="contact-card-value">
        {item.href
          ? <a href={item.href} style={{ color:'inherit', textDecoration:'none' }}>{item.value}</a>
          : item.value}
      </p>
    </div>
  );
}

// ── SocialCard ──
function SocialCard({ s, index, parentVisible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={s.label}
      className="sc-social-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: parentVisible ? 1 : 0,
        transform: parentVisible
          ? hovered ? 'translateY(-5px) scale(1.03)' : 'translateY(0)'
          : 'translateY(20px)',
        transitionDelay: parentVisible ? `${0.05 + index * 0.08}s` : '0s',
        background: hovered ? s.bg : '#F9FAFB',
        borderColor: hovered ? s.border : '#E5E7EB',
        boxShadow: hovered ? `0 8px 24px ${s.color}25` : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Icon */}
      <div
        className="sc-social-icon"
        style={{
          background: hovered ? '#fff' : s.bg,
          border: `1px solid ${s.border}`,
          boxShadow: hovered ? `0 4px 12px ${s.color}30` : 'none',
        }}
      >
        {s.icon}
      </div>

      {/* Text */}
      <div>
        <p style={{
          margin:0, fontSize:13, fontWeight:800, lineHeight:1.3,
          color: hovered ? s.color : '#1E293B',
          transition: 'color 0.25s ease',
        }}>{s.label}</p>
        <p style={{
          margin:'2px 0 0', fontSize:11, fontWeight:500, letterSpacing:'0.2px',
          color: hovered ? s.color + 'BB' : '#9CA3AF',
          transition: 'color 0.25s ease',
        }}>{s.handle}</p>
      </div>

      {/* Arrow */}
      <div
        className="sc-social-arrow"
        style={{ color: hovered ? s.color : '#D1D5DB' }}
      >→</div>
    </a>
  );
}

// ── SuccessState ──
function SuccessState() {
  return (
    <div style={{
      textAlign:'center', padding:'40px 20px',
      animation:'contactBounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{
        width:80, height:80, borderRadius:'50%',
        background:'linear-gradient(135deg,#10B981,#059669)',
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 20px',
        boxShadow:'0 10px 30px rgba(16,185,129,0.4)',
      }}>
        <CheckCircle size={40} color="#fff"/>
      </div>
      <h3 style={{ fontSize:22, fontWeight:800, color:'#059669', marginBottom:10 }}>
        Message Sent!
      </h3>
      <p style={{ fontSize:15, color:'#374151', lineHeight:1.7 }}>
        Thank you for reaching out. Our team will contact you within 24 hours.
      </p>
    </div>
  );
}
