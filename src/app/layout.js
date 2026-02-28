// app/layout.js

import './globals.css';
import Script from 'next/script';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Aadhunika Multispeciality Hospital',
  description: 'Excellence in Healthcare – Your Partner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ======= HEADER ======= */}
        <Header />

        {/* ======= MAIN CONTENT ======= */}
        <main>{children}</main>

        {/* ======= FOOTER ======= */}
        <Footer />

        {/* ======= TOAST NOTIFICATIONS ======= */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '16px 24px',
            },
            success: {
              style: {
                background: '#10B981',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
            },
            loading: {
              style: {
                background: '#3B82F6',
              },
            },
          }}
        />

        {/* ======= RAZORPAY CHECKOUT SCRIPT ======= */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}