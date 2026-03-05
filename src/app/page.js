// app/page.js
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import ScrollAnimations from '@/components/ScrollAnimations';
import HoverLink from '@/components/ui/HoverLink';
import { connectDB } from '@/lib/mongodb';
import HeroImage from '@/models/HeroImage';
import Specialist from '@/models/Specialist';

export const dynamic = 'force-dynamic';

async function getHeroData() {
  try {
    await connectDB();
    const docs = await HeroImage.find({ active: true }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to fetch hero data:', err);
    return [];
  }
}

async function getSpecialists() {
  try {
    await connectDB();
    const docs = await Specialist.find({}).lean();
    return JSON.parse(JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to fetch specialists:', err);
    return [];
  }
}

export default async function HomePage() {
  const [heroData, specialists] = await Promise.all([
    getHeroData(),
    getSpecialists(),
  ]);

  const facilities = [
    { icon: '🫀', text: 'Intensive Care Unit (ICU) & Neonatal Intensive Care Unit (NICU) with Ventilator Support' },
    { icon: '🚨', text: 'Emergency & Trauma Care Services' },
    { icon: '🔬', text: 'Clinical Laboratory & Diagnostic Services' },
    { icon: '💊', text: '24/7 In-House Pharmacy Services' },
    { icon: '🩻', text: 'Radiology Services (X-Ray & Ultrasonography)' },
    { icon: '🏥', text: 'Modular Operation Theatres' },
    { icon: '🫀', text: '2D Echocardiography (Cardiac Imaging)' },
    { icon: '📋', text: 'Insurance & TPA Assistance Desk' },
  ];

  const whyItems = [
    'Experienced and qualified specialist doctors',
    'Advanced medical technology & equipment',
    'Patient-first personalized treatment approach',
    '24/7 emergency & critical care support',
    'Trusted multispeciality care under one roof',
    'Transparent & ethical medical practices',
  ];

  return (
    <>
      <style>{`
        @keyframes hpPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.3);opacity:0.7;} }

        .spec-card-wrap:hover .spec-overlay { opacity: 1 !important; }
        .spec-card-wrap:hover img { transform: scale(1.06) !important; }
        .spec-card-wrap {
          transition: all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .spec-card-wrap:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(15,118,110,0.15) !important;
        }

        .fac-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 16px 40px rgba(15,118,110,0.15) !important;
          border-color: rgba(15,118,110,0.25) !important;
        }
        .fac-card:hover .fac-icon { transform: scale(1.2) rotate(8deg); }

        .why-item:hover {
          background: rgba(15,118,110,0.08) !important;
          border-color: rgba(15,118,110,0.25) !important;
          transform: translateX(8px) !important;
        }

        .hp-cta-primary:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 16px 40px rgba(107,0,0,0.5) !important;
        }
        .hp-cta-outline:hover {
          background: rgba(255,255,255,0.28) !important;
          transform: translateY(-2px) !important;
        }

        @media (max-width: 768px) {
          .about-why-grid { grid-template-columns: 1fr !important; }
          .spec-grid      { grid-template-columns: repeat(2,1fr) !important; }
          .fac-grid       { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .spec-grid { grid-template-columns: 1fr !important; }
          .fac-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ScrollAnimations />
      <HeroSection heroData={heroData} />

      {/* ===== SPECIALISTS ===== */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)',
        background: '#FFFFF0',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,rgba(15,118,110,0.1),rgba(5,150,105,0.1))',
            color: '#0F766E', padding: '5px 18px', borderRadius: 50,
            fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
            textTransform: 'uppercase', border: '1px solid rgba(15,118,110,0.2)',
            marginBottom: 12,
          }}>
            Meet Our Experts
          </span>
          <h2 style={{
            fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800,
            color: '#0F766E', margin: '0 0 12px',
          }}>
            Our Specialists
          </h2>
          <div style={{
            width: 60, height: 4,
            background: 'linear-gradient(90deg,#0F766E,#15f5ba)',
            borderRadius: 2, margin: '0 auto',
          }} />
        </div>

        <div
          className="spec-grid specialists"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 24, maxWidth: 1200, margin: '0 auto',
          }}
        >
          {specialists.length === 0 ? (
            <p style={{
              textAlign: 'center', color: '#6B7280',
              gridColumn: '1/-1', fontSize: 16, padding: '40px 0',
            }}>
              No specialists available at the moment.
            </p>
          ) : (
            specialists.map((s, i) => (
              <div
                key={s._id}
                className={`spec-card-wrap reveal delay-${Math.min(i + 1, 6)}`}
                style={{
                  background: '#fff', borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', height: 220 }}>
                  <img
                    src={s.image || '/placeholder-doctor.jpg'}
                    alt={s.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
                    }}
                  />
                  <div
                    className="spec-overlay"
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                      paddingBottom: 16, opacity: 0,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    
                  </div>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F766E', margin: '0 0 6px' }}>
                    {s.name}
                  </h3>
                  {s.speciality && (
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0, fontWeight: 500 }}>
                      {s.speciality}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ===== FACILITIES ===== */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)',
        background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,rgba(15,118,110,0.1),rgba(5,150,105,0.1))',
            color: '#0F766E', padding: '5px 18px', borderRadius: 50,
            fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
            textTransform: 'uppercase', border: '1px solid rgba(15,118,110,0.2)',
            marginBottom: 12,
          }}>
            What We Provide
          </span>
          <h2 style={{
            fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800,
            color: '#0F766E', margin: '0 0 12px',
          }}>
            Our Facilities
          </h2>
          <div style={{
            width: 60, height: 4,
            background: 'linear-gradient(90deg,#0F766E,#15f5ba)',
            borderRadius: 2, margin: '0 auto',
          }} />
        </div>

        <div
          className="fac-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20, maxWidth: 1200, margin: '0 auto',
          }}
        >
          {facilities.map((item, i) => (
            <div
              key={i}
              className={`fac-card reveal delay-${Math.min(i + 1, 6)}`}
              style={{
                background: '#fff', borderRadius: 18, padding: '24px 20px',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                textAlign: 'center', cursor: 'default',
                fontSize: 15, fontWeight: 600, color: '#1E293B',
                lineHeight: 1.5,
                transition: 'all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            >
              <div className="fac-icon" style={{
                fontSize: '2rem', marginBottom: 12,
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                display: 'inline-block',
              }}>
                {item.icon}
              </div>
              <div>{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT + WHY CHOOSE ===== */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)',
        background: '#FFFFF0',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <div
          className="about-why-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(30px,5vw,60px)',
            maxWidth: 1100, margin: '0 auto', alignItems: 'start',
          }}
        >
          {/* About Left */}
          <div className="reveal-left">
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,rgba(15,118,110,0.1),rgba(5,150,105,0.1))',
              color: '#0F766E', padding: '5px 16px', borderRadius: 50,
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', border: '1px solid rgba(15,118,110,0.2)',
              marginBottom: 14,
            }}>
              Who We Are
            </span>
            <h2 style={{
              fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800,
              color: '#0F766E', margin: '0 0 10px',
            }}>
              About Aadhunika Group India
            </h2>
            <div style={{
              width: 50, height: 4,
              background: 'linear-gradient(90deg,#0F766E,#15f5ba)',
              borderRadius: 2, marginBottom: 20,
            }} />
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#374151', marginBottom: 14 }}>
              Aadhunika Group India is a forward-thinking healthcare organization
              committed to delivering high-quality, patient-centric medical services.
              We integrate advanced medical technology with compassionate care to
              ensure safe, ethical, and effective treatment for every patient.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#374151', marginBottom: 24 }}>
              With a strong focus on clinical excellence and community well-being,
              we strive to build a healthcare environment based on trust,
              transparency, and continuous improvement.
            </p>

            {/* ✅ HoverLink replaces <Link onMouseEnter/onMouseLeave> */}
            <HoverLink
              href="/about"
              baseStyle={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #0F766E, #059669)',
                color: '#fff', padding: '13px 28px', borderRadius: 50,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(15,118,110,0.35)',
                transition: 'all 0.3s ease',
              }}
              hoverStyle={{
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(15,118,110,0.45)',
              }}
            >
              Read More →
            </HoverLink>
          </div>

          {/* Why Choose Right */}
          <div className="reveal-right">
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,rgba(15,118,110,0.1),rgba(5,150,105,0.1))',
              color: '#0F766E', padding: '5px 16px', borderRadius: 50,
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', border: '1px solid rgba(15,118,110,0.2)',
              marginBottom: 14,
            }}>
              Why Choose Us
            </span>
            <h2 style={{
              fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800,
              color: '#0F766E', margin: '0 0 10px',
            }}>
              Why Choose Aadhunika
            </h2>
            <div style={{
              width: 50, height: 4,
              background: 'linear-gradient(90deg,#0F766E,#15f5ba)',
              borderRadius: 2, marginBottom: 24,
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {whyItems.map((text, i) => (
                <div
                  key={i}
                  className="why-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    background: 'rgba(15,118,110,0.04)',
                    border: '1px solid rgba(15,118,110,0.1)',
                    fontSize: 15, color: '#374151', fontWeight: 500,
                    transition: 'all 0.3s ease', cursor: 'default',
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#059669,#0F766E)',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>✓</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== APPOINTMENT CTA ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #043b3b 0%, #0F766E 50%, #059669 100%)',
        padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,40px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        {[
          { w: 400, h: 400, top: -150, right: -100, op: 0.05 },
          { w: 250, h: 250, bottom: -80, left: -60, op: 0.04 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h,
            borderRadius: '50%', background: `rgba(255,255,255,${c.op})`,
            top: c.top, bottom: c.bottom, right: c.right, left: c.left,
            pointerEvents: 'none',
          }} />
        ))}

        <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '6px 18px', borderRadius: 50,
            fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            <span style={{
              width: 8, height: 8, background: '#15f5ba',
              borderRadius: '50%', animation: 'hpPulse 2s infinite',
            }} />
            24/7 Available
          </span>

          <h2 style={{
            fontSize: 'clamp(26px,4.5vw,48px)', fontWeight: 800,
            color: '#fff', margin: '0 0 14px', lineHeight: 1.15,
          }}>
            Need Expert Medical Care?
          </h2>

          <p style={{
            fontSize: 'clamp(15px,2vw,18px)',
            color: 'rgba(255,255,255,0.82)',
            maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7,
          }}>
            Book your appointment with our experienced specialists today.
            We&apos;re here for you — 24 hours a day, 7 days a week.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* ✅ Use plain CSS class hover — no onMouseEnter needed */}
            <Link
              href="/booking"
              className="hp-cta-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #6B0000, #9b0000)',
                color: '#fff', padding: '15px 36px', borderRadius: 50,
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(107,0,0,0.4)',
                transition: 'all 0.3s ease',
              }}
            >
              📅 Book Appointment
            </Link>
            <a
              href="tel:+919492121131"
              className="hp-cta-outline"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.5)',
                color: '#fff', padding: '15px 36px', borderRadius: 50,
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              📞 Call Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
