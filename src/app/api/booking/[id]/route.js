import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;

async function connect() {
  if (!client) client = new MongoClient(uri);
  if (!client.topology || !client.topology.isConnected()) await client.connect();
  return client.db('hospital');
}

export async function PUT(req, { params }) {
  try {
    const db = await connect();
    const { id } = params;
    const { status } = await req.json();

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Booking PUT Error:', e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
