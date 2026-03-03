import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const uri = process.env.MONGODB_URI;
let client;

async function connect() {
  if (!client) client = new MongoClient(uri);
  if (!client.topology || !client.topology.isConnected()) await client.connect();
  return client.db('hospital');
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const db = await connect();
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const doctor = await db.collection('doctors').findOne({ email: email.trim().toLowerCase() });
    if (!doctor) {
      return NextResponse.json({ error: 'No doctor found with this email' }, { status: 404 });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.collection('doctors').updateOne(
      { email: email.trim().toLowerCase() },
      { $set: { resetOTP: otp, resetOTPExpiry: expiry } }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Aadhunika Hospital" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Doctor Portal — Password Reset OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#F0FDFA;border-radius:16px;border:1px solid #CCFBF1">
          <h2 style="color:#0F766E;margin:0 0 8px">Password Reset OTP</h2>
          <p style="color:#374151;margin:0 0 24px">Hi Dr. ${doctor.name},</p>
          <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;border:2px dashed #0F766E;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:13px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:1px">Your OTP Code</p>
            <p style="font-size:42px;font-weight:800;color:#0F766E;margin:0;letter-spacing:8px">${otp}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#94A3B8">Valid for 10 minutes</p>
          </div>
          <p style="font-size:13px;color:#64748B">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Forgot password error:', e);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
