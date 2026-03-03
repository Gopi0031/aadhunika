// src/app/api/doctors/route.js
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;

async function connect() {
  if (!client) client = new MongoClient(uri);
  if (!client.topology || !client.topology.isConnected()) await client.connect();
  return client.db('hospital');
}

// ✅ Serialize ObjectId → string so JSON works properly
function serialize(doc) {
  return { ...doc, _id: doc._id.toString() };
}

export async function GET() {
  try {
    const db = await connect();
    const doctors = await db.collection('doctors').find({}).toArray();
    return NextResponse.json(doctors.map(serialize));
  } catch (e) {
    console.error('Doctors GET Error:', e);
    return NextResponse.json([], { status: 500 });
  }
}
export async function PUT(req) {
  try {
    const db = await connect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { name, dept } = await req.json();

    if (!name?.trim() || !dept?.trim()) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 });
    }

    await db.collection('doctors').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim(), dept: dept.trim() } }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Doctors PUT Error:', e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const db = await connect();
    const { name, dept, image, speciality } = await req.json();

    if (!name?.trim() || !dept?.trim()) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 });
    }

    const result = await db.collection('doctors').insertOne({
      name: name.trim(),
      dept: dept.trim(),
      image: image || '',
      speciality: speciality || dept.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (e) {
    console.error('Doctors POST Error:', e);
    return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const db = await connect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // ✅ Convert string id back to ObjectId for MongoDB query
    await db.collection('doctors').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Doctors DELETE Error:', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
