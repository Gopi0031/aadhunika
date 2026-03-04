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
      {/* ✅ Added margin: 0, padding: 0, and overflowX: 'hidden' to prevent white gaps */}
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden', backgroundColor: '#F0FDF4' }}>
        <Header />
        
        {/* ✅ Forced main to be 100% width with no restrictive boundaries */}
        <main style={{ paddingTop: '60px', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
          {children}
        </main>
        
        <Footer />

        <Toaster position="top-right" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}