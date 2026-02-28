// components/PaymentButton.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentButton({
  amount,
  service,
  patientName,
  patientEmail,
  patientPhone,
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1: Load Razorpay Script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Step 2: Create Order on Backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          service,
          patientName,
          patientEmail,
          patientPhone,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "🏥 City Hospital",
        description: `Payment for ${service}`,
        image: "/hospital-logo.png",
        order_id: data.order.id,
        prefill: {
          name: patientName,
          email: patientEmail,
          contact: patientPhone,
        },
        theme: {
          color: "#0077B6",
        },

        // Step 4: Handle Successful Payment
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              router.push(
                `/payment-success?paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}`
              );
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Something went wrong during verification.");
          }
        },

        // Handle modal close
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log("Payment modal closed by user");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      // Handle payment failure
      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        backgroundColor: loading ? "#9CA3AF" : "#0077B6",
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: "16px",
        padding: "14px 32px",
        borderRadius: "10px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        width: "100%",
        transition: "background-color 0.3s ease",
      }}
      onMouseEnter={(e) => {
        if (!loading) e.target.style.backgroundColor = "#005f8f";
      }}
      onMouseLeave={(e) => {
        if (!loading) e.target.style.backgroundColor = "#0077B6";
      }}
    >
      {loading ? "⏳ Processing..." : `💳 Pay ₹${amount}`}
    </button>
  );
}