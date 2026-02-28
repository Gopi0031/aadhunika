// components/HeroSection.js
'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

export default function HeroSection({ heroData }) {
  if (!heroData || heroData.length === 0) return null;

  return (
    <section className="hero-section">
      <div className="hero-swiper-wrapper">
        <Swiper
          modules={[Autoplay, EffectFade]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop
          speed={500}
          className="hero-swiper"
          style={{ width: '100%', height: '100%' }}
        >
          {heroData.map((img) => (
            <SwiperSlide key={img._id} style={{ width: '100%', height: '100%' }}>
              <img
                src={img.image}
                alt="Hero"
                className="hero-bg-image"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">Aadhunika Multispeciality Hospital</h1>
        <p className="hero-subtitle">Excellence in Healthcare – Your Partner</p>
        <div className="hero-buttons">
          <a href="/services" className="hero-btn hero-btn-outline">
            View Services
          </a>
          <Link href="/booking" className="hero-btn hero-btn-primary">
            Book Appointment
          </Link>
        </div>
      </div>
    </section>
  );
}