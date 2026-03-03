// components/ScrollAnimations.jsx
'use client';

import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    // ── Scroll Progress Bar ──
    const progressBar = document.createElement('div');
    Object.assign(progressBar.style, {
      position: 'fixed', top: 0, left: 0, height: '3px', width: '0%',
      background: 'linear-gradient(90deg, #0F766E, #15f5ba)',
      zIndex: '9999', transition: 'width 0.1s linear',
      borderRadius: '0 2px 2px 0',
      boxShadow: '0 0 8px rgba(15,118,110,0.5)',
    });
    document.body.appendChild(progressBar);

    // ── Back to Top Button ──
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Back to top');
    Object.assign(backToTop.style, {
      position: 'fixed', bottom: '30px', right: '24px',
      width: '48px', height: '48px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #0F766E, #059669)',
      color: '#fff', border: 'none', fontSize: '20px',
      fontWeight: '700', cursor: 'pointer', zIndex: '999',
      boxShadow: '0 6px 20px rgba(15,118,110,0.4)',
      opacity: '0', transform: 'translateY(20px)',
      transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
    });
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
    backToTop.addEventListener('mouseenter', () => {
      backToTop.style.transform = 'translateY(-4px)';
      backToTop.style.boxShadow = '0 12px 30px rgba(15,118,110,0.55)';
    });
    backToTop.addEventListener('mouseleave', () => {
      backToTop.style.transform = 'translateY(0)';
      backToTop.style.boxShadow = '0 6px 20px rgba(15,118,110,0.4)';
    });

    // ── Scroll handler ──
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = `${(scrolled / total) * 100}%`;

      if (scrolled > 400) {
        backToTop.style.opacity = '1';
        backToTop.style.transform = 'translateY(0)';
        backToTop.style.pointerEvents = 'auto';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.transform = 'translateY(20px)';
        backToTop.style.pointerEvents = 'none';
      }
    };

    // ── Reveal Observer ──
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translate(0,0) scale(1)';
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    // Apply initial hidden states per class
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.7s cubic-bezier(0.25,0.46,0.45,0.94)';
      revealObserver.observe(el);
    });
    document.querySelectorAll('.reveal-left').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-40px)';
      el.style.transition = 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
      revealObserver.observe(el);
    });
    document.querySelectorAll('.reveal-right').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      el.style.transition = 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
      revealObserver.observe(el);
    });
    document.querySelectorAll('.reveal-scale').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.85)';
      el.style.transition = 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)';
      revealObserver.observe(el);
    });

    // Apply stagger delays
    document.querySelectorAll('[class*="delay-"]').forEach((el) => {
      const match = el.className.match(/delay-(\d+)/);
      if (match) {
        el.style.transitionDelay = `${parseInt(match[1]) * 0.1}s`;
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
      if (document.body.contains(progressBar)) document.body.removeChild(progressBar);
      if (document.body.contains(backToTop))   document.body.removeChild(backToTop);
    };
  }, []);

  return null;
}
