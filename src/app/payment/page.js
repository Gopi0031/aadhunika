// app/payment/page.js

"use client";

import { useState } from "react";
import PaymentButton from "@/components/PaymentButton";

const HOSPITAL_SERVICES = [
  { name: "OPD Consultation", price: 500 },
  { name: "Lab Test - Blood Work", price: 1200 },
  { name: "X-Ray", price: 800 },
  { name: "MRI Scan", price: 5000 },
  { name: "CT Scan", price: 3500 },
  { name: "ECG", price: 600 },
  { name: "Ultrasound", price: 1500 },
  { name: "Physiotherapy Session", price: 1000 },
  { name: "Dental Checkup", price: 700 },
  { name: "Eye Examination", price: 900 },
];

export default function PaymentPage() {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedService, setSelectedService] = useState(HOSPITAL_SERVICES[0]);

  // Form validation
  const isFormValid =
    patientName.trim() !== "" &&
    patientEmail.trim() !== "" &&
    patientEmail.includes("@") &&
    patientPhone.trim().length >= 10;

  // Calculate totals
  const subtotal = selectedService.price;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0F9FF",
        padding: "40px 16px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        {/* ======= HEADER ======= */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#0077B6",
              margin: "0",
            }}
          >
            🏥 City Hospital
          </h1>
          <p style={{ color: "#6B7280", marginTop: "8px", fontSize: "16px" }}>
            Secure Online Payment Portal
          </p>
        </div>

        {/* ======= MAIN CARD ======= */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            padding: "32px",
          }}
        >
          {/* Section Title */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: "24px",
              borderBottom: "2px solid #E5E7EB",
              paddingBottom: "12px",
            }}
          >
            📋 Patient Details
          </h2>

          {/* Patient Name */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Patient Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient full name"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Email Address <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="patient@email.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Phone Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="tel"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Service Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Select Service <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={selectedService.name}
              onChange={(e) => {
                const service = HOSPITAL_SERVICES.find(
                  (s) => s.name === e.target.value
                );
                if (service) setSelectedService(service);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
              }}
            >
              {HOSPITAL_SERVICES.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.name} — ₹{service.price}
                </option>
              ))}
            </select>
          </div>

          {/* ======= BILL SUMMARY ======= */}
          <div
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
              border: "1px solid #BFDBFE",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#1E40AF",
                marginBottom: "16px",
                margin: "0 0 16px 0",
              }}
            >
              🧾 Bill Summary
            </h3>

            {/* Service Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#4B5563",
              }}
            >
              <span>{selectedService.name}</span>
              <span>₹{subtotal}</span>
            </div>

            {/* GST Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                fontSize: "14px",
                color: "#4B5563",
              }}
            >
              <span>GST (18%)</span>
              <span>₹{gst}</span>
            </div>

            {/* Divider */}
            <hr
              style={{
                border: "none",
                borderTop: "1px dashed #93C5FD",
                margin: "12px 0",
              }}
            />

            {/* Total Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                fontWeight: "700",
                color: "#1E3A5F",
              }}
            >
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>
          </div>

          {/* ======= PAY BUTTON ======= */}
          <div>
            {isFormValid ? (
              <PaymentButton
                amount={total}
                service={selectedService.name}
                patientName={patientName}
                patientEmail={patientEmail}
                patientPhone={patientPhone}
              />
            ) : (
              <button
                disabled
                style={{
                  backgroundColor: "#9CA3AF",
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: "16px",
                  padding: "14px 32px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "not-allowed",
                  width: "100%",
                }}
              >
                Fill all details to proceed
              </button>
            )}
          </div>

          {/* Security Info */}
          <p
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#9CA3AF",
              marginTop: "16px",
            }}
          >
            🔒 Secured by Razorpay | 256-bit SSL Encryption
          </p>
        </div>

        {/* ======= ACCEPTED PAYMENTS ======= */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "13px",
            color: "#9CA3AF",
          }}
        >
          <p>We accept: UPI | Credit Card | Debit Card | Net Banking | Wallets</p>
        </div>
      </div>
    </div>
  );
}