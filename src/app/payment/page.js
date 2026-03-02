// src/app/payment/page.js
"use client";

import { useState } from "react";
import PaymentButton from "@/components/PaymentButton";

const HOSPITAL_SERVICES = [
  { name: "OPD Consultation", price: 500, icon: "🩺", category: "Consultation" },
  { name: "Lab Test - Blood Work", price: 1200, icon: "🔬", category: "Diagnostics" },
  { name: "X-Ray", price: 800, icon: "🩻", category: "Imaging" },
  { name: "MRI Scan", price: 5000, icon: "🧲", category: "Imaging" },
  { name: "CT Scan", price: 3500, icon: "💻", category: "Imaging" },
  { name: "ECG", price: 600, icon: "❤️", category: "Cardiology" },
  { name: "Ultrasound", price: 1500, icon: "📡", category: "Imaging" },
  { name: "Physiotherapy Session", price: 1000, icon: "🤸", category: "Therapy" },
  { name: "Dental Checkup", price: 700, icon: "🦷", category: "Dental" },
  { name: "Eye Examination", price: 900, icon: "👁️", category: "Ophthalmology" },
];

export default function PaymentPage() {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedService, setSelectedService] = useState(HOSPITAL_SERVICES[0]);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1);

  const isFormValid =
    patientName.trim() !== "" &&
    patientEmail.trim() !== "" &&
    patientEmail.includes("@") &&
    patientPhone.trim().length >= 10;

  const subtotal = selectedService.price;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const inputStyle = (field) => ({
    width: "100%",
    padding: "13px 16px",
    border: `2px solid ${focusedField === field ? "#0F766E" : "#E5E7EB"}`,
    borderRadius: 12,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    background: "transparent",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxShadow: focusedField === field ? "0 0 0 4px rgba(15,118,110,0.1)" : "none",
    transform: focusedField === field ? "translateY(-1px)" : "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 50%, #F5F3FF 100%)", padding: "clamp(80px,10vw,120px) 16px 60px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(15,118,110,0.1)", border: "1px solid rgba(15,118,110,0.2)",
            color: "#0F766E", padding: "6px 18px", borderRadius: 50,
            fontSize: 12, fontWeight: 700, letterSpacing: "1.5px",
            textTransform: "uppercase", marginBottom: 16,
          }}>
            🔒 Secure Payment Portal
          </div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, color: "#1E3A5F", margin: "0 0 8px" }}>
            🏥 Aadhunika Hospital
          </h1>
          <p style={{ color: "#64748B", fontSize: 16 }}>Complete your payment securely</p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
          {["Patient Details", "Service Selection", "Payment"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: step > i ? "linear-gradient(135deg, #0F766E, #059669)" : step === i + 1 ? "linear-gradient(135deg, #0F766E, #059669)" : "#E5E7EB",
                  color: step >= i + 1 ? "#fff" : "#9CA3AF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, transition: "all 0.3s ease",
                  boxShadow: step >= i + 1 ? "0 4px 12px rgba(15,118,110,0.3)" : "none",
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: step >= i + 1 ? "#0F766E" : "#9CA3AF", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  width: "clamp(40px, 8vw, 80px)", height: 2,
                  background: step > i + 1 ? "#0F766E" : "#E5E7EB",
                  margin: "0 8px", marginBottom: 24,
                  transition: "background 0.5s ease",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div style={{
          background: "#fff", borderRadius: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* Card Top Border */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #0F766E, #059669, #15f5ba)" }} />

          <div style={{ padding: "clamp(24px, 4vw, 40px)" }}>

            {/* Section Title */}
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1F2937", margin: "0 0 24px", borderBottom: "2px solid #F1F5F9", paddingBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              📋 Patient Information
            </h2>

            {/* Form Fields */}
            {[
              { label: "Patient Name", key: "name", type: "text", ph: "Enter patient full name", val: patientName, set: setPatientName },
              { label: "Email Address", key: "email", type: "email", ph: "patient@email.com", val: patientEmail, set: setPatientEmail },
              { label: "Phone Number", key: "phone", type: "tel", ph: "Enter 10-digit mobile number", val: patientPhone, set: setPatientPhone, max: 10 },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  {f.label} <span style={{ color: "#ef4444" }}>*</span>
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
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                Select Service <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
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
            <div style={{
              background: "linear-gradient(135deg, #EFF6FF, #EEF2FF)",
              borderRadius: 16, padding: 24, marginBottom: 28,
              border: "1px solid #BFDBFE",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1E40AF", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                🧾 Bill Summary
              </h3>

              {[
                { label: selectedService.name, value: `₹${subtotal}`, bold: false },
                { label: "GST (18%)", value: `₹${gst}`, bold: false },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#4B5563" }}>
                  <span>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}

              <div style={{ border: "none", borderTop: "2px dashed #93C5FD", margin: "14px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "clamp(16px,2.5vw,20px)", fontWeight: 800, color: "#1E3A5F" }}>
                <span>Total Amount</span>
                <span style={{ color: "#059669" }}>₹{total}</span>
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
                <button disabled style={{
                  background: "#E5E7EB", color: "#9CA3AF",
                  width: "100%", padding: "16px", fontSize: 16, fontWeight: 700,
                  borderRadius: 12, border: "none", cursor: "not-allowed", fontFamily: "inherit",
                }}>
                  🔒 Fill all details to proceed
                </button>
                <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 10 }}>
                  Please complete all required fields above
                </p>
              </div>
            )}

            {/* Security Notice */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginTop: 20, flexWrap: "wrap",
            }}>
              {["🔒 256-bit SSL", "💳 Razorpay Secured", "🛡️ PCI DSS Compliant"].map((badge) => (
                <span key={badge} style={{
                  fontSize: 11, color: "#64748B", background: "#F8FAFC",
                  padding: "4px 12px", borderRadius: 20, border: "1px solid #E2E8F0",
                  fontWeight: 600,
                }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Accepted Payments */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 10 }}>
            We accept all major payment methods
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallets"].map((m) => (
              <span key={m} style={{
                fontSize: 12, padding: "5px 14px", borderRadius: 20,
                background: "#fff", border: "1px solid #E5E7EB",
                color: "#374151", fontWeight: 600,
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceTile({ service, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "14px 12px", borderRadius: 12, cursor: "pointer", textAlign: "center",
        border: `2px solid ${selected ? "#0F766E" : hovered ? "#0F766E44" : "#E5E7EB"}`,
        background: selected ? "linear-gradient(135deg, rgba(15,118,110,0.08), rgba(5,150,105,0.06))" : "#fff",
        boxShadow: selected ? "0 4px 16px rgba(15,118,110,0.2)" : hovered ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
        transform: selected || hovered ? "translateY(-2px)" : "none",
        transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6, transition: "transform 0.3s ease", transform: hovered ? "scale(1.2) rotate(8deg)" : "none" }}>
        {service.icon}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: selected ? "#0F766E" : "#374151", marginBottom: 4, lineHeight: 1.3 }}>
        {service.name}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: selected ? "#059669" : "#1F2937" }}>
        ₹{service.price}
      </div>
      {selected && (
        <div style={{ marginTop: 6, fontSize: 10, color: "#0F766E", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0F766E", display: "inline-block" }} />
          Selected
        </div>
      )}
    </div>
  );
}