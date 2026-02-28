import Link from 'next/link';

export default function ServicesPage() {
  const departments = [
    {
      name: 'Pulmonology',
      desc: 'Comprehensive care for respiratory and lung-related conditions.',
    },
    {
      name: 'Gynaecology & Obstetrics',
      desc: 'Advanced care for women’s health, pregnancy, and childbirth.',
    },
    {
      name: 'Orthopedics',
      desc: 'Diagnosis and treatment for bones, joints, and spine disorders.',
    },
    {
      name: 'ENT',
      desc: 'Specialized care for ear, nose, throat, and related conditions.',
    },
  ];

  const hospitalServices = [
    'ICU & NICU',
    'Accident & Emergency',
    'Blood Bank',
    'Laboratory Services',
    'Pharmacy',
    'X-Ray',
    'Ambulance',
    'Operation Theater',
    'Government Schemes & Insurance',
  ];

  return (
    <section className="services-page">

      {/* PAGE HEADER */}
      <div className="services-header">
        <h1>Our Medical Services</h1>
        <p>
          At Aadhunika Multispeciality Hospital, we provide comprehensive
          healthcare services supported by advanced technology, skilled
          professionals, and compassionate care.
        </p>
      </div>

      {/* DEPARTMENTS */}
      <h2 className="section-title">Clinical Departments</h2>
      <div className="services-grid">
        {departments.map((dept, index) => (
          <div key={index} className="service-card">
            <h3>{dept.name}</h3>
            <p>{dept.desc}</p>
            <Link href="/booking" className="service-link">
              Book Appointment →
            </Link>
          </div>
        ))}
      </div>

      {/* HOSPITAL SERVICES */}
      <h2 className="section-title">Hospital Facilities & Services</h2>
      <div className="facility-grid">
        {hospitalServices.map((service, index) => (
          <div key={index} className="facility-card">
            {service}
          </div>
        ))}
      </div>

      {/* PATIENT GUIDE */}
      <div className="services-guide">
        <h2>Patient Care Process</h2>
        <ul>
          <li>✔ Walk-in and appointment-based consultations</li>
          <li>✔ Accurate diagnosis using modern equipment</li>
          <li>✔ Expert treatment by qualified specialists</li>
          <li>✔ Continuous monitoring and follow-up care</li>
          <li>✔ Support for insurance and government health schemes</li>
        </ul>
      </div>

    </section>
  );
}
