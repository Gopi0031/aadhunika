// app/doctor/layout.js
export default function DoctorLayout({ children }) {
  return (
    <>
      <style>{`
        /* 1. Hide ONLY the main website's header using its specific class */
        .header-container { 
          display: none !important; 
        }
        
        /* 2. Hide the main website footer */
        footer { 
          display: none !important; 
        }
        
        /* 3. Remove the 60px padding that RootLayout adds to the <main> wrapper */
        body > main { 
          padding-top: 0 !important; 
        }
      `}</style>
      
      {children}
    </>
  );
}