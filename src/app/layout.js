// app/layout.js
import './globals.css';
import Script from 'next/script';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Aadhunika Multispeciality Hospital | Excellence in Healthcare',
  description:
    'Aadhunika Multispeciality Hospital — your trusted partner for advanced medical care, specialist consultations, 24/7 emergency services, and compassionate treatment in Guntur, Andhra Pradesh.',
  keywords:
    'hospital, multispeciality, Guntur, Andhra Pradesh, healthcare, doctors, specialists, emergency',
  openGraph: {
    title: 'Aadhunika Multispeciality Hospital',
    description: 'Excellence in Healthcare – Your Partner',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <Header />
        <main style={{ paddingTop: '60px' }}>{children}</main>
        <Footer />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '600',
              borderRadius: '12px',
              // padding: '16px 24px',
              fontSize: '15px',
            },
            success: {
              style: { background: '#10B981' },
              iconTheme: { primary: '#fff', secondary: '#10B981' },
            },
            error: {
              style: { background: '#EF4444' },
              iconTheme: { primary: '#fff', secondary: '#EF4444' },
            },
            loading: {
              style: { background: '#3B82F6' },
            },
          }}
        />

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}