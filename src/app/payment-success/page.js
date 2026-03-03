'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const steps = [
    { icon: '📧', text: 'Confirmation email sent to your inbox' },
    { icon: '📅', text: 'Appointment slot reserved for you' },
    { icon: '📹', text: 'Zoom link will be shared before consultation' },
    { icon: '🩺', text: 'Doctor will join at scheduled time' },
  ];

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes ps-bounceIn {
          0%   { opacity: 0; transform: scale(0.3); }
          50%  { opacity: 1; transform: scale(1.05); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes ps-fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ps-pulse {
          0%, 100% { box-shadow: 0 0 0 16px rgba(255,255,255,0.1); }
          50%       { box-shadow: 0 0 0 24px rgba(255,255,255,0.05); }
        }
        @keyframes ps-spin {
          100% { transform: rotate(360deg); }
        }

        .ps-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #D1FAE5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(80px, 10vw, 120px) 16px 40px;
          font-family: 'Segoe UI', sans-serif;
        }
        .ps-card {
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          overflow: hidden;
          animation: ps-bounceIn 0.7s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ps-card-top-bar {
          height: 5px;
          background: linear-gradient(90deg, #10B981, #059669, #0F766E);
        }
        .ps-card-header {
          background: linear-gradient(135deg, #059669, #10B981, #34D399);
          padding: clamp(30px, 5vw, 50px) clamp(20px, 4vw, 40px);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ps-deco-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          pointer-events: none;
        }
        .ps-checkmark {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 44px;
          box-shadow: 0 0 0 16px rgba(255,255,255,0.1);
          animation: ps-pulse 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }
        .ps-card-header h1 {
          color: #fff;
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 800;
          margin: 0 0 8px;
          position: relative;
          z-index: 1;
        }
        .ps-card-header p {
          color: rgba(255,255,255,0.85);
          font-size: 16px;
          margin: 0;
          position: relative;
          z-index: 1;
        }
        .ps-card-body { padding: clamp(20px, 4vw, 36px); }

        /* Transaction box */
        .ps-tx-box {
          background: linear-gradient(135deg, #F0FDF4, #ECFDF5);
          border-radius: 16px;
          padding: clamp(16px, 3vw, 24px);
          border: 1px solid #BBF7D0;
          margin-bottom: 20px;
        }
        .ps-tx-title {
          font-size: 13px;
          font-weight: 800;
          color: #166534;
          margin: 0 0 16px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ps-tx-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ps-tx-label { font-size: 13px; color: #6B7280; font-weight: 600; }
        .ps-tx-badge {
          background: #D1FAE5;
          color: #065F46;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
        }
        .ps-tx-value {
          font-size: 12px;
          font-weight: 700;
          word-break: break-all;
          text-align: right;
          max-width: 60%;
        }

        /* Next steps box */
        .ps-next-box {
          background: linear-gradient(135deg, #EFF6FF, #EEF2FF);
          border-radius: 16px;
          padding: clamp(16px, 3vw, 24px);
          border: 1px solid #BFDBFE;
          margin-bottom: 24px;
        }
        .ps-next-title {
          font-size: 14px;
          font-weight: 800;
          color: #1E40AF;
          margin: 0 0 16px;
        }
        .ps-next-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.7);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.9);
          margin-bottom: 10px;
        }
        .ps-next-step:last-child { margin-bottom: 0; }

        /* CTA buttons */
        .ps-cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ps-btn-primary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #059669, #0F766E);
          color: #fff;
          border-radius: 14px;
          font-weight: 700;
          text-decoration: none;
          font-size: 14px;
          min-width: 140px;
          box-shadow: 0 6px 20px rgba(5,150,105,0.35);
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .ps-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(5,150,105,0.45);
        }
        .ps-btn-secondary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: #F8FAFC;
          color: #374151;
          border-radius: 14px;
          font-weight: 700;
          text-decoration: none;
          font-size: 14px;
          min-width: 140px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .ps-btn-secondary:hover {
          background: #F1F5F9;
          transform: translateY(-2px);
        }

        /* Help bar */
        .ps-help-bar {
          text-align: center;
          margin-top: 24px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 16px 20px;
          border: 1px solid rgba(255,255,255,0.8);
          font-size: 14px;
          color: #374151;
        }
        .ps-help-bar a {
          color: #0F766E;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>

      <div className="ps-wrapper">
        <div style={{ maxWidth: 540, width: '100%' }}>

          <div className="ps-card">
            <div className="ps-card-top-bar" />

            {/* Header */}
            <div className="ps-card-header">
              {[
                { w: 200, h: 200, top: -80, right: -60 },
                { w: 150, h: 150, bottom: -50, left: -40 },
              ].map((c, i) => (
                <div key={i} className="ps-deco-circle" style={{ width: c.w, height: c.h, top: c.top, bottom: c.bottom, right: c.right, left: c.left }} />
              ))}
              <div className="ps-checkmark">✅</div>
              <h1>Payment Successful!</h1>
              <p>Your appointment has been confirmed 🎉</p>
            </div>

            {/* Body */}
            <div className="ps-card-body">

              {/* Transaction Details */}
              <div className="ps-tx-box">
                <h3 className="ps-tx-title">💳 Transaction Details</h3>
                {[
                  paymentId && { label: 'Payment ID', value: paymentId, mono: true, color: '#059669' },
                  orderId   && { label: 'Order ID',   value: orderId,   mono: true, color: '#374151' },
                  { label: 'Status', value: '✅ PAID', badge: true },
                  { label: 'Date', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), color: '#374151' },
                ].filter(Boolean).map((row, i, arr) => (
                  <div key={i} className="ps-tx-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid #D1FAE5' : 'none' }}>
                    <span className="ps-tx-label">{row.label}</span>
                    {row.badge
                      ? <span className="ps-tx-badge">{row.value}</span>
                      : <span className="ps-tx-value" style={{ fontFamily: row.mono ? 'monospace' : 'inherit', color: row.color }}>{row.value}</span>
                    }
                  </div>
                ))}
              </div>

              {/* Next Steps */}
              <div className="ps-next-box">
                <h3 className="ps-next-title">📋 What Happens Next?</h3>
                {steps.map((step, i) => (
                  <div key={i} className="ps-next-step" style={{ animation: `ps-fadeInUp 0.5s ease ${i * 0.1 + 0.3}s both` }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{step.icon}</span>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{step.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="ps-cta-row">
                <Link href="/booking" className="ps-btn-primary">📅 Book Another</Link>
                <Link href="/" className="ps-btn-secondary">🏠 Go Home</Link>
              </div>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 18, lineHeight: 1.5 }}>
                🔒 Payment processed securely by Razorpay | 256-bit SSL Encryption
              </p>
            </div>
          </div>

          {/* Help Bar */}
          <div className="ps-help-bar">
            Need help?{' '}
            <a href="tel:+916305650469">📞 Call us: +91 6305650469</a>
            {' '}or{' '}
            <Link href="/contact" style={{ color: '#0F766E', fontWeight: 700, textDecoration: 'none' }}>Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)' }}>
        <style>{`@keyframes ps-spin { 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, border: '4px solid #D1FAE5', borderTopColor: '#059669', borderRadius: '50%', animation: 'ps-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#059669', fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
