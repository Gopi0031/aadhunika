// src/components/header/header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (isOpen && !e.target.closest('.header-container')) closeMenu();
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [isOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/booking', label: 'Booking' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  const styles = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: scrolled ? '5px 50px' : '8px 50px',
      width: '100%',
      background: scrolled 
        ? 'linear-gradient(135deg, rgba(0, 247, 255, 0.95) 0%, rgba(21, 245, 186, 0.95) 100%)'
        : 'linear-gradient(135deg, #00f7ff 0%, #15f5ba 100%)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      backdropFilter: 'blur(10px)',
      boxShadow: scrolled ? '0 8px 32px rgba(0, 0, 0, 0.12)' : 'none',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
    },
    logoImg: {
      height: '65px',
      width: 'auto',
      transition: 'transform 0.3s ease',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #043b3b, #0F766E)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    nav: {
      display: 'flex',
      fontSize: '16px',
      alignItems: 'center',
      gap: '4px',
    },
    navLink: (isActive, isHovered) => ({
      position: 'relative',
      padding: '8px 16px',
      textDecoration: 'none',
      color: isActive ? '#064e4e' : '#043b3b',
      fontWeight: isActive ? 700 : 600,
      transition: 'all 0.3s ease',
      borderRadius: '8px',
      overflow: 'hidden',
      background: isHovered ? 'rgba(4, 59, 59, 0.08)' : 'transparent',
    }),
    mobileMenuBtn: {
      display: 'none',
      fontSize: '22px',
      cursor: 'pointer',
      color: '#043b3b',
      zIndex: 1001,
      padding: '8px',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s ease',
      border: 'none',
    },
  };

  return (
    <>
      <style>{`
        @media screen and (max-width: 768px) {
          .header-container {
            padding: 12px 20px !important;
          }
          .header-logo-img {
            height: 50px !important;
          }
          .header-logo-text {
            font-size: 18px !important;
          }
          .header-mobile-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .header-nav {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: linear-gradient(135deg, rgba(0, 247, 255, 0.97), rgba(21, 245, 186, 0.97));
            backdrop-filter: blur(20px);
            border-bottom: 2px solid rgba(4, 59, 59, 0.2);
            flex-direction: column;
            align-items: center;
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        padding 0.4s ease,
                        opacity 0.3s ease;
            opacity: 0;
            pointer-events: none;
            z-index: 999;
            gap: 0;
          }
          .header-nav.active {
            max-height: 400px;
            opacity: 1;
            pointer-events: auto;
            padding: 16px 0 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
          .header-nav-link {
            width: 85%;
            text-align: center;
            padding: 12px 20px !important;
            margin: 4px 0;
            border-radius: 10px;
            font-size: 15px;
          }
        }
        @media screen and (max-width: 480px) {
          .header-logo-img {
            height: 42px !important;
          }
          .header-logo-text {
            font-size: 16px !important;
          }
        }
        @media screen and (max-width: 360px) {
          .header-logo-text {
            display: none !important;
          }
        }
      `}</style>
      
      <header className="header-container" style={styles.header}>
        <div
          className="logo"
          onClick={() => (window.location.href = '/')}
          style={styles.logo}
        >
          <img 
            className="header-logo-img"
            src="/Aadhunika.png" 
            alt="Aadhunika Hospital Logo" 
            style={styles.logoImg}
          />
          <span className="header-logo-text" style={styles.logoText}>
            Aadhunika Hospital
          </span>
        </div>

        <button
          className="header-mobile-btn"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          style={styles.mobileMenuBtn}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav 
          className={`header-nav ${isOpen ? 'active' : ''}`} 
          style={styles.nav}
          role="navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="header-nav-link"
              style={styles.navLink(
                pathname === link.href, 
                hoveredLink === link.href
              )}
              onClick={closeMenu}
              onMouseEnter={() => setHoveredLink(link.href)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}