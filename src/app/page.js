// app/page.js
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import ScrollAnimations from '@/components/ScrollAnimations';
import { connectDB } from '@/lib/mongodb';
import HeroImage from '@/models/HeroImage';
import Specialist from '@/models/Specialist';

export const dynamic = 'force-dynamic';

async function getHeroData() {
  try {
    await connectDB();
    const docs = await HeroImage.find({ active: true })
      .sort({ createdAt: -1 })
      .lean();
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

  return (
    <>
      <ScrollAnimations />
      <HeroSection heroData={heroData} />

      {/* ===== SPECIALISTS ===== */}
      <section className="specialists">
        <div className="reveal">
          <h2 className="section-title">Our Specialists</h2>
        </div>

        <div className="specialist-grid">
          {specialists.length === 0 ? (
            <p style={{ textAlign: 'center', width: '100%', color: '#666', gridColumn: '1/-1' }}>
              No specialists available at the moment.
            </p>
          ) : (
            specialists.map((s, i) => (
              <div
                key={s._id}
                className={`specialist-card reveal delay-${Math.min(i + 1, 6)}`}
              >
                <div className="specialist-img-wrapper">
                  <img
                    src={s.image || '/placeholder-doctor.jpg'}
                    alt={s.name}
                  />
                  <div className="specialist-img-overlay">
                    <span className="specialist-overlay-text">View Profile</span>
                  </div>
                </div>
                <h3>{s.name}</h3>
                {s.speciality && <p className="specialist-dept">{s.speciality}</p>}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ===== FACILITIES ===== */}
      <section className="facilities">
        <div className="reveal">
          <h2 className="section-title">Our Facilities</h2>
        </div>

        <div className="facility-grid">
          {[
            { icon: '🏥', text: 'Modern Operation Theatres' },
            { icon: '🫀', text: 'Advanced ICU & NICU' },
            { icon: '🔬', text: 'Diagnostic & Imaging Labs' },
            { icon: '🚑', text: '24/7 Emergency Services' },
            { icon: '💊', text: '24/7 Pharmacy' },
            { icon: '🩻', text: 'X-Ray & Ultrasound' },
            { icon: '🫁', text: 'Ventilator Support' },
            { icon: '🏦', text: 'Insurance Assistance' },
          ].map((item, i) => (
            <div
              key={i}
              className={`facility-card reveal delay-${Math.min(i + 1, 6)}`}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{item.icon}</div>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT + WHY CHOOSE ===== */}
      <section className="about-why">
        <div className="about-why-container">
          <div className="about-left reveal-left">
            <span className="section-tag">Who We Are</span>
            <h2>About Aadhunika Group India</h2>
            <p>
              Aadhunika Group India is a forward-thinking healthcare organization
              committed to delivering high-quality, patient-centric medical services.
              We integrate advanced medical technology with compassionate care to
              ensure safe, ethical, and effective treatment for every patient.
            </p>
            <p>
              With a strong focus on clinical excellence and community well-being,
              we strive to build a healthcare environment based on trust,
              transparency, and continuous improvement.
            </p>
            <Link href="/about" className="btn-primary" style={{ marginLeft: 0, marginTop: '8px' }}>
              Read More →
            </Link>
          </div>

          <div className="about-right reveal-right">
            <span className="section-tag">Why Choose Us</span>
            <h2>Why Choose Aadhunika</h2>
            <ul className="why-list">
              <li>Experienced and qualified specialist doctors</li>
              <li>Advanced medical technology & equipment</li>
              <li>Patient-first personalized treatment approach</li>
              <li>24/7 emergency & critical care support</li>
              <li>Trusted multispeciality care under one roof</li>
              <li>Transparent & ethical medical practices</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== APPOINTMENT CTA ===== */}
      <section className="appointment-cta">
        <div className="reveal">
          <h2>Need Expert Medical Care?</h2>
          <p>
            Book your appointment with our experienced specialists today.
            We&apos;re here for you — 24 hours a day, 7 days a week.
          </p>
          <div className="cta-buttons">
            <Link href="/booking" className="btn-primary">
              📅 Book Appointment
            </Link>
            <a href="tel:+919XXXXXXXXX" className="btn-outline">
              📞 Call Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}