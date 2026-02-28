import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'hospital';

// SAVE SCHEDULE (POST)
export async function POST(request) {
  const client = await MongoClient.connect(uri);
  try {
    const { date, slots } = await request.json();
    
    const db = client.db(dbName);
    const collection = db.collection('schedules');

    // Update or Insert schedule for this specific date
    await collection.updateOne(
      { date: date },
      { $set: { date, slots, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Schedule updated' });
  } catch (error) {
    console.error("Save Schedule Error:", error);
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// GET SCHEDULE (GET)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) return NextResponse.json(null);

  const client = await MongoClient.connect(uri);
  try {
    const db = client.db(dbName);
    const schedule = await db.collection('schedules').findOne({ date });
    
    // Return the slots array if found, otherwise return null
    return NextResponse.json(schedule ? schedule.slots : null);
  } catch (error) {
    console.error("Get Schedule Error:", error);
    return NextResponse.json(null, { status: 500 });
  } finally {
    await client.close();
  }
}