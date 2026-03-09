'use client';
import { useRef, useState, useEffect } from 'react';

export default function SpecialistsCarousel({ specialists = [] }) {
  const [hovered, setHovered]           = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [visible, setVisible]           = useState(false);
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX]         = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canLeft, setCanLeft]       = useState(false);
  const [canRight, setCanRight]     = useState(true);

  const filters = ['All', ...Array.from(new Set(specialists.map(s => s.specialization).filter(Boolean)))];
  const filtered = activeFilter === 'All'
    ? specialists
    : specialists.filter(s => s.specialization === activeFilter);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

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

  const scrollBy = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 500, behavior: 'smooth' });
  };

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

        .sc-section {
          padding: clamp(48px,7vw,80px) 0;
          background: #FFFFF0;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .sc-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(15,118,110,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .sc-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(16px,5vw,64px);
          position: relative;
        }
        .sc-header {
          text-align: center;
          margin-bottom: clamp(28px,4vw,48px);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .sc-header.vis { opacity: 1; transform: translateY(0); }
        .sc-badge {
          display: inline-block;
          background: transparent;
          color: #0F766E;
          padding: 4px 16px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          border: 1px solid rgba(15,118,110,0.3);
          margin-bottom: 14px;
          font-family: 'Inter', sans-serif;
        }
        .sc-title {
          font-size: clamp(22px,3.5vw,38px);
          font-weight: 700;
          color: #134e4a;
          margin: 0 0 14px;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.5px;
        }
        .sc-rule {
          width: 48px;
          height: 3px;
          background: #0F766E;
          border-radius: 2px;
          margin: 0 auto;
        }
        .sc-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 24px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s;
        }
        .sc-filters.vis { opacity: 1; transform: translateY(0); }
        .sc-fb {
          padding: 6px 16px;
          border-radius: 4px;
          border: 1px solid rgba(15,118,110,0.25);
          background: transparent;
          color: #6B7280;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .sc-fb:hover { border-color: #0F766E; color: #0F766E; background: rgba(15,118,110,0.04); }
        .sc-fb.active { background: #0F766E; border-color: #0F766E; color: #fff; }
        .sc-outer {
          position: relative;
          margin-top: clamp(24px,3.5vw,44px);
        }
        .sc-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scrollbar-width: none;
          cursor: grab;
          padding: 10px 4px 28px;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
        }
        .sc-track::-webkit-scrollbar { display: none; }
        .sc-track.grabbing { cursor: grabbing; }
        .sc-card {
          flex: 0 0 230px;
          width: 230px;
          background: #fff;
          border: 1px solid #d1d5db;
          outline: 3px solid transparent;
          outline-offset: -1px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          opacity: 0;
          transform: translateY(28px);
          scroll-snap-align: start;
          transition:
            opacity 0.6s ease,
            transform 0.6s cubic-bezier(0.22,0.61,0.36,1),
            box-shadow 0.35s ease,
            border-color 0.35s ease,
            outline-color 0.35s ease;
        }
        .sc-card.vis { opacity: 1; transform: translateY(0); }
        .sc-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 12px 36px rgba(15,118,110,0.14), 0 2px 8px rgba(0,0,0,0.06) !important;
          border-color: #0F766E !important;
          outline-color: rgba(15,118,110,0.15) !important;
          outline-width: 6px !important;
        }
        .sc-card:nth-child(1) { transition-delay: 0.05s; }
        .sc-card:nth-child(2) { transition-delay: 0.12s; }
        .sc-card:nth-child(3) { transition-delay: 0.19s; }
        .sc-card:nth-child(4) { transition-delay: 0.26s; }
        .sc-card:nth-child(5) { transition-delay: 0.33s; }
        .sc-card:nth-child(6) { transition-delay: 0.40s; }
        .sc-card:nth-child(7) { transition-delay: 0.47s; }
        .sc-card:nth-child(8) { transition-delay: 0.54s; }
        .sc-img-wrap {
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
          position: relative;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
        }
        .sc-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          pointer-events: none;
          transition: transform 0.55s cubic-bezier(0.22,0.61,0.36,1);
        }
        .sc-card:hover .sc-img { transform: scale(1.05); }
        .sc-img-wrap::after {
          content: '';
          position: absolute; inset: 0;
          background: rgba(19,78,74,0.18);
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .sc-card:hover .sc-img-wrap::after { opacity: 1; }
        .sc-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: #f3f4f6;
          font-size: 52px;
        }
        .sc-body { padding: 14px 14px 16px; }
        .sc-body::before {
          content: '';
          display: block;
          width: 0;
          height: 2px;
          background: #0F766E;
          margin-bottom: 10px;
          transition: width 0.4s ease;
          border-radius: 1px;
        }
        .sc-card:hover .sc-body::before { width: 40px; }
        .sc-name-first {
          font-size: 11px;
          font-weight: 700;
          color: #134e4a;
          margin: 0;
          letter-spacing: 0.2px;
          line-height: 1.4;
        }
        .sc-name-last {
          font-size: 17px;
          font-weight: 700;
          color: #134e4a;
          margin: 2px 0 10px;
          line-height: 1.3;
          font-family: 'Playfair Display', serif;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        .sc-card:hover .sc-name-last { color: #0F766E; }
        .sc-qual {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          color: #0F766E;
          background: rgba(15,118,110,0.08);
          border: 1px solid rgba(15,118,110,0.18);
          border-radius: 3px;
          padding: 2px 6px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
          /* keeps tag baseline-aligned inside the flex name row */
          align-self: center;
          line-height: 1.4;
        }
        .sc-card:hover .sc-qual { background: #0F766E; color: #fff; }
        .sc-sep {
          width: 100%;
          height: 1px;
          background: #e5e7eb;
          margin-bottom: 10px;
          transition: background 0.35s ease;
        }
        .sc-card:hover .sc-sep { background: #0F766E; }
        .sc-spec {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #6B7280;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        .sc-card:hover .sc-spec { color: #0F766E; }
        .sc-spec-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #0F766E;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .sc-card:hover .sc-spec-dot { transform: scale(1.5); }
        .sc-desc {
          font-size: 11px;
          color: #9CA3AF;
          margin: 8px 0 0;
          line-height: 1.6;
          transition: color 0.3s ease;
        }
        .sc-card:hover .sc-desc { color: #6B7280; }
        .sc-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-60%);
          width: 38px; height: 38px;
          border-radius: 4px;
          background: #fff;
          border: 1px solid #d1d5db;
          color: #374151;
          font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
          z-index: 10;
          font-family: serif;
        }
        .sc-arrow:hover:not(:disabled) {
          background: #0F766E;
          color: #fff;
          border-color: #0F766E;
          box-shadow: 0 4px 14px rgba(15,118,110,0.3);
          transform: translateY(-60%) scale(1.06);
        }
        .sc-arrow:disabled { opacity: 0.3; cursor: default; }
        .sc-arrow.left  { left: -20px; }
        .sc-arrow.right { right: -20px; }
        .sc-empty {
          text-align: center;
          color: #9CA3AF;
          padding: 60px 20px;
          font-size: 15px;
        }
        .sc-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: clamp(16px,2.5vw,28px);
          padding-top: 14px;
          border-top: 1px solid #e5e7eb;
          opacity: 0;
          transition: opacity 0.9s ease 0.5s;
        }
        .sc-foot.vis { opacity: 1; }
        .sc-foot-label {
          font-size: 10px;
          color: #9CA3AF;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .sc-foot-count {
          font-size: 11px;
          font-weight: 700;
          color: #0F766E;
          letter-spacing: 0.5px;
        }

        /* ── TABLET 769px–1024px ── */
        @media (max-width: 1024px) and (min-width: 769px) {
          .sc-card { flex: 0 0 210px; width: 210px; }
          .sc-arrow.left  { left: -14px; }
          .sc-arrow.right { right: -14px; }
          .sc-track { gap: 14px; }
        }

        /* ── LARGE MOBILE 481px–768px ── */
        @media (max-width: 768px) and (min-width: 481px) {
          .sc-card { flex: 0 0 calc(50vw - 28px); width: calc(50vw - 28px); }
          .sc-name-last { font-size: 16px; }
          .sc-arrow { width: 34px; height: 34px; font-size: 16px; }
          .sc-arrow.left  { left: -14px; }
          .sc-arrow.right { right: -14px; }
          .sc-track { gap: 12px; padding: 10px 2px 24px; }
          .sc-fb { font-size: 11px; padding: 5px 13px; }
        }

        /* ── SMALL MOBILE ≤480px ── */
        @media (max-width: 480px) {
          .sc-section { padding: 36px 0 48px; }
          .sc-inner { padding: 0 16px; }
          .sc-badge { font-size: 10px; letter-spacing: 2px; }
          .sc-card { flex: 0 0 calc(100vw - 48px); width: calc(100vw - 48px); }
          .sc-name-last { font-size: 18px; }
          .sc-name-first { font-size: 12px; }
          .sc-desc { font-size: 12px; }
          .sc-spec { font-size: 11px; }
          .sc-arrow { display: none; }
          .sc-track { gap: 12px; padding: 10px 0 24px; }
          .sc-filters {
            flex-wrap: nowrap;
            overflow-x: auto;
            justify-content: flex-start;
            scrollbar-width: none;
            padding-bottom: 4px;
          }
          .sc-filters::-webkit-scrollbar { display: none; }
          .sc-fb { flex-shrink: 0; }
          .sc-foot { flex-direction: column; gap: 6px; text-align: center; }
        }
      `}</style>

      <section className="sc-section" ref={sectionRef}>
        <div className="sc-inner">

          <div className={`sc-header${visible ? ' vis' : ''}`}>
            <span className="sc-badge">Meet Our Experts</span>
            <h2 className="sc-title">Our Specialists</h2>
            <div className="sc-rule" />
          </div>

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

          {filtered.length === 0 ? (
            <p className="sc-empty">No specialists available at the moment.</p>
          ) : (
            <div className="sc-outer">
              <button
                className="sc-arrow left"
                aria-label="Previous"
                disabled={!canLeft}
                onClick={() => scrollBy(-1)}
              >‹</button>

              <div>
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
                        <div className="sc-img-wrap">
                          {s.image ? (
                            <img className="sc-img" src={s.image} alt={s.name} draggable={false} />
                          ) : (
                            <div className="sc-placeholder">🩺</div>
                          )}
                        </div>

                        <div className="sc-body">
                          <p className="sc-name-first">{first}</p>
                          <p className="sc-name-last">
                            {last || first}
                            {s.qualification && (
                              <span className="sc-qual">{s.qualification}</span>
                            )}
                          </p>
                          <div className="sc-sep" />
                          {s.specialization && (
                            <div className="sc-spec">
                              <span className="sc-spec-dot" />
                              {s.specialization}
                            </div>
                          )}
                          {s.description && (
                            <p className="sc-desc">{s.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="sc-arrow right"
                aria-label="Next"
                disabled={!canRight}
                onClick={() => scrollBy(1)}
              >›</button>
            </div>
          )}

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
