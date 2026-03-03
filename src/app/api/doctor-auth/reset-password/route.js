import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
let client;

async function connect() {
  if (!client) client = new MongoClient(uri);
  if (!client.topology || !client.topology.isConnected()) await client.connect();
  return client.db('hospital');
}

export async function POST(req) {
  try {
    const db = await connect();
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const doctor = await db.collection('doctors').findOne({ email: email.trim().toLowerCase() });

    if (!doctor || doctor.resetOTP !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > new Date(doctor.resetOTPExpiry)) {
      return NextResponse.json({ error: 'OTP has expired. Request a new one.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('doctors').updateOne(
      { email: email.trim().toLowerCase() },
      {
        $set: { password: hashedPassword },
        $unset: { resetOTP: '', resetOTPExpiry: '' },
      }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Reset password error:', e);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
