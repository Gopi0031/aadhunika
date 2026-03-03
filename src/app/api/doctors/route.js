import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
let client;

async function connect() {
  if (!client) client = new MongoClient(uri);
  if (!client.topology || !client.topology.isConnected()) await client.connect();
  return client.db('hospital');
}

function serialize(doc) {
  const { password, ...rest } = doc;
  return { ...rest, _id: doc._id.toString() };
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

export async function POST(req) {
  try {
    const db = await connect();
    const { name, phone, dept, specialization, fee, email, password } = await req.json();

    if (!name?.trim() || !dept?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Check duplicate email or phone
    const exists = await db.collection('doctors').findOne({
      $or: [{ email: email.trim().toLowerCase() }, { phone: phone?.trim() }],
    });
    if (exists) {
      return NextResponse.json({ error: 'Doctor with this email or phone already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection('doctors').insertOne({
      name: name.trim(),
      phone: phone?.trim() || '',
      dept: dept.trim(),
      specialization: specialization?.trim() || dept.trim(),
      fee: Number(fee) || 0,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (e) {
    console.error('Doctors POST Error:', e);
    return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const db = await connect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { name, dept, phone, specialization, fee, email } = await req.json();

    if (!name?.trim() || !dept?.trim()) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 });
    }

    await db.collection('doctors').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim(), dept: dept.trim(), phone: phone || '', specialization: specialization || '', fee: Number(fee) || 0, email: email || '' } }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Doctors PUT Error:', e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const db = await connect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await db.collection('doctors').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
