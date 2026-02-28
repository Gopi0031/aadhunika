import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connect() {
  if (!client.topology || !client.topology.isConnected()) await client.connect();
  return client.db('hospital');
}

export async function GET() {
  try {
    const db = await connect();
    const depts = await db.collection('departments').find({}).toArray();

    // 🚨 FALLBACK: If DB is empty, return default departments so UI works
    if (depts.length === 0) {
      return NextResponse.json([
        { _id: '1', name: 'Pulmonology' },
        { _id: '2', name: 'Orthopedics' },
        { _id: '3', name: 'Gynaecology' },
        { _id: '4', name: 'ENT' }
      ]);
    }

    return NextResponse.json(depts);
  } catch (e) {
    console.error("Dept API Error:", e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    const db = await connect();
    const { name } = await req.json();
    await db.collection('departments').insertOne({ name, createdAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}