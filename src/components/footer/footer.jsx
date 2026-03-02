// components/footer/footer.jsx
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Hospital Info */}
        <div className="footer-section">
          <h3>Aadhunika Hospital</h3>
          <p>
            Excellence in Healthcare. Your trusted partner for advanced medical
            consulting, compassionate care, and cutting-edge treatment across
            multiple specialities.
          </p>
          <div className="social-links" style={{ marginTop: '20px' }}>
            <a href="#" className="social-icon" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="#" className="social-icon" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/booking">Book Appointment</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-section">
          <h4>Our Specialities</h4>
          <ul>
            <li><Link href="/services">Pulmonology</Link></li>
            <li><Link href="/services">Gynaecology & Obstetrics</Link></li>
            <li><Link href="/services">Orthopedics</Link></li>
            <li><Link href="/services">ENT</Link></li>
            <li><Link href="/services">General Surgery</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>📍 Guntur, Andhra Pradesh, India - 522002</p>
          <p style={{ marginTop: '10px' }}>📞 <a href="tel:+919XXXXXXXXX" style={{ color: 'rgba(224, 242, 241, 0.8)' }}>+91 9XXXXXXXXX</a></p>
          <p style={{ marginTop: '10px' }}>✉️ <a href="mailto:support@aadhunikahospital.com" style={{ color: 'rgba(224, 242, 241, 0.8)' }}>support@aadhunikahospital.com</a></p>
          <p style={{ marginTop: '10px' }}>🕐 Emergency: 24/7 Available</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Aadhunika Multispeciality Hospital. All rights reserved.</p>
        <p className="powered-by">
          Powered by{' '}
          <a
            href="https://ramakalpasolutions.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ramakalpa Solutions
          </a>
        </p>
      </div>
    </footer>
  );
}