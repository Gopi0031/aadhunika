import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'hospital';

async function getDb() {
  const client = await MongoClient.connect(uri);
  return { client, db: client.db(dbName) };
}

// 🚨 FALLBACK: If DB has no settings for a day, show these
const HARDCODED_DEFAULTS = [
  { time: '09:00 AM – 10:00 AM', status: 'available' },
  { time: '10:00 AM – 11:00 AM', status: 'available' },
  { time: '11:00 AM – 12:00 PM', status: 'available' },
  { time: '05:00 PM – 06:00 PM', status: 'available' },
  { time: '06:00 PM – 07:00 PM', status: 'available' },
];

export async function GET(request) {
  const { client, db } = await getDb();
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const department = searchParams.get('department');

    if (!department) {
      return NextResponse.json({ error: 'Department required' }, { status: 400 });
    }

    const slotsCollection = db.collection('slots');
    const bookingsCollection = db.collection('bookings');
    const defaultsCollection = db.collection('department_defaults');
    const holidaysCollection = db.collection('holidays');

    // 1. Check if Holiday
    if (date) {
      const holiday = await holidaysCollection.findOne({ date, department });
      if (holiday) {
        return NextResponse.json({ isHoliday: true, slots: [] });
      }
    }

    // 2. Fetch Data Sources in Parallel
    const [specificSlots, existingBookings, globalDefaults] = await Promise.all([
      date ? slotsCollection.find({ date, department }).sort({ time: 1 }).toArray() : [],
      date ? bookingsCollection.find({ date, department, status: { $nin: ['cancelled'] } }).toArray() : [],
      defaultsCollection.findOne({ department })
    ]);

    // 3. Determine Source Slots
    let sourceSlots = [];

    if (specificSlots.length > 0) {
      // A. Use Specific Date Overrides
      sourceSlots = specificSlots;
    } else if (globalDefaults && globalDefaults.slots && globalDefaults.slots.length > 0) {
      // B. Use Global Defaults from Admin
      sourceSlots = globalDefaults.slots.map(s => ({
        time: s.time,
        status: s.status || 'available', 
        date: date
      }));
    } else {
      // C. 🚨 USE HARDCODED FALLBACK (Fixes "Not Visible" issue)
      sourceSlots = HARDCODED_DEFAULTS.map(s => ({
        time: s.time,
        status: 'available',
        date: date
      }));
    }

    // 4. Merge with Bookings
    const bookedTimes = new Set(existingBookings.map((b) => b.time));

    const mergedSlots = sourceSlots.map((slot) => {
      // If admin marked as closed
      if (slot.status === 'closed') return { ...slot, status: 'closed' };
      // If patient booked it
      if (bookedTimes.has(slot.time)) return { ...slot, status: 'booked' };
      // Otherwise available
      return { ...slot, status: 'available' };
    });

    return NextResponse.json({ 
      isHoliday: false, 
      slots: mergedSlots 
    });

  } catch (error) {
    console.error('Slots fetch error:', error);
    // Return defaults on error so UI doesn't break
    return NextResponse.json({ isHoliday: false, slots: HARDCODED_DEFAULTS }); 
  } finally {
    await client.close();
  }
}

export async function POST(request) {
  const { client, db } = await getDb();
  try {
    const body = await request.json();
    const { date, department, slots, isGlobalTemplate, isHoliday, applyToAll } = body;

    const slotsCollection = db.collection('slots');
    const defaultsCollection = db.collection('department_defaults');
    const holidaysCollection = db.collection('holidays');

    // 1. Global Defaults
    if (isGlobalTemplate) {
      if (applyToAll) {
         // Update all departments (requires fetching dept list or hardcoded)
         const depts = await db.collection('departments').find({}).toArray();
         const operations = depts.map(d => 
            defaultsCollection.updateOne({ department: d.name }, { $set: { department: d.name, slots, updatedAt: new Date() } }, { upsert: true })
         );
         await Promise.all(operations);
      } else {
         await defaultsCollection.updateOne({ department }, { $set: { department, slots, updatedAt: new Date() } }, { upsert: true });
      }
      return NextResponse.json({ success: true });
    }

    // 2. Mark Holiday
    if (isHoliday) {
      await holidaysCollection.updateOne({ date, department }, { $set: { date, department, reason: 'Closed', createdAt: new Date() } }, { upsert: true });
      await slotsCollection.deleteMany({ date, department });
      return NextResponse.json({ success: true });
    }

    // 3. Specific Slots
    await holidaysCollection.deleteOne({ date, department });
    await slotsCollection.deleteMany({ date, department });

    if (Array.isArray(slots) && slots.length > 0) {
      const slotDocs = slots.map((slot) => ({
        date, department, time: slot.time, status: slot.status || 'available', updatedAt: new Date(),
      }));
      await slotsCollection.insertMany(slotDocs);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  } finally {
    await client.close();
  }
}