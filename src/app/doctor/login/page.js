// src/app/admin/login/page.js  AND  src/app/doctor/login/page.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Redirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, []);
  return null;
}
