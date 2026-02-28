// app/page.js
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
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
      <HeroSection heroData={heroData} />

      <section className="specialists">
        <h2 className="section-title">Our Specialists</h2>
        <div className="specialist-grid">
          {specialists.length === 0 && (
            <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>
              No specialists available at the moment.
            </p>
          )}
          {specialists.map((s) => (
            <div key={s._id} className="specialist-card">
              <img
                src={s.image || '/placeholder-doctor.jpg'}
                alt={s.name}
                className="specialist-image"
              />
              <h3>{s.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="facilities">
        <h2 className="section-title">Our Facilities</h2>
        <div className="facility-grid">
          <div className="facility-card">Modern Operation Theatres</div>
          <div className="facility-card">Advanced ICU Care</div>
          <div className="facility-card">Diagnostic & Imaging Labs</div>
          <div className="facility-card">Emergency Services</div>
        </div>
      </section>

      <section className="about-why">
        <div className="about-why-container">
          <div className="about-left">
            <h2>About Aadhunika Group India</h2>
            <p>
              Aadhunika Group India is a forward-thinking healthcare
              organization committed to delivering high-quality,
              patient-centric medical services with advanced technology and
              compassionate care.
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