// components/HeroSection.jsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

function HeroContent() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '0 clamp(16px, 4vw, 40px)',
      maxWidth: 820, margin: '0 auto',
      width: '100%',
    }}>

      {/* ── HEADLINE ── */}
      <h1 style={{
        fontSize: 'clamp(30px, 6vw, 64px)',
        fontWeight: 900,
        color: '#fff',
        margin: '0 0 16px',
        lineHeight: 1.1,
        letterSpacing: '-1px',
        textShadow: '0 4px 32px rgba(0,0,0,0.45)',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        Aadhunika{' '}
        <span style={{
          background: 'linear-gradient(135deg, #00f7ff 0%, #15f5ba 55%, #05c98a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontStyle: 'italic',
        }}>
          Multispeciality
        </span>{' '}
        <span style={{
          fontWeight: 300,
          letterSpacing: '4px',
          fontSize: 'clamp(24px, 4.5vw, 52px)',
          color: 'rgba(255,255,255,0.75)',
          textTransform: 'uppercase',
          fontStyle: 'normal',
        }}>
          Hospital
        </span>
      </h1>

      {/* ── TAGLINE ── */}
      <p style={{
        fontSize: 'clamp(15px, 2.2vw, 20px)',
        color: 'rgba(255,255,255,0.88)',
        margin: '0 0 8px',
        fontWeight: 500,
        letterSpacing: '0.3px',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        Your Trusted Partner in Health &amp; Wellness
      </p>

      {/* ── SUB TEXT ── */}
      <p style={{
        fontSize: 'clamp(12px, 1.6vw, 15px)',
        color: 'rgba(255,255,255,0.5)',
        margin: '0 0 32px',
        lineHeight: 1.7,
        fontWeight: 400,
        letterSpacing: '0.4px',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        Advanced medical care with compassion — 24/7 emergency services available
      </p>

      {/* ── BUTTONS (unchanged) ── */}
      <div style={{
        display: 'flex', gap: 14,
        justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <a
          href="/services"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 30px', borderRadius: 50,
            background: 'rgba(255,255,255,0.15)',
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
  const [headerHeight, setHeaderHeight] = useState(80);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const header = document.querySelector('header');
    if (header) setHeaderHeight(header.offsetHeight);

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) setScrollY(-sectionRef.current.getBoundingClientRect().top);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionBase = {
    position: 'relative',
    width: '100%',
    height: `calc(100vh - ${headerHeight}px)`,
    minHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    background: '#043b3b',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', sans-serif",
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 1s ease',
  };

  return (
    <>
      <style>{`
        .hero-swiper-container {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 1;
        }
        .hero-text-wrapper {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .hero-swiper-full {
          width: 100% !important;
          height: 100% !important;
        }
        .hero-swiper-full .swiper-wrapper,
        .hero-swiper-full .swiper-slide {
          height: 100% !important; width: 100% !important;
        }
        .hero-parallax-image {
          position: absolute !important;
          left: 0 !important; top: -10% !important;
          width: 100% !important; height: 120% !important;
          object-fit: cover !important;
          object-position: center center !important;
          will-change: transform;
          transition: transform 0.1s ease-out;
          z-index: 1;
        }
        .hero-overlay {
          position: absolute; inset: 0; z-index: 5;
          background: linear-gradient(135deg, rgba(4,59,59,0.7) 0%, rgba(15,118,110,0.5) 100%);
          pointer-events: none;
        }
        .swiper-pagination-bullet { background: rgba(255,255,255,0.5) !important; width: 10px !important; height: 10px !important; }
        .swiper-pagination-bullet-active { background: #15f5ba !important; width: 28px !important; border-radius: 5px !important; }

        @media (max-width: 768px) {
          .hero-swiper-container {
            position: relative;
            height: 56.25vw !important;
            flex-shrink: 0;
          }
          .hero-text-wrapper { flex: 1; }
          .hero-parallax-image {
            top: 0 !important;
            height: 100% !important;
            transform: none !important;
          }
          .hero-overlay {
            background: linear-gradient(180deg, transparent 75%, #043b3b 102%) !important;
          }
          .swiper-pagination { bottom: 10px !important; }
        }
      `}</style>

      {(!heroData || heroData.length === 0) ? (
        <section ref={sectionRef} style={sectionBase}>
          <div className="hero-text-wrapper">
            <HeroContent />
          </div>
        </section>
      ) : (
        <section ref={sectionRef} style={sectionBase}>

          {/* 🖼️ IMAGE AREA */}
          <div className="hero-swiper-container">
            <Swiper
              modules={[Autoplay, EffectFade, Pagination]}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              loop
              speed={1200}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="hero-swiper-full"
            >
              {heroData.map((img) => (
                <SwiperSlide key={img._id}>
                  <img
                    src={img.image}
                    alt="Aadhunika Hospital"
                    loading="eager"
                    draggable={false}
                    className="hero-parallax-image"
                    style={{ transform: `translateY(${scrollY * 0.25}px)` }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="hero-overlay" />
          </div>

          {/* 📝 TEXT AREA */}
          <div className="hero-text-wrapper">
            <HeroContent />
          </div>

        </section>
      )}
    </>
  );
}