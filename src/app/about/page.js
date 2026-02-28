// app/about/page.js



async function getAboutImages() {
  try {
   const res = await fetch(`/api/about-images`, {
  cache: 'no-store',
});
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch about images:', error);
    return [];
  }
}

export default async function AboutPage() {
  const aboutImages = await getAboutImages();

  const whoWeAreImage = aboutImages.find((img) => img.section === 'who-we-are');
  const whyChooseImage = aboutImages.find((img) => img.section === 'why-choose-us');

  return (
    <section className="about-page">
      {/* Page Title */}
      <h1 className="about-title">About Aadhunika Group Of India</h1>

      {/* Who We Are - Text Left, Image Right */}
      <div className="about-split">
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            Aadhunika Group India is a forward-thinking healthcare organization
            dedicated to delivering high-quality, patient-centric medical services.
            We integrate advanced medical technology with compassionate care to
            ensure safe, ethical, and effective treatment for every patient.
          </p>
          <p>
            With a strong focus on clinical excellence and community well-being,
            we strive to create a healthcare environment built on trust,
            transparency, and continuous improvement.
          </p>
        </div>

        <div className="about-image">
          <img
            src={
              whoWeAreImage?.image ||
              '/about/specialist-discussing-medication-treatment.jpg'
            }
            alt={whoWeAreImage?.title || 'Specialist Discussing Treatment'}
          />
        </div>
      </div>

      {/* Mission, Vision, Values Cards */}
      <div className="about-cards">
        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            To enhance the well-being of our community and lead the way in modern
            healthcare by providing ethical, accessible, and advanced medical
            services with compassion and care.
          </p>
        </div>

        <div className="about-card">
          <h2>Our Vision</h2>
          <p>
            To become a trusted healthcare partner recognized for clinical
            excellence, innovation, and commitment to improving lives.
          </p>
        </div>

        <div className="about-card">
          <h2>Our Values</h2>
          <ul>
            <li>Compassion and empathy</li>
            <li>Integrity and ethical practices</li>
            <li>Commitment to clinical excellence</li>
            <li>Innovation and continuous improvement</li>
            <li>Respect for every individual</li>
          </ul>
        </div>
      </div>

      {/* Why Choose Us - Image Left, Text Right */}
      <div className="about-split reverse">
        <div className="about-image">
          <img
            src={
              whyChooseImage?.image ||
              '/about/young-female-doctor-white-coat-with-stethoscope-around-her-neck-looking-front-smiling-spreading-arms-sides-sitting-table-with-laptop-light-wall.jpg'
            }
            alt={whyChooseImage?.title || 'Why Choose Aadhunika'}
          />
        </div>

        <div className="about-text">
          <h2>Why Choose Aadhunika</h2>
          <ul>
            <li>
              Experienced and qualified doctors supported by skilled medical staff
            </li>
            <li>Comprehensive multispeciality services under one roof</li>
            <li>Patient-first approach with personalized treatment plans</li>
            <li>
              Modern infrastructure with high standards of safety and hygiene
            </li>
            <li>
              Commitment to ethical practices and quality healthcare outcomes
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}