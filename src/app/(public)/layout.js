// app/(public)/layout.js
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '81px', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
