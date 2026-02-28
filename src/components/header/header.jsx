"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="header">
      
      {/* ===== LOGO SECTION ===== */}
     <div className="logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
          <img src="/Aadhunika.png" alt="Aadhunika Logo" />
          <span>Aadhunika Hospital</span>
    </div>

      {/* ===== MOBILE MENU BUTTON ===== */}
      <div className="mobile-menu-btn" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className={isOpen ? "active" : ""}>
        <Link href="/" className={pathname === "/" ? "active" : ""} onClick={closeMenu}>
          Home
        </Link>

        <Link href="/about" className={pathname === "/about" ? "active" : ""} onClick={closeMenu}>
          About Us
        </Link>

        <Link href="/services" className={pathname === "/services" ? "active" : ""} onClick={closeMenu}>
          Services
        </Link>

        <Link href="/booking" className={pathname === "/booking" ? "active" : ""} onClick={closeMenu}>
          Booking
        </Link>

        <Link href="/contact" className={pathname === "/contact" ? "active" : ""} onClick={closeMenu}>
          Contact
        </Link>
      </nav>

    </header>
  );
}
