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

      <p style={{
        fontSize: 'clamp(16px, 2.5vw, 22px)',
        color: 'rgba(255,255,255,0.92)',
        margin: '0 0 10px', fontWeight: 500,
      }}>
        Your Trusted Partner in Health &amp; Wellness
      </p>

      <p style={{
        fontSize: 'clamp(13px, 1.8vw, 16px)',
        color: 'rgba(255,255,255,0.72)',
        margin: '0 0 32px', lineHeight: 1.6,
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

  // Set as a flex container so we can divide space perfectly on mobile
  const sectionBase = {
    position: 'relative',
    width: '100%',
    height: `calc(100vh - ${headerHeight}px)`,
    minHeight: 600, // Safe minimum height so buttons never get cut off
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
        /* --- DESKTOP LAYOUT --- */
        .hero-swiper-container {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 1;
        }

        .hero-text-wrapper {
          position: relative;
          z-index: 10;
          flex: 1; /* Takes full height on desktop */
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
          position: absolute; inset: 0; zIndex: 5;
          background: linear-gradient(135deg, rgba(4,59,59,0.7) 0%, rgba(15,118,110,0.5) 100%);
          pointer-events: none;
        }

        .swiper-pagination-bullet { background: rgba(255,255,255,0.5) !important; width: 10px !important; height: 10px !important; }
        .swiper-pagination-bullet-active { background: #15f5ba !important; width: 28px !important; border-radius: 5px !important; }


        /* --- 📱 MOBILE LAYOUT (SPLIT SCREEN FIX) --- */
        @media (max-width: 768px) {
          
          /* 1. Image gets locked to the top, exactly in a 16:9 ratio size */
          .hero-swiper-container {
            position: relative; /* Stacks naturally above the text */
            height: 56.25vw !important; /* Perfect 16:9 ratio based on phone width */
            flex-shrink: 0;
          }

          /* 2. Text takes up all the remaining space below the image */
          .hero-text-wrapper {
            flex: 1; /* Automatically stretches to fill the bottom area */
          }

          /* 3. Disable parallax so image fits 100% perfectly without empty gaps */
          .hero-parallax-image {
            top: 0 !important;
            height: 100% !important;
            transform: none !important; 
          }
          
          /* 4. Smooth blend at the bottom edge of the image into the dark teal */
          .hero-overlay {
            background: linear-gradient(180deg, transparent 75%, #043b3b 102%) !important;
          }

          /* Keep pagination dots inside the image area */
          .swiper-pagination {
            bottom: 10px !important;
          }
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