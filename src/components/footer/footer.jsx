// components/Footer.jsx
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const navLinks = [
  { href: '/',         label: 'Home'     },
  { href: '/services', label: 'Services' },
  { href: '/booking',  label: 'Booking'  },
  { href: '/about',    label: 'About Us' },
  { href: '/contact',  label: 'Contact'  },
];

const socialLinks = [
  { icon: <FaFacebookF />,  href: '#', label: 'Facebook'  },
  { icon: <FaInstagram />,  href: '#', label: 'Instagram' },
  { icon: <FaTwitter />,    href: '#', label: 'Twitter'   },
  { icon: <FaLinkedinIn />, href: '#', label: 'LinkedIn'  },
];

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-nav-link:hover       { color: #043b3b !important; transform: translateX(4px); }
        .footer-social-btn:hover     { background: rgba(4,59,59,0.2) !important; transform: translateY(-3px); }
        .footer-cta:hover            { background: linear-gradient(135deg,#9b0000,#C00) !important; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(107,0,0,0.5) !important; }
        .footer-contact-link:hover   { color: #043b3b !important; }
      `}</style>

      <footer style={{
        /* ✅ matches header gradient exactly */
        background: 'linear-gradient(135deg, #00f7ff 0%, #15f5ba 100%)',
        color: '#043b3b',
        fontFamily: "'Segoe UI', sans-serif",
      }}>

        {/* ── Main Grid ── */}
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: 'clamp(50px,7vw,80px) clamp(16px,4vw,40px) clamp(40px,5vw,60px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'clamp(30px,4vw,48px)',
        }}>

          {/* ── Col 1: Hospital Info ── */}
          <div>
            <img
              src="/Aadhunika.png" alt="Aadhunika Hospital"
              style={{ height: 64, width: 'auto', marginBottom: 14,
                filter: 'brightness(0.9) drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#043b3b',
              margin: '0 0 10px', lineHeight: 1.35 }}>
              Aadhunika Multispeciality Hospital
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(4,59,59,0.72)',
              lineHeight: 1.7, margin: '0 0 20px' }}>
              Excellence in Healthcare. Your trusted partner for advanced
              medical consulting and compassionate care.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  target="_blank" rel="noopener noreferrer"
                  className="footer-social-btn"
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'rgba(4,59,59,0.12)',
                    border: '1px solid rgba(4,59,59,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#043b3b', fontSize: 15,
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    textDecoration: 'none',
                  }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <h4 style={{
              fontSize: 13, fontWeight: 800, color: '#043b3b',
              margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '1.5px',
              paddingBottom: 10, borderBottom: '1px solid rgba(4,59,59,0.15)',
            }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-nav-link" style={{
                    fontSize: 15, color: 'rgba(4,59,59,0.8)',
                    textDecoration: 'none', fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.25s ease',
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'rgba(4,59,59,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#043b3b', flexShrink: 0,
                    }}>→</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Contact ── */}
          <div>
            <h4 style={{
              fontSize: 13, fontWeight: 800, color: '#043b3b',
              margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '1.5px',
              paddingBottom: 10, borderBottom: '1px solid rgba(4,59,59,0.15)',
            }}>
              Contact
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
                fontSize: 14, color: 'rgba(4,59,59,0.72)', lineHeight: 1.6 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📍</span>
                <span>
                  AADHUNIKA MULTISPECIALITY HOSPITAL, beside Sivalayam Street,
                  Ganeshrao Peta, Kothapeta, Guntur, Andhra Pradesh, India
                </span>
              </li>
              <li>
                <a href="tel:+919492121131" className="footer-contact-link" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 14, color: 'rgba(4,59,59,0.85)',
                  textDecoration: 'none', fontWeight: 600, transition: 'color 0.25s ease',
                }}>
                  <span style={{ fontSize: 16 }}>📞</span> +91 9492121131
                </a>
              </li>
              <li>
                <a href="mailto:support@aadhunikahospital.com"
                  className="footer-contact-link" style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 14, color: 'rgba(4,59,59,0.85)',
                    textDecoration: 'none', fontWeight: 600, transition: 'color 0.25s ease',
                    wordBreak: 'break-all',
                  }}>
                  <span style={{ fontSize: 16 }}>✉️</span>
                  support@aadhunikahospital.com
                </a>
              </li>
            </ul>
          </div>

          {/* ── Col 4: Follow Us ── */}
          <div>
            <h4 style={{
              fontSize: 13, fontWeight: 800, color: '#043b3b',
              margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '1.5px',
              paddingBottom: 10, borderBottom: '1px solid rgba(4,59,59,0.15)',
            }}>
              Follow Us
            </h4>
            <p style={{ fontSize: 14, color: 'rgba(4,59,59,0.72)',
              lineHeight: 1.7, margin: '0 0 20px' }}>
              Stay connected for health tips, news, and updates from our hospital.
            </p>

            {/* Emergency */}
            <div style={{
              background: 'rgba(4,59,59,0.08)', border: '1px solid rgba(4,59,59,0.15)',
              borderRadius: 14, padding: '14px 16px', marginBottom: 14,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(4,59,59,0.55)',
                textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
                🚨 24/7 Emergency
              </p>
              <a href="tel:+919492121131" style={{
                fontSize: 18, fontWeight: 800, color: '#043b3b',
                textDecoration: 'none', letterSpacing: '0.5px',
              }}>
                +91 9492121131
              </a>
            </div>

            {/* Book CTA */}
            <Link href="/booking" className="footer-cta" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6B0000, #9b0000)',
              color: '#fff', padding: '12px 22px', borderRadius: 50,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(107,0,0,0.3)',
              transition: 'all 0.3s ease', width: '100%',
            }}>
              📅 Book Appointment
            </Link>
          </div>

        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(4,59,59,0.2), transparent)',
          margin: '0 clamp(16px,4vw,40px)',
        }} />

        {/* Bottom Bar */}
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: 'clamp(18px,2vw,24px) clamp(16px,4vw,40px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(4,59,59,0.6)', margin: 0, fontWeight: 500 }}>
            © {new Date().getFullYear()} Aadhunika Multispeciality Hospital. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: '#6B0000', margin: 0, fontWeight: 700 }}>
            Powered by Ramakalpa Solutions
          </p>
        </div>
      </footer>
    </>
  );
}
