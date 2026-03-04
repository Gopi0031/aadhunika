// app/admin/layout.js
export default function AdminLayout({ children }) {
  return (
    <>
      <style>{`
        header { display: none !important; }
        footer { display: none !important; }
        main   { padding-top: 0 !important; }
      `}</style>
      {children}
    </>
  );
}
