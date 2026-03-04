// src/app/about/AboutPageClient.js
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// =============================================
// HOOK: useReveal
// =============================================
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

// =============================================
// COMPONENT: CounterStat
// =============================================
function CounterStat({ number, suffix, label, color }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const target = parseInt(number, 10);
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(Math.floor(current));
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [number]);

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '24px 20px' }}>
      <div style={{
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: 800,
        color: color || '#0F766E',
        lineHeight: 1,
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontSize: 13, color: '#64748B', fontWeight: 600,
        marginTop: 6, textTransform: 'uppercase', letterSpacing: '1px',
      }}>
        {label}
      </div>
    </div>
  );
}

// =============================================
// COMPONENT: ImageFrame
// =============================================
function ImageFrame({ src, alt }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', borderRadius: 24, overflow: 'visible' }}
    >
      {/* Image container */}
      <div style={{
        borderRadius: 24, overflow: 'hidden',
        boxShadow: hovered
          ? '0 30px 70px rgba(0,0,0,0.18)'
          : '0 20px 60px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>
        <img
          src={src} alt={alt}
          style={{
            width: '100%',
            height: 'clamp(280px, 40vw, 420px)',
            objectFit: 'cover', display: 'block',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(4,59,59,0.3), transparent)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          borderRadius: 24, pointerEvents: 'none',
        }} />
      </div>

      {/* Decorative border ring — NO shorthand 'border' mixed with borderColor */}
      <div style={{
        position: 'absolute',
        top: hovered ? -12 : -8,
        right: hovered ? -12 : -8,
        bottom: hovered ? -12 : -8,
        left: hovered ? -12 : -8,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: hovered
          ? 'rgba(15,118,110,0.45)'
          : 'rgba(15,118,110,0.18)',
        borderRadius: 30,
        zIndex: -1,
        transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// =============================================
// COMPONENT: FloatingBadge
// =============================================
function FloatingBadge({ top, bottom, left, right, bg, children }) {
  return (
    <div style={{
      position: 'absolute', top, bottom, left, right,
      background: bg, borderRadius: 14, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 2,
      animation: 'float 4s ease-in-out infinite',
      borderWidth: bg === '#fff' ? 1 : 0,
      borderStyle: 'solid',
      borderColor: bg === '#fff' ? 'rgba(0,0,0,0.08)' : 'transparent',
    }}>
      {children}
    </div>
  );
}

// =============================================
// COMPONENT: AboutCard
// =============================================
function AboutCard({ card, delay, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 20,
        padding: 'clamp(24px, 3vw, 36px)',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: hovered ? card.color + '40' : 'rgba(0,0,0,0.07)',
        boxShadow: hovered
          ? `0 20px 50px ${card.color}18`
          : '0 4px 20px rgba(0,0,0,0.06)',
        transition: `all 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-10px)' : 'none'
          : 'translateY(30px)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${card.color}, ${card.color}88)`,
        transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 0.4s ease',
      }} />

      {/* Icon */}
      <div style={{
        width: 60, height: 60, borderRadius: 16,
        background: card.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: 20,
        transform: hovered ? 'scale(1.15) rotate(8deg)' : 'none',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: `0 4px 14px ${card.color}25`,
      }}>
        {card.icon}
      </div>

      <h3 style={{
        fontSize: 20, fontWeight: 800,
        color: card.color, marginBottom: 14,
      }}>
        {card.title}
      </h3>

      {card.text && (
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', margin: 0 }}>
          {card.text}
        </p>
      )}

      {card.list && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {card.list.map((item, i) => (
            <li key={i} style={{
              fontSize: 14, color: '#374151', lineHeight: 1.7,
              padding: '8px 0 8px 22px', position: 'relative',
              borderBottom: i < card.list.length - 1
                ? '1px solid #F1F5F9' : 'none',
            }}>
             
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============================================
// COMPONENT: WhyItem
// =============================================
function WhyItem({ item, delay, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 14,
        background: hovered
          ? 'rgba(15,118,110,0.08)'
          : 'rgba(15,118,110,0.04)',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: hovered
          ? 'rgba(15,118,110,0.25)'
          : 'rgba(15,118,110,0.1)',
        transform: hovered
          ? 'translateX(8px)'
          : visible ? 'none' : 'translateX(-20px)',
        opacity: visible ? 1 : 0,
        transition: `all 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
        cursor: 'default',
        boxShadow: hovered
          ? '0 4px 16px rgba(15,118,110,0.12)'
          : 'none',
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
      <span style={{
        fontSize: 15, color: '#374151',
        fontWeight: 500, lineHeight: 1.5,
      }}>
        {item.text}
      </span>
    </div>
  );
}

// =============================================
// MAIN EXPORT: AboutPageClient
// =============================================
export default function AboutPageClient({ whoWeAreImage, whyChooseImage }) {
  const [heroRef, heroVisible] = useReveal(0.05);
  const [split1Ref, split1Visible] = useReveal(0.1);
  const [cardsRef, cardsVisible] = useReveal(0.1);
  const [split2Ref, split2Visible] = useReveal(0.1);
  const [teamRef, teamVisible] = useReveal(0.1);

 

  const cards = [
    {
      title: 'Our Mission', icon: '🎯', color: '#0F766E', bg: '#F0FDFA',
      text: 'To enhance the well-being of our community by providing ethical, accessible, and advanced medical services with compassion, innovation, and unwavering dedication to patient care.',
    },
    {
      title: 'Our Vision', icon: '🔭', color: '#7c3aed', bg: '#F5F3FF',
      text: 'To become a nationally recognized healthcare institution known for clinical excellence, technological innovation, and a patient-first approach that transforms lives.',
    },
    {
      title: 'Our Values', icon: '❤️', color: '#dc2626', bg: '#FFF1F2',
      list: [
        'Compassion & empathy in every interaction',
        'Integrity and ethical medical practices',
        'Commitment to clinical excellence',
        'Continuous innovation & improvement',
        'Respect for every individual',
      ],
    },
  ];

  const whyItems = [
    { icon: '🩺', text: 'Experienced & qualified doctors supported by skilled staff' },
    { icon: '🏥', text: 'Comprehensive multispeciality services under one roof' },
    { icon: '👤', text: 'Patient-first approach with personalized treatment plans' },
    { icon: '🔬', text: 'Modern infrastructure with high safety and hygiene standards' },
    { icon: '📋', text: 'Commitment to ethical practices and quality outcomes' },
    { icon: '🚑', text: '24/7 emergency and critical care support' },
  ];

  const decorCircles = [
    { w: 400, h: 400, top: -150, right: -100, op: 0.05 },
    { w: 250, h: 250, bottom: -80, left: -60, op: 0.04 },
  ];

  return (
    <div style={{ background: '#FFFFF0', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 60%, #059669 100%)',
          padding: 'clamp(80px, 14vw, 20px) 24px clamp(60px, 5vw, 100px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      >
        {decorCircles.map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h,
            borderRadius: '50%', background: `rgba(255,255,255,${c.op})`,
            top: c.top, bottom: c.bottom,
            right: c.right, left: c.left, pointerEvents: 'none',
          }} />
        ))}

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          borderWidth: 1, borderStyle: 'solid',
          borderColor: 'rgba(255,255,255,0.25)',
          color: '#fff', padding: '7px 20px', borderRadius: 50,
          fontSize: 12, fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', marginBottom: 20,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(-20px)',
          transition: 'all 0.8s ease 0.2s',
        }}>
          <span style={{
            width: 8, height: 8, background: '#15f5ba',
            borderRadius: '50%', animation: 'pulse 2s infinite',
          }} />
          Our Story
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 6vw, 64px)', fontWeight: 800,
          color: '#fff', margin: '0 0 18px', lineHeight: 1.12,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.3s',
        }}>
          About{' '}
          <span style={{
            background: 'linear-gradient(135deg,#00f7ff,#15f5ba)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Aadhunika</span>
          <br />Group Of India
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: 600, margin: '0 auto',
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.4s',
        }}>
          A forward-thinking healthcare organization committed to delivering
          high-quality, compassionate, and patient-centric medical services.
        </p>

        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg
            viewBox="0 0 1440 60" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            <path
              d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
              fill="#FFFFF0"
            />
          </svg>
        </div>
      </div>

     

      {/* ── WHO WE ARE ── */}
      <div ref={split1Ref} style={{
        maxWidth: 1100, margin: '0 auto', padding: '60px 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(30px, 5vw, 70px)', alignItems: 'center',
        }}>
          {/* Text */}
          <div style={{
            opacity: split1Visible ? 1 : 0,
            transform: split1Visible ? 'none' : 'translateX(-50px)',
            transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(15,118,110,0.1), rgba(5,150,105,0.1))',
              color: '#0F766E', padding: '5px 16px', borderRadius: 50,
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderWidth: 1, borderStyle: 'solid',
              borderColor: 'rgba(15,118,110,0.2)',
              marginBottom: 16,
            }}>About Us</span>

            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800,
              color: '#0F766E', marginBottom: 20, lineHeight: 1.2,
            }}>
              Who We Are
            </h2>

            <div style={{
              width: 50, height: 4,
              background: 'linear-gradient(90deg, #0F766E, #15f5ba)',
              borderRadius: 2, marginBottom: 24,
            }} />

            {[
              'Aadhunika Group India is a forward-thinking healthcare organization dedicated to delivering high-quality, patient-centric medical services.',
              'We integrate advanced medical technology with compassionate care to ensure safe, ethical, and effective treatment for every patient.',
              'With a strong focus on clinical excellence and community well-being, we strive to create a healthcare environment built on trust, transparency, and continuous improvement.',
            ].map((p, i) => (
              <p key={i} style={{
                fontSize: 16, lineHeight: 1.8,
                color: '#374151', marginBottom: 16,
              }}>{p}</p>
            ))}

            <Link
              href="/booking"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #6B0000, #9b0000)',
                color: '#fff', padding: '13px 28px', borderRadius: 50,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(107,0,0,0.35)',
                transition: 'all 0.3s ease', marginTop: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 30px rgba(107,0,0,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow =
                  '0 6px 20px rgba(107,0,0,0.35)';
              }}
            >
              📅 Book Appointment →
            </Link>
          </div>

          {/* Image */}
          <div style={{
            position: 'relative',
            opacity: split1Visible ? 1 : 0,
            transform: split1Visible ? 'none' : 'translateX(50px)',
            transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s',
          }}>
            <ImageFrame
              src={
                whoWeAreImage?.image ||
                '/about/specialist-discussing-medication-treatment.jpg'
              }
              alt="Specialist Discussing Treatment"
            />
          </div>
        </div>
      </div>

      {/* ── MISSION / VISION / VALUES ── */}
      <div ref={cardsRef} style={{
        background: '#F8FAFC', padding: '70px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,rgba(15,118,110,0.1),rgba(5,150,105,0.1))',
              color: '#0F766E', padding: '5px 16px', borderRadius: 50,
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderWidth: 1, borderStyle: 'solid',
              borderColor: 'rgba(15,118,110,0.2)',
              marginBottom: 12,
            }}>
              What Drives Us
            </span>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 38px)',
              fontWeight: 800, color: '#0F766E', margin: 0,
            }}>
              Our Core Principles
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {cards.map((card, i) => (
              <AboutCard
                key={i}
                card={card}
                delay={i * 0.15}
                visible={cardsVisible}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY CHOOSE US ── */}
      <div ref={split2Ref} style={{
        maxWidth: 1100, margin: '0 auto', padding: '70px 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(30px, 5vw, 70px)', alignItems: 'center',
        }}>
          {/* Image */}
          <div style={{
            position: 'relative',
            opacity: split2Visible ? 1 : 0,
            transform: split2Visible ? 'none' : 'translateX(-50px)',
            transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}>
            <ImageFrame
              src={
                whyChooseImage?.image ||
                '/about/young-female-doctor-white-coat-with-stethoscope-around-her-neck-looking-front-smiling-spreading-arms-sides-sitting-table-with-laptop-light-wall.jpg'
              }
              alt="Why Choose Aadhunika"
            />
          </div>

          {/* Text */}
          <div style={{
            opacity: split2Visible ? 1 : 0,
            transform: split2Visible ? 'none' : 'translateX(50px)',
            transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s',
          }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,rgba(15,118,110,0.1),rgba(5,150,105,0.1))',
              color: '#0F766E', padding: '5px 16px', borderRadius: 50,
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderWidth: 1, borderStyle: 'solid',
              borderColor: 'rgba(15,118,110,0.2)',
              marginBottom: 16,
            }}>
              Why Aadhunika
            </span>

            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800,
              color: '#0F766E', marginBottom: 20, lineHeight: 1.2,
            }}>
              Why Choose Aadhunika Hospital?
            </h2>

            <div style={{
              width: 50, height: 4,
              background: 'linear-gradient(90deg, #0F766E, #15f5ba)',
              borderRadius: 2, marginBottom: 28,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {whyItems.map((item, i) => (
                <WhyItem
                  key={i}
                  item={item}
                  delay={split2Visible ? i * 0.1 : 0}
                  visible={split2Visible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div
        ref={teamRef}
        style={{
          background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 50%, #059669 100%)',
          padding: 'clamp(50px, 8vw, 90px) 24px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          opacity: teamVisible ? 1 : 0,
          transform: teamVisible ? 'none' : 'translateY(40px)',
          transition: 'all 0.9s ease',
        }}
      >
        {[
          { w: 350, h: 350, top: -130, right: -80, op: 0.06 },
          { w: 200, h: 200, bottom: -60, left: -40, op: 0.04 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h,
            borderRadius: '50%',
            background: `rgba(255,255,255,${c.op})`,
            top: c.top, bottom: c.bottom,
            right: c.right, left: c.left, pointerEvents: 'none',
          }} />
        ))}

        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800,
          color: '#fff', marginBottom: 14, position: 'relative',
        }}>
          Ready to Experience World-Class Care?
        </h2>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: 550, margin: '0 auto 36px',
          position: 'relative',
        }}>
          Book your appointment today and let our specialists take care of you.
        </p>

        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center',
          flexWrap: 'wrap', position: 'relative',
        }}>
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
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow =
                '0 16px 40px rgba(107,0,0,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow =
                '0 8px 25px rgba(107,0,0,0.4)';
            }}
          >
            📅 Book Appointment
          </Link>

          <Link
            href="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: '#fff', padding: '15px 36px', borderRadius: 50,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              borderWidth: 2, borderStyle: 'solid',
              borderColor: 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background =
                'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background =
                'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            📞 Contact Us
          </Link>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.3); opacity: 0.7; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}