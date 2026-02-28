// src/app/api/create-order/route.js
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // ---- Debug: Check if keys exist ----
    console.log("🔑 Key ID exists:", !!keyId);
    console.log("🔑 Key ID starts with:", keyId?.substring(0, 15));
    console.log("🔑 Key Secret exists:", !!keySecret);
    console.log("🔑 Key Secret length:", keySecret?.length);

    // ---- Validate keys before creating instance ----
    if (!keyId || !keySecret) {
      console.error("❌ Razorpay keys missing in .env.local!");
      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway not configured. Contact admin.",
        },
        { status: 500 }
      );
    }

    if (!keyId.startsWith("rzp_live_") && !keyId.startsWith("rzp_test_")) {
      console.error("❌ Invalid Razorpay Key ID format:", keyId);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment gateway configuration.",
        },
        { status: 500 }
      );
    }

    // ---- Create Razorpay instance ----
    const razorpay = new Razorpay({
      key_id: keyId.trim(),
      key_secret: keySecret.trim(),
    });

    const body = await req.json();
    const { amount, service, patientName, patientEmail, patientPhone } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Amount in PAISE (₹500 = 50000 paise)
    const amountInPaise = Math.round(amount * 100);

    console.log(`💰 Creating order: ₹${amount} = ${amountInPaise} paise`);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      payment_capture: 1,
      notes: {
        service: service || "Consultation",
        patientName: patientName || "",
        patientEmail: patientEmail || "",
        patientPhone: patientPhone || "",
        hospital: "Aadhunika Multispeciality Hospital",
      },
    });

    console.log("✅ Order created:", {
      id: order.id,
      amount: order.amount,
      status: order.status,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Create Order Error:", error);

    // ---- Specific error messages ----
    let errorMessage = "Failed to create payment order";

    if (error.statusCode === 401) {
      errorMessage =
        "Payment gateway authentication failed. Check API keys.";
      console.error("====================================");
      console.error("🚨 RAZORPAY 401 ERROR — FIX STEPS:");
      console.error("1. Go to https://dashboard.razorpay.com");
      console.error("2. Settings → API Keys → Regenerate");
      console.error("3. Copy BOTH Key ID and Key Secret");
      console.error("4. Paste in .env.local (no quotes/spaces)");
      console.error("5. RESTART the server (npm run dev)");
      console.error("====================================");
    } else if (error.statusCode === 400) {
      errorMessage = "Invalid request to payment gateway.";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}