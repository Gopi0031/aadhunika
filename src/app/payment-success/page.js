// src/app/payment-success/page.js
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setShowConfetti(true), 300);
  }, []);

  const steps = [
    { icon: '📧', text: 'Confirmation email sent to your inbox' },
    { icon: '📅', text: 'Appointment slot reserved for you' },
    { icon: '📹', text: 'Zoom link will be shared before consultation' },
    { icon: '🩺', text: 'Doctor will join at scheduled time' },
  ];

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #D1FAE5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(80px, 10vw, 120px) 16px 40px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 540, width: '100%' }}>

        {/* Success Card */}
        <div style={{
          background: '#fff', borderRadius: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          animation: 'bounceIn 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Top Gradient */}
          <div style={{ height: 5, background: 'linear-gradient(90deg, #10B981, #059669, #0F766E)' }} />

          {/* Success Header */}
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10B981, #34D399)',
            padding: 'clamp(30px, 5vw, 50px) clamp(20px, 4vw, 40px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            {[
              { w: 200, h: 200, top: -80, right: -60 },
              { w: 150, h: 150, bottom: -50, left: -40 },
            ].map((c, i) => (
              <div key={i} style={{
                position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                top: c.top, bottom: c.bottom, right: c.right, left: c.left,
              }} />
            ))}

            {/* Animated checkmark */}
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 44,
              boxShadow: '0 0 0 16px rgba(255,255,255,0.1)',
              animation: 'pulse 2s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }}>
              ✅
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, margin: '0 0 8px', position: 'relative', zIndex: 1 }}>
              Payment Successful!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: 0, position: 'relative', zIndex: 1 }}>
              Your appointment has been confirmed 🎉
            </p>
          </div>

          <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>

            {/* Transaction Details */}
            <div style={{
              background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
              borderRadius: 16, padding: 'clamp(16px, 3vw, 24px)',
              border: '1px solid #BBF7D0', marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#166534', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                💳 Transaction Details
              </h3>

              {[
                paymentId && { label: 'Payment ID', value: paymentId, mono: true, color: '#059669' },
                orderId && { label: 'Order ID', value: orderId, mono: true, color: '#374151' },
                { label: 'Status', value: '✅ PAID', badge: true },
                { label: 'Date', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), color: '#374151' },
              ].filter(Boolean).map((row, i, arr) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #D1FAE5' : 'none',
                  flexWrap: 'wrap', gap: 8,
                }}>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{row.label}</span>
                  {row.badge ? (
                    <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                      {row.value}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontFamily: row.mono ? 'monospace' : 'inherit', fontWeight: 700, color: row.color || '#374151', wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div style={{
              background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)',
              borderRadius: 16, padding: 'clamp(16px, 3vw, 24px)',
              border: '1px solid #BFDBFE', marginBottom: 24,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1E40AF', margin: '0 0 16px' }}>
                📋 What Happens Next?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', background: 'rgba(255,255,255,0.7)',
                    borderRadius: 10, border: '1px solid rgba(255,255,255,0.9)',
                    animation: `fadeInUp 0.5s ease ${i * 0.1 + 0.3}s both`,
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{step.icon}</span>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/booking" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '14px 20px',
                background: 'linear-gradient(135deg, #059669, #0F766E)',
                color: '#fff', borderRadius: 14, fontWeight: 700,
                textDecoration: 'none', fontSize: 14, minWidth: 140,
                boxShadow: '0 6px 20px rgba(5,150,105,0.35)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(5,150,105,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.35)'; }}
              >
                📅 Book Another
              </Link>
              <Link href="/" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '14px 20px',
                background: '#F8FAFC', color: '#374151',
                borderRadius: 14, fontWeight: 700,
                textDecoration: 'none', fontSize: 14, minWidth: 140,
                border: '1px solid #E2E8F0', transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.transform = 'none'; }}
              >
                🏠 Go Home
              </Link>
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 18, lineHeight: 1.5 }}>
              🔒 Payment processed securely by Razorpay | 256-bit SSL Encryption
            </p>
          </div>
        </div>

        {/* Extra Help */}
        <div style={{
          textAlign: 'center', marginTop: 24,
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
          borderRadius: 16, padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.8)',
        }}>
          <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>
            Need help?{' '}
            <a href="tel:+916305650469" style={{ color: '#0F766E', fontWeight: 700, textDecoration: 'none' }}>
              📞 Call us: +91 6305650469
            </a>
            {' '}or{' '}
            <Link href="/contact" style={{ color: '#0F766E', fontWeight: 700, textDecoration: 'none' }}>
              Contact Us
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 16px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 0 24px rgba(255,255,255,0.05); }
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, border: '4px solid #D1FAE5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#059669', fontWeight: 600 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}