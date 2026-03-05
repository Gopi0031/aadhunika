// src/app/api/revenue/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'hospital';

function istDateString(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function monthRangeIST() {
  const today = istDateString();
  const [y, m] = today.split('-').map(Number);

  const yyyy = String(y);
  const mm = String(m).padStart(2, '0');
  const monthStart = `${yyyy}-${mm}-01`;

  let nextY = y;
  let nextM = m + 1;
  if (nextM === 13) {
    nextM = 1;
    nextY = y + 1;
  }
  const nextMonthStart = `${String(nextY)}-${String(nextM).padStart(2, '0')}-01`;

  return { monthStart, nextMonthStart, today };
}

async function getCollection() {
  const client = await MongoClient.connect(uri);
  const collection = client.db(dbName).collection('bookings');
  return { client, collection };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId');
  const byDoctor = searchParams.get('byDoctor') === '1';

  const { client, collection } = await getCollection();
  try {
    const { monthStart, nextMonthStart, today } = monthRangeIST();

    const matchBase = {
      paymentStatus: 'PAID',
      amountPaid: { $gt: 0 },
      status: { $ne: 'cancelled' },
    };

    if (doctorId) {
      matchBase.doctorId = doctorId;
    }

    const agg = await collection.aggregate([
      { $match: matchBase },

      // 🔥 Strip heavy fields before $facet to avoid 16MB BSON limit
      // file.data (base64) is the main culprit — can be MBs per document
      {
        $project: {
          file: 0,
          meetingLink: 0,
          meetingId: 0,
          meetingPassword: 0,
          hostLink: 0,
          message: 0,
          orderId: 0,
          phone: 0,
          email: 0,
        },
      },

      {
        $facet: {
          total: [
            { $group: { _id: null, revenue: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
          ],
          today: [
            { $match: { date: today } },
            { $group: { _id: null, revenue: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
          ],
          month: [
            { $match: { date: { $gte: monthStart, $lt: nextMonthStart } } },
            { $group: { _id: null, revenue: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
          ],

          byDoctorTotal: (byDoctor && !doctorId) ? [
            {
              $group: {
                _id: { doctorId: '$doctorId', doctorName: '$doctorName', dept: '$department' },
                revenue: { $sum: '$amountPaid' },
                count: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
          ] : [],

          byDoctorToday: (byDoctor && !doctorId) ? [
            { $match: { date: today } },
            {
              $group: {
                _id: { doctorId: '$doctorId', doctorName: '$doctorName', dept: '$department' },
                revenue: { $sum: '$amountPaid' },
                count: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
          ] : [],

          byDoctorMonth: (byDoctor && !doctorId) ? [
            { $match: { date: { $gte: monthStart, $lt: nextMonthStart } } },
            {
              $group: {
                _id: { doctorId: '$doctorId', doctorName: '$doctorName', dept: '$department' },
                revenue: { $sum: '$amountPaid' },
                count: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
          ] : [],
        },
      },
    ]).toArray();

    const out = agg?.[0] || {};

    const safeOne = (arr) => arr?.[0] || { revenue: 0, count: 0 };
    const total = safeOne(out.total);
    const todayAgg = safeOne(out.today);
    const monthAgg = safeOne(out.month);

    let doctorWise = [];
    if (byDoctor && !doctorId) {
      const map = new Map();

      const put = (arr, key) => {
        (arr || []).forEach((r) => {
          const id = r?._id?.doctorId || 'unassigned';
          const prev = map.get(id) || {
            doctorId: id,
            doctorName: r?._id?.doctorName || 'Unassigned',
            dept: r?._id?.dept || '—',
            todayRevenue: 0,
            monthRevenue: 0,
            totalRevenue: 0,
            todayCount: 0,
            monthCount: 0,
            totalCount: 0,
          };
          prev[`${key}Revenue`] = r.revenue || 0;
          prev[`${key}Count`] = r.count || 0;
          map.set(id, prev);
        });
      };

      put(out.byDoctorTotal, 'total');
      put(out.byDoctorToday, 'today');
      put(out.byDoctorMonth, 'month');

      doctorWise = Array.from(map.values())
        .filter((d) => d.doctorId && d.doctorId !== 'unassigned')
        .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
    }

    return NextResponse.json({
      ok: true,
      todayDate: today,
      monthStart,
      nextMonthStart,
      todayRevenue: todayAgg.revenue || 0,
      todayPaidCount: todayAgg.count || 0,
      monthRevenue: monthAgg.revenue || 0,
      monthPaidCount: monthAgg.count || 0,
      totalRevenue: total.revenue || 0,
      totalPaidCount: total.count || 0,
      doctorWise,
    });
  } catch (e) {
    console.error('Revenue API error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  } finally {
    await client.close();
  }
}
