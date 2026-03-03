// src/app/api/departments/route.js
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;

async function connect() {
  if (!client) client = new MongoClient(uri);
  if (!client.topology || !client.topology.isConnected()) await client.connect();
  return client.db('hospital');
}

function serialize(doc) {
  return { ...doc, _id: doc._id.toString() };
}

export async function GET() {
  try {
    const db = await connect();
    const depts = await db.collection('departments').find({}).toArray();

    if (depts.length === 0) {
      return NextResponse.json([
        { _id: '1', name: 'Pulmonology',  fee: 500 },
        { _id: '2', name: 'Orthopedics',  fee: 600 },
        { _id: '3', name: 'Gynaecology',  fee: 500 },
        { _id: '4', name: 'ENT',           fee: 400 },
      ]);
    }

    return NextResponse.json(depts.map(serialize));
  } catch (e) {
    console.error('Dept GET Error:', e);
    return NextResponse.json([], { status: 500 });
  }
}
export async function PUT(req) {
  try {
    const db = await connect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { oldName, name, fee } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check duplicate (ignore self)
    const exists = await db.collection('departments').findOne({
      name: name.trim(),
      _id: { $ne: new ObjectId(id) },
    });
    if (exists) {
      return NextResponse.json({ error: 'Department name already exists' }, { status: 409 });
    }

    await db.collection('departments').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim(), fee: Number(fee) } }
    );

    // Also update dept name on all doctors if name changed
    if (oldName !== name.trim()) {
      await db.collection('doctors').updateMany(
        { dept: oldName },
        { $set: { dept: name.trim() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Dept PUT Error:', e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const db = await connect();
    const { name, fee } = await req.json();        // ✅ accept fee

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const exists = await db.collection('departments').findOne({ name: name.trim() });
    if (exists) {
      return NextResponse.json({ error: 'Department already exists' }, { status: 409 });
    }

    await db.collection('departments').insertOne({
      name: name.trim(),
      fee: Number(fee) || 0,                       // ✅ store fee
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Dept POST Error:', e);
    return NextResponse.json({ error: 'Failed to add department' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const db = await connect();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    await db.collection('departments').deleteOne({ name });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Dept DELETE Error:', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
