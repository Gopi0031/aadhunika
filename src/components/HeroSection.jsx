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
      position: 'relative', zIndex: 10,
      textAlign: 'center',
      padding: '0 clamp(16px, 4vw, 40px)',
      maxWidth: 820, margin: '0 auto',
    }}>
      <h1 style={{
        fontSize: 'clamp(30px, 6vw, 64px)',
        fontWeight: 800, color: '#fff',
        margin: '0 0 16px', lineHeight: 1.15,
        textShadow: '0 4px 25px rgba(0,0,0,0.5)',
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

      <p style={{
        fontSize: 'clamp(16px, 2.5vw, 22px)',
        color: 'rgba(255,255,255,0.95)',
        margin: '0 0 10px', fontWeight: 600,
        textShadow: '0 2px 10px rgba(0,0,0,0.4)',
      }}>
        Your Trusted Partner in Health &amp; Wellness
      </p>

      <p style={{
        fontSize: 'clamp(13px, 1.8vw, 16px)',
        color: 'rgba(255,255,255,0.85)',
        margin: '0 0 32px', lineHeight: 1.6,
        textShadow: '0 2px 10px rgba(0,0,0,0.4)',
      }}>
        Advanced medical care with compassion — 24/7 emergency services available
      </p>

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
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.5)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            textDecoration: 'none', transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'none'; }}
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
            textDecoration: 'none', boxShadow: '0 8px 25px rgba(107,0,0,0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 35px rgba(107,0,0,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(107,0,0,0.4)'; }}
        >
          📅 Book Appointment
        </Link>
      </div>
    </div>
  );
}

export default function HeroSection({ heroData }) {
  const sectionRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(80);
  const [scrollY, setScrollY] = useState(0);

  // Measure header height dynamically
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) setHeaderHeight(header.offsetHeight);
  }, []);

  // Highly performant Parallax scroll listener
  useEffect(() => {
    let animationFrameId;
    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          const scrolled = -rect.top;
          if (scrolled > -window.innerHeight && scrolled < rect.height) {
            setScrollY(scrolled);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const sectionBase = {
    position: 'relative',
    // Forces edge-to-edge full width
    width: '100vw',
    marginLeft: 'calc(-50vw + 50%)',
    height: `calc(100vh - ${headerHeight}px)`,
    minHeight: 550, // slightly taller minimum for mobile spacing
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', sans-serif",
  };

  return (
    <>
      <style>{`
        /* Swiper overrides to ensure full sizing */
        .hero-swiper-full {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          inset: 0 !important;
        }

        .hero-parallax-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #043b3b;
          overflow: hidden;
        }

        /* 
          120% height gives room for the parallax effect to move up/down
          object-fit: cover ensures the image FILLS the screen on mobile and desktop
        */
        .hero-main-img {
          position: absolute;
          inset: -10% 0; /* Extends top and bottom by 10% */
          width: 100% !important;
          height: 120% !important; 
          object-fit: cover !important;
          object-position: center center !important; 
          will-change: transform;
          z-index: 1;
        }

        /* Left Side Blur */
        .hero-blur-left {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 18%;
          background: linear-gradient(to right, rgba(4,59,59,0.85), transparent);
          backdrop-filter: blur(8px);
          z-index: 2;
          pointer-events: none;
        }

        /* Right Side Blur */
        .hero-blur-right {
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 18%;
          background: linear-gradient(to left, rgba(4,59,59,0.85), transparent);
          backdrop-filter: blur(8px);
          z-index: 2;
          pointer-events: none;
        }

        /* Dark overlay for text readability */
        .hero-dark-overlay {
          position: absolute;
          inset: 0;
          background: rgba(4,59,59,0.5);
          z-index: 3;
          pointer-events: none;
        }

        .swiper-pagination-bullet { background: rgba(255,255,255,0.5) !important; width: 10px !important; height: 10px !important; }
        .swiper-pagination-bullet-active { background: #15f5ba !important; width: 28px !important; border-radius: 5px !important; }

        /* Responsive adjustments for mobile */
        @media (max-width: 768px) {
          .hero-blur-left, .hero-blur-right {
            width: 12%; /* Smaller blurs on mobile so it doesn't cover too much image */
            backdrop-filter: blur(4px);
          }
        }
      `}</style>

      <section ref={sectionRef} style={sectionBase}>
        {(!heroData || heroData.length === 0) ? (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 100%)' }} />
        ) : (
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
                <div className="hero-parallax-container">
                  
                  {/* Single Main Image filling the screen */}
                  <img
                    src={img.image}
                    alt="Aadhunika Hospital"
                    className="hero-main-img"
                    draggable={false}
                    style={{ transform: `translateY(${scrollY * 0.25}px)` }}
                  />

                  {/* Side Blurs generated by CSS, not dual-images */}
                  <div className="hero-blur-left" />
                  <div className="hero-blur-right" />
                  <div className="hero-dark-overlay" />
                  
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Top Content */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeroContent />
        </div>
      </section>
    </>
  );
}