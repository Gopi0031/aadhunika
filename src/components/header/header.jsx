// components/header/header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (isOpen && !e.target.closest('.header')) closeMenu();
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

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <div
        className="logo"
        onClick={() => (window.location.href = '/')}
        style={{ cursor: 'pointer' }}
      >
        <img src="/Aadhunika.png" alt="Aadhunika Hospital Logo" />
        <span>Aadhunika Hospital</span>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navigation */}
      <nav className={isOpen ? 'active' : ''} role="navigation">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : ''}
            onClick={closeMenu}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}