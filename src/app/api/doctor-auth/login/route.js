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
    const { identifier, password, dept } = await req.json();

    if (!identifier || !password || !dept) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    // Find by email or phone within selected department
    const doctor = await db.collection('doctors').findOne({
      dept,
      $or: [
        { email: identifier.trim().toLowerCase() },
        { phone: identifier.trim() },
      ],
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found in selected department' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Return safe doctor info (no password)
    const { password: _pw, ...safeDoctor } = doctor;
    return NextResponse.json({
      success: true,
      doctor: { ...safeDoctor, _id: safeDoctor._id.toString() },
    });
  } catch (e) {
    console.error('Doctor login error:', e);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
