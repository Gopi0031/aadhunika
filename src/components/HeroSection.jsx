// components/HeroSection.jsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

function StatCounter({ number, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const target = parseInt(number);
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
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
    <div ref={ref} style={{
      textAlign: 'center',
      padding: '16px 20px',
      borderRight: '1px solid rgba(255,255,255,0.15)',
      flex: '1 1 120px',
    }}>
      <div style={{
        fontSize: 'clamp(24px, 3.5vw, 38px)',
        fontWeight: 800,
        color: '#fff',
        lineHeight: 1,
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: 600,
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {label}
      </div>
    </div>
  );
}



function HeroContent() {
  return (
    <div style={{
      position: 'relative', zIndex: 3,
      textAlign: 'center',
      padding: '0 clamp(16px, 4vw, 40px)',
      maxWidth: 820, margin: '0 auto',
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(30px, 6vw, 64px)',
        fontWeight: 800, color: '#fff',
        margin: '0 0 16px', lineHeight: 1.15,
        textShadow: '0 2px 20px rgba(0,0,0,0.3)',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        Aadhunika{' '}
        <span style={{
          background: 'linear-gradient(135deg, #00f7ff, #15f5ba)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Multispeciality
        </span>{' '}
        Hospital
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(16px, 2.5vw, 22px)',
        color: 'rgba(255,255,255,0.92)',
        margin: '0 0 10px', fontWeight: 500,
      }}>
        Your Trusted Partner in Health &amp; Wellness
      </p>

      {/* Tagline */}
      <p style={{
        fontSize: 'clamp(13px, 1.8vw, 16px)',
        color: 'rgba(255,255,255,0.72)',
        margin: '0 0 32px', lineHeight: 1.6,
      }}>
        Advanced medical care with compassion — 24/7 emergency services available
      </p>

      {/* CTA Buttons */}
      <div style={{
        display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <a
          href="/services"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 30px', borderRadius: 50,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.5)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            fontFamily: "'Segoe UI', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.28)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          ✦ Explore Services
        </a>
        <Link
          href="/booking"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 30px', borderRadius: 50,
            background: 'linear-gradient(135deg, #6B0000, #9b0000)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 8px 25px rgba(107,0,0,0.4)',
            transition: 'all 0.3s ease',
            fontFamily: "'Segoe UI', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 35px rgba(107,0,0,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(107,0,0,0.4)';
          }}
        >
          📅 Book Appointment
        </Link>
      </div>
    </div>
  );
}

export default function HeroSection({ heroData }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollDown = () => {
    document.querySelector('.specialists')?.scrollIntoView({ behavior: 'smooth' });
  };

  const sectionBase = {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', sans-serif",
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 1s ease',
  };

  return (
    <>
      <style>{`
        @keyframes heroPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.35); opacity: 0.65; }
        }
       
        .hero-swiper-full { width: 100%; height: 100%; }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.5) !important;
          width: 10px !important; height: 10px !important;
        }
        .swiper-pagination-bullet-active {
          background: #15f5ba !important;
          width: 28px !important;
          border-radius: 5px !important;
        }
      `}</style>

      {/* ── NO HERO DATA (fallback) ── */}
      {(!heroData || heroData.length === 0) ? (
        <section
          ref={sectionRef}
          style={{
            ...sectionBase,
            background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 50%, #059669 100%)',
          }}
        >
          {/* Deco circles */}
          {[
            { w: 500, h: 500, top: -150, right: -100 },
            { w: 300, h: 300, bottom: -80, left: -60 },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', width: c.w, height: c.h,
              borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
              top: c.top, bottom: c.bottom, right: c.right, left: c.left,
              pointerEvents: 'none',
            }} />
          ))}

          <HeroContent />

        

        
        </section>

      ) : (
        /* ── WITH HERO DATA ── */
        <section ref={sectionRef} style={sectionBase}>
          {/* Swiper Background */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
          }}>
            <Swiper
              modules={[Autoplay, EffectFade, Pagination]}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              loop
              speed={1000}
              pagination={{
                clickable: true,
                dynamicBullets: true,
                renderBullet: (index, className) =>
                  `<span class="${className} hero-pagination-bullet"></span>`,
              }}
              className="hero-swiper-full"
            >
              {heroData.map((img) => (
                <SwiperSlide key={img._id}>
                  <img
                    src={img.image}
                    alt="Aadhunika Hospital"
                    loading="eager"
                    draggable={false}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Dark Overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(135deg, rgba(4,59,59,0.78) 0%, rgba(15,118,110,0.6) 100%)',
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 3, width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            paddingBottom: 100,
          }}>
            <HeroContent />
          </div>
        
        </section>
      )}
    </>
  );
}
