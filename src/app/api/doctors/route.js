import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'hospital';

async function getCollection() {
  const client = await MongoClient.connect(uri);
  return { client, collection: client.db(dbName).collection('doctors') };
}

// GET: Fetch all doctors
export async function GET() {
  const { client, collection } = await getCollection();
  try {
    const data = await collection.find({}).toArray();
    return NextResponse.json(data);
  } finally {
    await client.close();
  }
}

// POST: Add doctor
export async function POST(req) {
  const { client, collection } = await getCollection();
  try {
    const body = await req.json();
    await collection.insertOne({ ...body, createdAt: new Date() });
    return NextResponse.json({ success: true });
  } finally {
    await client.close();
  }
}

// DELETE: Remove doctor
export async function DELETE(req) {
  const { client, collection } = await getCollection();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } finally {
    await client.close();
  }
}