'use client';

import { useState } from 'react';
import PaymentButton from '@/components/PaymentButton';

const HOSPITAL_SERVICES = [
  { name: 'OPD Consultation',        price: 500,  icon: '🩺', category: 'Consultation' },
  { name: 'Lab Test - Blood Work',   price: 1200, icon: '🔬', category: 'Diagnostics' },
  { name: 'X-Ray',                   price: 800,  icon: '🩻', category: 'Imaging' },
  { name: 'MRI Scan',                price: 5000, icon: '🧲', category: 'Imaging' },
  { name: 'CT Scan',                 price: 3500, icon: '💻', category: 'Imaging' },
  { name: 'ECG',                     price: 600,  icon: '❤️', category: 'Cardiology' },
  { name: 'Ultrasound',              price: 1500, icon: '📡', category: 'Imaging' },
  { name: 'Physiotherapy Session',   price: 1000, icon: '🤸', category: 'Therapy' },
  { name: 'Dental Checkup',          price: 700,  icon: '🦷', category: 'Dental' },
  { name: 'Eye Examination',         price: 900,  icon: '👁️', category: 'Ophthalmology' },
];

function ServiceTile({ service, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="pay-service-tile"
      style={{
        border: `2px solid ${selected ? '#0F766E' : hovered ? '#0F766E44' : '#E5E7EB'}`,
        background: selected
          ? 'linear-gradient(135deg, rgba(15,118,110,0.08), rgba(5,150,105,0.06))'
          : '#fff',
        boxShadow: selected
          ? '0 4px 16px rgba(15,118,110,0.2)'
          : hovered ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
        transform: selected || hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div className="pay-tile-icon" style={{ transform: hovered ? 'scale(1.2) rotate(8deg)' : 'none' }}>
        {service.icon}
      </div>
      <div className="pay-tile-name" style={{ color: selected ? '#0F766E' : '#374151' }}>
        {service.name}
      </div>
      <div className="pay-tile-price" style={{ color: selected ? '#059669' : '#1F2937' }}>
        ₹{service.price}
      </div>
      {selected && (
        <div className="pay-tile-selected">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F766E', display: 'inline-block' }} />
          Selected
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  const [patientName,  setPatientName]  = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedService, setSelectedService] = useState(HOSPITAL_SERVICES[0]);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1);

  const isFormValid =
    patientName.trim() !== '' &&
    patientEmail.trim() !== '' &&
    patientEmail.includes('@') &&
    patientPhone.trim().length >= 10;

  const subtotal = selectedService.price;
  const gst      = Math.round(subtotal * 0.18);
  const total    = subtotal + gst;

  const inputStyle = (field) => ({
    width: '100%',
    padding: '13px 16px',
    border: `2px solid ${focusedField === field ? '#0F766E' : '#E5E7EB'}`,
    borderRadius: 12,
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    background: 'transparent',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(15,118,110,0.1)' : 'none',
    transform:  focusedField === field ? 'translateY(-1px)' : 'none',
  });

  const STEPS = ['Patient Details', 'Service Selection', 'Payment'];

  return (
    <>
      <style>{`
        .pay-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 50%, #F5F3FF 100%);
          padding: clamp(80px, 10vw, 120px) 16px 60px;
          font-family: 'Segoe UI', sans-serif;
        }
        .pay-inner { max-width: 680px; margin: 0 auto; }

        /* Header */
        .pay-header { text-align: center; margin-bottom: 36px; }
        .pay-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15,118,110,0.1);
          border: 1px solid rgba(15,118,110,0.2);
          color: #0F766E;
          padding: 6px 18px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .pay-header h1 {
          font-size: clamp(26px, 5vw, 38px);
          font-weight: 800;
          color: #1E3A5F;
          margin: 0 0 8px;
        }
        .pay-header p { color: #64748B; font-size: 16px; margin: 0; }

        /* Progress Steps */
        .pay-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 36px;
        }
        .pay-step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .pay-step-label {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          margin-top: 6px;
        }
        .pay-step-connector {
          height: 2px;
          width: clamp(40px, 8vw, 80px);
          margin: 0 8px;
          margin-bottom: 24px;
          transition: background 0.5s ease;
        }

        /* Main Card */
        .pay-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          margin-bottom: 24px;
        }
        .pay-card-topbar {
          height: 4px;
          background: linear-gradient(90deg, #0F766E, #059669, #15f5ba);
        }
        .pay-card-body { padding: clamp(24px, 4vw, 40px); }
        .pay-section-title {
          font-size: 20px;
          font-weight: 800;
          color: #1F2937;
          margin: 0 0 24px;
          border-bottom: 2px solid #F1F5F9;
          padding-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Service Tiles */
        .pay-tiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
          margin-bottom: 28px;
        }
        .pay-service-tile {
          padding: 14px 12px;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .pay-tile-icon {
          font-size: 24px;
          margin-bottom: 6px;
          transition: transform 0.3s ease;
        }
        .pay-tile-name {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pay-tile-price { font-size: 13px; font-weight: 800; }
        .pay-tile-selected {
          margin-top: 6px;
          font-size: 10px;
          color: #0F766E;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        /* Bill Summary */
        .pay-bill {
          background: linear-gradient(135deg, #EFF6FF, #EEF2FF);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 28px;
          border: 1px solid #BFDBFE;
        }
        .pay-bill-title {
          font-size: 16px;
          font-weight: 800;
          color: #1E40AF;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pay-bill-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: #4B5563;
        }
        .pay-bill-divider {
          border: none;
          border-top: 2px dashed #93C5FD;
          margin: 14px 0;
        }
        .pay-bill-total {
          display: flex;
          justify-content: space-between;
          font-size: clamp(16px, 2.5vw, 20px);
          font-weight: 800;
          color: #1E3A5F;
        }

        /* Disabled pay button */
        .pay-disabled-btn {
          background: #E5E7EB;
          color: #9CA3AF;
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 12px;
          border: none;
          cursor: not-allowed;
          font-family: inherit;
        }

        /* Security badges */
        .pay-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .pay-badge-item {
          font-size: 11px;
          color: #64748B;
          background: #F8FAFC;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          font-weight: 600;
        }

        /* Accepted payments */
        .pay-methods {
          text-align: center;
          margin-top: 24px;
        }
        .pay-method-tag {
          font-size: 12px;
          padding: 5px 14px;
          border-radius: 20px;
          background: #fff;
          border: 1px solid #E5E7EB;
          color: #374151;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          margin: 4px;
          display: inline-block;
        }

        @media (max-width: 480px) {
          .pay-tiles-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="pay-wrapper">
        <div className="pay-inner">

          {/* Header */}
          <div className="pay-header">
            <div className="pay-badge">🔒 Secure Payment Portal</div>
            <h1>🏥 Aadhunika Hospital</h1>
            <p>Complete your payment securely</p>
          </div>

          {/* Progress Steps */}
          <div className="pay-steps">
            {STEPS.map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    className="pay-step-circle"
                    style={{
                      background: step >= i + 1
                        ? 'linear-gradient(135deg, #0F766E, #059669)'
                        : '#E5E7EB',
                      color: step >= i + 1 ? '#fff' : '#9CA3AF',
                      boxShadow: step >= i + 1 ? '0 4px 12px rgba(15,118,110,0.3)' : 'none',
                    }}
                  >
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="pay-step-label" style={{ color: step >= i + 1 ? '#0F766E' : '#9CA3AF' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="pay-step-connector"
                    style={{ background: step > i + 1 ? '#0F766E' : '#E5E7EB' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Main Card */}
          <div className="pay-card">
            <div className="pay-card-topbar" />
            <div className="pay-card-body">

              <h2 className="pay-section-title">📋 Patient Information</h2>

              {/* Form Fields */}
              {[
                { label: 'Patient Name',   key: 'name',  type: 'text',  ph: 'Enter patient full name',      val: patientName,  set: setPatientName },
                { label: 'Email Address',  key: 'email', type: 'email', ph: 'patient@email.com',             val: patientEmail, set: setPatientEmail },
                { label: 'Phone Number',   key: 'phone', type: 'tel',   ph: 'Enter 10-digit mobile number', val: patientPhone, set: setPatientPhone, max: 10 },
              ].map((f) => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    {f.label} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type={f.type}
                    value={f.val}
                    maxLength={f.max}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    onFocus={() => setFocusedField(f.key)}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle(f.key)}
                  />
                </div>
              ))}

              {/* Service Selection */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                  Select Service <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="pay-tiles-grid">
                  {HOSPITAL_SERVICES.map((service) => (
                    <ServiceTile
                      key={service.name}
                      service={service}
                      selected={selectedService.name === service.name}
                      onClick={() => setSelectedService(service)}
                    />
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="pay-bill">
                <h3 className="pay-bill-title">🧾 Bill Summary</h3>
                <div className="pay-bill-row">
                  <span>{selectedService.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal}</span>
                </div>
                <div className="pay-bill-row">
                  <span>GST (18%)</span>
                  <span style={{ fontWeight: 600 }}>₹{gst}</span>
                </div>
                <hr className="pay-bill-divider" />
                <div className="pay-bill-total">
                  <span>Total Amount</span>
                  <span style={{ color: '#059669' }}>₹{total}</span>
                </div>
              </div>

              {/* Pay Button */}
              {isFormValid ? (
                <PaymentButton
                  amount={total}
                  service={selectedService.name}
                  patientName={patientName}
                  patientEmail={patientEmail}
                  patientPhone={patientPhone}
                />
              ) : (
                <div>
                  <button disabled className="pay-disabled-btn">
                    🔒 Fill all details to proceed
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>
                    Please complete all required fields above
                  </p>
                </div>
              )}

              {/* Security badges */}
              <div className="pay-badges">
                {['🔒 256-bit SSL', '💳 Razorpay Secured', '🛡️ PCI DSS Compliant'].map((badge) => (
                  <span key={badge} className="pay-badge-item">{badge}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Accepted Methods */}
          <div className="pay-methods">
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10 }}>
              We accept all major payment methods
            </p>
            {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets'].map((m) => (
              <span key={m} className="pay-method-tag">{m}</span>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
