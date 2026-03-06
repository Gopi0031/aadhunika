'use client';
import { useRef, useState, useEffect } from 'react';

export default function SpecialistsCarousel({ specialists = [] }) {
  const [hovered, setHovered]       = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [visible, setVisible]       = useState(false);
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX]         = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canLeft, setCanLeft]       = useState(false);
  const [canRight, setCanRight]     = useState(true);

  /* ── filters from speciality field ── */
  const filters = ['All', ...Array.from(new Set(specialists.map(s => s.speciality).filter(Boolean)))];
  const filtered = activeFilter === 'All'
    ? specialists
    : specialists.filter(s => s.speciality === activeFilter);

  /* ── scroll into view reveal ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  /* ── track scroll state ── */
  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener('scroll', updateArrows);
  }, [filtered]);

  /* ── drag to scroll ── */
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - (trackRef.current?.offsetLeft || 0));
    setScrollLeft(trackRef.current?.scrollLeft || 0);
  };
  const onMouseMove = (e) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current.offsetLeft || 0);
    trackRef.current.scrollLeft = scrollLeft - (x - startX);
  };
  const onMouseUp = () => setIsDragging(false);

  /* ── arrow scroll ── */
  const scrollBy = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 470, behavior: 'smooth' });
  };

  /* ── split "Dr. First Last" → { first: "Dr. First", last: "Last" } ── */
  const splitName = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return { first: '', last: parts[0] };
    const last  = parts[parts.length - 1];
    const first = parts.slice(0, -1).join(' ');
    return { first, last };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=Segoe+UI:wght@400;500;600;700&display=swap');

        /* ── SECTION ── */
        .sc-section {
          padding: clamp(60px,8vw,10px) 0 clamp(48px,6vw,80px);
          background: #FFFFF0;
          font-family: 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* subtle warm grid texture */
        .sc-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15,118,110,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,118,110,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .sc-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px,5vw,64px);
          position: relative;
        }

        /* ── HEADER — matches rest of page ── */
        .sc-header {
          text-align: center;
          margin-bottom: clamp(36px,4vw,52px);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .sc-header.vis { opacity: 1; transform: translateY(0); }

        .sc-badge {
          display: inline-block;
          background: linear-gradient(135deg, rgba(15,118,110,0.10), rgba(5,150,105,0.10));
          color: #0F766E;
          padding: 5px 18px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          border: 1px solid rgba(15,118,110,0.2);
          margin-bottom: 12px;
        }

        .sc-title {
          font-size: clamp(26px,4vw,40px);
          font-weight: 800;
          color: #0F766E;
          margin: 0 0 12px;
          font-family: 'Segoe UI', sans-serif;
        }

        .sc-rule {
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #0F766E, #15f5ba);
          border-radius: 2px;
          margin: 0 auto;
        }

        /* ── FILTER TABS ── */
        .sc-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 28px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
        }
        .sc-filters.vis { opacity: 1; transform: translateY(0); }

        .sc-fb {
          padding: 7px 20px;
          border-radius: 50px;
          border: 1px solid rgba(15,118,110,0.2);
          background: transparent;
          color: #6B7280;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.4px;
          cursor: pointer;
          font-family: 'Segoe UI', sans-serif;
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .sc-fb:hover {
          border-color: #0F766E;
          color: #0F766E;
          background: rgba(15,118,110,0.05);
        }
        .sc-fb.active {
          background: linear-gradient(135deg, #0F766E, #059669);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 14px rgba(15,118,110,0.3);
        }

        /* ── TRACK WRAPPER ── */
        .sc-outer {
          position: relative;
          margin-top: clamp(28px,3.5vw,44px);
        }

        /* edge fade */
        .sc-track-fade {
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }

        .sc-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scrollbar-width: none;
          cursor: grab;
          padding: 10px 4px 28px;
          -webkit-overflow-scrolling: touch;
        }
        .sc-track::-webkit-scrollbar { display: none; }
        .sc-track.grabbing { cursor: grabbing; }

        /* ── CARD ── */
        .sc-card {
          flex: 0 0 200px;
          width: 200px;
          background: #fff;
          border: 1px solid rgba(15,118,110,0.1);
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity 0.65s ease,
            transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94),
            box-shadow 0.4s ease,
            border-color 0.4s ease;
        }
        .sc-card.vis {
          opacity: 1;
          transform: translateY(0);
        }
        .sc-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
          box-shadow: 0 20px 48px rgba(15,118,110,0.16) !important;
          border-color: rgba(15,118,110,0.35) !important;
        }

        /* stagger */
        .sc-card:nth-child(1) { transition-delay: 0.04s; }
        .sc-card:nth-child(2) { transition-delay: 0.10s; }
        .sc-card:nth-child(3) { transition-delay: 0.16s; }
        .sc-card:nth-child(4) { transition-delay: 0.22s; }
        .sc-card:nth-child(5) { transition-delay: 0.28s; }
        .sc-card:nth-child(6) { transition-delay: 0.34s; }
        .sc-card:nth-child(7) { transition-delay: 0.40s; }
        .sc-card:nth-child(8) { transition-delay: 0.46s; }

        /* ── PHOTO ── */
        .sc-img-wrap {
          width: 100%;
          aspect-ratio: 1/1;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
        }
        .sc-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
          filter: grayscale(20%);
          transition:
            filter 0.5s ease,
            transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .sc-card:hover .sc-img {
          filter: grayscale(0%);
          transform: scale(1.07);
        }

        /* teal gradient sweep on hover */
        .sc-img-wrap::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(15,118,110,0.55) 100%
          );
          opacity: 0;
          transition: opacity 0.45s ease;
        }
        .sc-card:hover .sc-img-wrap::after { opacity: 1; }

        /* placeholder */
        .sc-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #f0fdf4, #d1fae5);
          font-size: 52px;
        }

        /* index badge top-right over image */
        .sc-num {
          position: absolute;
          top: 10px; right: 10px;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: #0F766E;
          z-index: 3;
          letter-spacing: 0.3px;
          transition: background 0.3s ease, color 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .sc-card:hover .sc-num {
          background: #0F766E;
          color: #fff;
        }

        /* ── CARD BODY ── */
        .sc-body {
          padding: 14px 15px 16px;
        }

        .sc-name-first {
          font-size: 11px;
          font-weight: 600;
          color: #9CA3AF;
          margin: 0;
          letter-spacing: 0.3px;
          line-height: 1.3;
        }
        .sc-name-last {
          font-size: 17px;
          font-weight: 800;
          color: #0F766E;
          margin: 2px 0 10px;
          line-height: 1.1;
          letter-spacing: -0.3px;
          transition: color 0.3s ease;
        }
        .sc-card:hover .sc-name-last { color: #065f46; }

        .sc-sep {
          width: 100%;
          height: 1px;
          background: rgba(15,118,110,0.1);
          margin-bottom: 9px;
          transition: background 0.4s ease;
        }
        .sc-card:hover .sc-sep {
          background: linear-gradient(90deg, #0F766E, #15f5ba);
        }

        .sc-spec {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          color: #6B7280;
          letter-spacing: 0.7px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        .sc-card:hover .sc-spec { color: #0F766E; }

        .sc-spec-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0F766E, #15f5ba);
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .sc-card:hover .sc-spec-dot { transform: scale(1.4); }

        /* ── ARROW BUTTONS ── */
        .sc-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-60%);
          width: 42px; height: 42px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid rgba(15,118,110,0.25);
          color: #0F766E;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transition: all 0.25s ease;
          z-index: 10;
          font-family: serif;
        }
        .sc-arrow:hover:not(:disabled) {
          background: linear-gradient(135deg, #0F766E, #059669);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(15,118,110,0.35);
          transform: translateY(-60%) scale(1.08);
        }
        .sc-arrow:disabled {
          opacity: 0.25;
          cursor: default;
        }
        .sc-arrow.left  { left: -18px; }
        .sc-arrow.right { right: -18px; }

        /* ── FOOTER BAR ── */
        .sc-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: clamp(20px,2.5vw,32px);
          padding-top: 16px;
          border-top: 1px solid rgba(15,118,110,0.1);
          opacity: 0;
          transition: opacity 0.9s ease 0.5s;
        }
        .sc-foot.vis { opacity: 1; }

        .sc-foot-label {
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .sc-foot-count {
          font-size: 12px;
          font-weight: 800;
          color: #0F766E;
          letter-spacing: 0.5px;
        }
        .sc-foot-dots {
          display: flex;
          gap: 6px;
        }
        .sc-foot-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(15,118,110,0.15);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }
        .sc-foot-dot.on {
          background: #0F766E;
          width: 18px;
          border-radius: 3px;
        }

        .sc-empty {
          text-align: center;
          color: #9CA3AF;
          padding: 60px 20px;
          font-size: 15px;
        }

        @media (max-width: 480px) {
          .sc-card { flex: 0 0 165px; width: 165px; }
          .sc-name-last { font-size: 15px; }
          .sc-arrow { display: none; }
        }
      `}</style>

      <section className="sc-section" ref={sectionRef}>
        <div className="sc-inner">

          {/* ── HEADER (matches page style exactly) ── */}
          <div className={`sc-header${visible ? ' vis' : ''}`}>
            <span className="sc-badge">Meet Our Experts</span>
            <h2 className="sc-title">Our Specialists</h2>
            <div className="sc-rule" />
          </div>

          {/* ── FILTER TABS — only if 3+ unique specialities ── */}
          {filters.length > 2 && (
            <div className={`sc-filters${visible ? ' vis' : ''}`}>
              {filters.map(f => (
                <button
                  key={f}
                  className={`sc-fb${activeFilter === f ? ' active' : ''}`}
                  onClick={() => { setActiveFilter(f); updateArrows(); }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* ── CARDS ── */}
          {filtered.length === 0 ? (
            <p className="sc-empty">No specialists available at the moment.</p>
          ) : (
            <div className="sc-outer">
              {/* Prev */}
              <button
                className="sc-arrow left"
                aria-label="Previous"
                disabled={!canLeft}
                onClick={() => scrollBy(-1)}
              >‹</button>

              <div className="sc-track-fade">
                <div
                  ref={trackRef}
                  className={`sc-track${isDragging ? ' grabbing' : ''}`}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                >
                  {filtered.map((s, i) => {
                    const { first, last } = splitName(s.name);
                    return (
                      <div
                        key={s._id || i}
                        className={`sc-card${visible ? ' vis' : ''}`}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        {/* Index badge */}
                        <span className="sc-num">{String(i + 1).padStart(2, '0')}</span>

                        {/* Photo */}
                        <div className="sc-img-wrap">
                          {s.image ? (
                            <img className="sc-img" src={s.image} alt={s.name} draggable={false} />
                          ) : (
                            <div className="sc-placeholder">🩺</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="sc-body">
                          <p className="sc-name-first">{first}</p>
                          <p className="sc-name-last">{last || first}</p>
                          <div className="sc-sep" />
                          {s.speciality && (
                            <div className="sc-spec">
                              <span className="sc-spec-dot" />
                              {s.speciality}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next */}
              <button
                className="sc-arrow right"
                aria-label="Next"
                disabled={!canRight}
                onClick={() => scrollBy(1)}
              >›</button>
            </div>
          )}

          {/* ── FOOTER BAR ── */}
          <div className={`sc-foot${visible ? ' vis' : ''}`}>
            <span className="sc-foot-label">Specialist team</span>
            <span className="sc-foot-count">
              {filtered.length}&nbsp;/&nbsp;{specialists.length} specialists
            </span>
          </div>

        </div>
      </section>
    </>
  );
}