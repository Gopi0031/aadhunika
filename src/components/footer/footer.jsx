import Link from 'next/link';
// Import the icons
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Hospital Info */}
        <div className="footer-section">
          <h3>Aadhunika Multispeciality Hospital</h3>
          <p>
            Excellence in Healthcare. Your trusted partner for advanced
            medical consulting and compassionate care.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/booking">Booking</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Address */}
        <div className="footer-section">
          <h4>Contact</h4>
          <p>📍 Guntur, Andhra Pradesh, India-522002</p>
          <p>📞 +91 9XXXXXXXXX</p>
          <p>✉️ support@aadhunikahospital.com</p>
        </div>

        {/* Social Media - Now with Icons */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
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
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Aadhunika Multispeciality Hospital. All rights reserved.</p>
        <p className="powered-by" style={{color:"darkblue"}}>
          Powered by <a href="https://ramakalpasolutions.in" target="_blank" rel="noopener noreferrer">Ramakalpa Solutions</a>
        </p>
      </div>
    </footer>
  );
}