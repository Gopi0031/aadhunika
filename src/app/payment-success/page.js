// src/app/payment-success/page.js
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #059669, #10B981)', padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '40px' }}>
            ✅
          </div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: '0 0 8px' }}>
            Payment Successful!
          </h1>
          <p style={{ color: '#A7F3D0', fontSize: '14px', margin: 0 }}>
            Your appointment has been booked
          </p>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Transaction Details */}
          <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '20px', border: '1px solid #BBF7D0', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#166534', margin: '0 0 15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              💳 Transaction Details
            </h3>

            {paymentId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #D1FAE5', fontSize: '14px' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Payment ID</span>
                <span style={{ color: '#059669', fontWeight: '700', fontFamily: 'monospace', fontSize: '12px' }}>{paymentId}</span>
              </div>
            )}

            {orderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #D1FAE5', fontSize: '14px' }}>
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Order ID</span>
                <span style={{ color: '#374151', fontFamily: 'monospace', fontSize: '12px' }}>{orderId}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px' }}>
              <span style={{ color: '#6B7280', fontWeight: '600' }}>Status</span>
              <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                ✅ PAID
              </span>
            </div>
          </div>

          {/* What Next */}
          <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '20px', border: '1px solid #BFDBFE', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1E40AF', margin: '0 0 12px' }}>
              📋 What Happens Next?
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#374151', lineHeight: '2' }}>
              <li>Our team will confirm your appointment</li>
              <li>Confirmation email will be sent shortly</li>
              <li>Google Meet link will be shared for online consultation</li>
              <li>Join at your scheduled time</li>
            </ul>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/booking" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '14px', background: '#059669', color: '#fff', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              📅 Book Another
            </Link>
            <Link href="/" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '14px', background: '#F3F4F6', color: '#374151', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              🏠 Go Home
            </Link>
          </div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', marginTop: '20px' }}>
            🔒 Payment processed securely by Razorpay
          </p>
        </div>
      </div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}