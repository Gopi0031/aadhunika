// app/page.js
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';



async function getHeroData() {
  try {
    const res = await fetch(`/api/hero-images`, {
  cache: 'no-store',
});
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch hero data:', error);
    return null;
  }
}

async function getSpecialists() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/specialists`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch specialists:', error);
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
      {/* ================= 1. HERO SECTION ================= */}
      <HeroSection heroData={heroData} />

      {/* ================= 2. OUR SPECIALISTS ================= */}
      <section className="specialists">
        <h2 className="section-title">Our Specialists</h2>

        <div className="specialist-grid">
          {specialists.length === 0 && (
            <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>
              No specialists available at the moment.
            </p>
          )}

          {specialists.map((s) => (
            <div key={s._id || s.id} className="specialist-card">
              <img
                src={s.image || '/placeholder-doctor.jpg'}
                alt={s.name}
                className="specialist-image"
              />
              <h3>{s.name}</h3>
              {s.department && (
                <p className="specialist-dept">{s.department}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. OUR FACILITIES ================= */}
      <section className="facilities">
        <h2 className="section-title">Our Facilities</h2>

        <div className="facility-grid">
          <div className="facility-card">Modern Operation Theatres</div>
          <div className="facility-card">Advanced ICU Care</div>
          <div className="facility-card">Diagnostic & Imaging Labs</div>
          <div className="facility-card">Emergency Services</div>
        </div>
      </section>

      {/* ================= 4. ABOUT AADHUNIKA ================= */}
      <section className="about-why">
        <div className="about-why-container">
          <div className="about-left">
            <h2>About Aadhunika Group India</h2>
            <p>
              Aadhunika Group India is a forward-thinking healthcare organization
              committed to delivering high-quality, patient-centric medical
              services with advanced technology and compassionate care.
            </p>
            <Link href="/about" className="btn-primary">
              Read More About Us
            </Link>
          </div>

          <div className="about-right">
            <h2>Why Choose Aadhunika</h2>
            <ul className="why-list">
              <li>Experienced and qualified doctors</li>
              <li>Advanced medical technology</li>
              <li>Patient-first treatment approach</li>
              <li>24/7 emergency medical support</li>
              <li>Trusted multispeciality care</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= 5. APPOINTMENT CTA ================= */}
      <section className="appointment-cta">
        <h2>Need Expert Medical Care?</h2>
        <p>Book your appointment with our specialists today.</p>

        <div className="cta-buttons">
          <Link href="/booking" className="btn-primary">
            Book Appointment
          </Link>
          <a href="tel:+919XXXXXXXXX" className="btn-outline">
            Call Now
          </a>
        </div>
      </section>
    </>
  );
}