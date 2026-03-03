// components/ui/HoverLink.jsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HoverLink({
  href,
  baseStyle = {},
  hoverStyle = {},
  children,
  className = '',
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      className={className}
      style={{ ...baseStyle, ...(hovered ? hoverStyle : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}
