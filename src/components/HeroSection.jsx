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
    <div className="hero-stat" ref={ref}>
      <span className="hero-stat-number">
        {count}{suffix}
      </span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

export default function HeroSection({ heroData }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollDown = () => {
    const nextSection = document.querySelector('.specialists');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!heroData || heroData.length === 0) {
    return (
      <section
        ref={sectionRef}
        className="hero-section"
        style={{
          background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 50%, #059669 100%)',
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Excellence in Healthcare
          </div>
          <h1 className="hero-title">
            Aadhunika{' '}
            <span>Multispeciality</span>{' '}
            Hospital
          </h1>
          <p className="hero-subtitle">Your Trusted Partner in Health & Wellness</p>
          <p className="hero-tagline">
            Advanced medical care with compassion — 24/7 emergency services available
          </p>
          <div className="hero-buttons">
            <a href="/services" className="hero-btn hero-btn-outline">
              ✦ Explore Services
            </a>
            <Link href="/booking" className="hero-btn hero-btn-primary">
              📅 Book Appointment
            </Link>
          </div>
        </div>

       

        <div className="scroll-indicator" onClick={scrollDown}>
          <div className="scroll-arrow" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={`hero-section ${isVisible ? 'animate-fadeIn' : ''}`}>
      <div className="hero-swiper-wrapper">
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
          className="hero-swiper"
          style={{ width: '100%', height: '100%' }}
        >
          {heroData.map((img) => (
            <SwiperSlide key={img._id} className="hero-slide">
              <div className="hero-slide-bg">
                <img
                  src={img.image}
                  alt="Aadhunika Hospital"
                  className="hero-bg-image"
                  loading="eager"
                  draggable={false}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Excellence in Healthcare
        </div>
        <h1 className="hero-title">
          Aadhunika <span>Multispeciality</span> Hospital
        </h1>
        <p className="hero-subtitle">Your Trusted Partner in Health & Wellness</p>
        <p className="hero-tagline">
          Advanced medical care with compassion — 24/7 emergency services available
        </p>
        <div className="hero-buttons">
          <a href="/services" className="hero-btn hero-btn-outline">
            ✦ Explore Services
          </a>
          <Link href="/booking" className="hero-btn hero-btn-primary">
            📅 Book Appointment
          </Link>
        </div>
      </div>

      

  
    </section>
  );
}