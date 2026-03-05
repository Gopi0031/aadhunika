import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { createZoomMeeting } from '@/lib/zoomMeet';
import {
  sendPatientBookingEmail,
  sendAdminNewBookingEmail,
  sendDoctorNewBookingEmail,
  sendPatientStatusEmail,
  sendAdminStatusEmail,
  sendDoctorStatusEmail,
} from '@/lib/emails/bookingEmails';

const uri = process.env.MONGODB_URI;
const dbName = 'hospital';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

async function getCollection(collectionName = 'bookings') {
  const client = await MongoClient.connect(uri);
  return { client, collection: client.db(dbName).collection(collectionName) };
}

async function getDoctorEmail(doctorId) {
  if (!doctorId) return null;
  let tempClient;
  try {
    tempClient = await MongoClient.connect(uri);
    const doc = await tempClient
      .db(dbName)
      .collection('doctors')
      .findOne({ _id: new ObjectId(doctorId) }, { projection: { email: 1 } });
    return doc?.email || null;
  } catch (err) {
    console.error('⚠️ getDoctorEmail failed:', err.message);
    return null;
  } finally {
    if (tempClient) await tempClient.close();
  }
}

async function findNextAvailableSlot(department, currentDate, currentTime, client) {
  const slotsCollection = client.db(dbName).collection('slots');
  const bookingsCollection = client.db(dbName).collection('bookings');
  const datesToCheck = [];
  const startDate = new Date(currentDate + 'T00:00:00');

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    datesToCheck.push(checkDate.toLocaleDateString('en-CA'));
  }

  for (const dateStr of datesToCheck) {
    const slotDoc = await slotsCollection.findOne({ date: dateStr, department });
    if (!slotDoc || !slotDoc.slots || slotDoc.slots.length === 0) continue;

    const bookedBookings = await bookingsCollection
      .find({ date: dateStr, department, status: { $nin: ['cancelled'] } })
      .toArray();
    const bookedTimes = bookedBookings.map((b) => b.time);

    for (const slot of slotDoc.slots) {
      if (slot.status === 'closed') continue;
      if (bookedTimes.includes(slot.time)) continue;
      if (dateStr === currentDate && slot.time === currentTime) continue;
      return { date: dateStr, time: slot.time, department };
    }
  }
  return null;
}

// =============================================
// POST — CREATE BOOKING
// =============================================
export async function POST(req) {
  const { client, collection } = await getCollection();

  try {
    const body = await req.json();
    const {
      name, email, phone, appointmentType, department,
      doctorId, doctorName,
      date, time, message, fileBase64, fileName, fileType,
      paymentId, orderId, paymentStatus, amountPaid,
    } = body;

    if (!name || !email || !phone || !department || !date || !time) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await collection.findOne({
      department, date, time,
      status: { $ne: 'cancelled' },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Slot already booked' },
        { status: 409 }
      );
    }

    // AUTO-GENERATE ZOOM IF PAID + ONLINE
    let meetingLink = '';
    let meetingId = '';
    let meetingPassword = '';
    let hostLink = '';

    if (paymentStatus === 'PAID' && appointmentType === 'Online') {
      try {
        console.log('📹 Auto-generating Zoom for paid online booking...');
        const zoomData = await createZoomMeeting({ name, email, department, date, time });
        meetingLink = zoomData.meetLink;
        meetingId = zoomData.meetingId;
        meetingPassword = zoomData.meetingPassword;
        hostLink = zoomData.hostLink || '';
        console.log('✅ Zoom auto-created:', meetingId);
      } catch (zoomError) {
        console.error('⚠️ Zoom auto-creation failed:', zoomError.message);
      }
    }

    const newBooking = {
      name, email, phone,
      appointmentType: appointmentType || 'Offline',
      department,
      doctorId: doctorId || null,
      doctorName: doctorName || '',
      date, time,
      message: message || '',
      file: fileBase64 ? { data: fileBase64, name: fileName, type: fileType } : null,
      paymentId: paymentId || null,
      orderId: orderId || null,
      paymentStatus: paymentStatus || 'UNPAID',
      amountPaid: amountPaid || 0,
      status: 'pending',
      meetingLink, meetingId, meetingPassword, hostLink,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newBooking);
    console.log('✅ Booking saved:', result.insertedId);

    const doctorEmail = await getDoctorEmail(doctorId);
    const bookingWithId = { ...newBooking, _id: result.insertedId };

    // EMAIL 1: PATIENT
    await sendPatientBookingEmail(bookingWithId);

    // EMAIL 2: ADMIN
    if (ADMIN_EMAIL) {
      await sendAdminNewBookingEmail(bookingWithId, ADMIN_EMAIL);
    }

    // EMAIL 3: DOCTOR (only if assigned)
    if (doctorEmail) {
      await sendDoctorNewBookingEmail(bookingWithId, doctorEmail);
    }

    return NextResponse.json({
      success: true,
      message: meetingLink
        ? 'Appointment booked & Zoom meeting created!'
        : 'Appointment booked successfully',
      bookingId: result.insertedId,
      meetingLink,
    });
  } catch (error) {
    console.error('❌ Booking Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// =============================================
// GET — FETCH ALL BOOKINGS
// =============================================
export async function GET(request) {
  const { client, collection } = await getCollection();
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const dept = searchParams.get('dept');

    let query = {};
    if (doctorId) query.doctorId = doctorId;
    else if (dept) query.department = dept;

    const bookings = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// =============================================
// PUT — UPDATE STATUS + ZOOM + RESCHEDULE
// =============================================
export async function PUT(request) {
  const { client, collection } = await getCollection();

  try {
    const body = await request.json();
    const { id, status, cancelReason, newDate, newTime } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID/Status required' }, { status: 400 });
    }

    const booking = await collection.findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let meetingLink = booking.meetingLink || '';
    let meetingId = booking.meetingId || '';
    let meetingPassword = booking.meetingPassword || '';
    let hostLink = booking.hostLink || '';
    let nextSlot = null;

    // CREATE ZOOM IF RESCHEDULING ONLINE
    if (status === 'rescheduled' && booking.appointmentType === 'Online') {
      try {
        console.log('📹 Re-creating Zoom for rescheduled time...');
        const zoomData = await createZoomMeeting({
          name: booking.name, email: booking.email,
          department: booking.department, date: newDate, time: newTime,
        });
        meetingLink = zoomData.meetLink;
        meetingId = zoomData.meetingId;
        meetingPassword = zoomData.meetingPassword;
        hostLink = zoomData.hostLink || '';
        console.log('✅ Rescheduled Zoom created:', meetingId);
      } catch (zoomError) {
        console.error('❌ Zoom reschedule failed:', zoomError.message);
      }
    }

    // CREATE ZOOM IF CONFIRMING ONLINE + NO LINK YET
    if (status === 'confirmed' && booking.appointmentType === 'Online' && !meetingLink) {
      try {
        console.log('📹 Creating Zoom on confirm...');
        const zoomData = await createZoomMeeting({
          name: booking.name, email: booking.email,
          department: booking.department, date: booking.date, time: booking.time,
        });
        meetingLink = zoomData.meetLink;
        meetingId = zoomData.meetingId;
        meetingPassword = zoomData.meetingPassword;
        hostLink = zoomData.hostLink || '';
        console.log('✅ Zoom created:', meetingId);
      } catch (zoomError) {
        console.error('❌ Zoom creation failed:', zoomError.message);
        return NextResponse.json(
          { error: 'Failed to create Zoom meeting. Try again.' },
          { status: 500 }
        );
      }
    }

    // FIND NEXT SLOT IF CANCELLING
    if (status === 'cancelled') {
      try {
        nextSlot = await findNextAvailableSlot(
          booking.department, booking.date, booking.time, client
        );
      } catch (e) {
        console.error('Next slot error:', e);
      }
    }

    const updateData = {
      status,
      updatedAt: new Date(),
      cancelReason: cancelReason || '',
      nextSuggestedSlot: nextSlot || null,
      meetingLink, meetingId, meetingPassword, hostLink,
    };

    if (status === 'rescheduled') {
      updateData.date = newDate;
      updateData.time = newTime;
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const doctorEmail = await getDoctorEmail(booking.doctorId);
    const emailBookingData = { ...booking, ...updateData };

    // EMAIL TO PATIENT
    await sendPatientStatusEmail(emailBookingData, status, nextSlot, meetingLink);

    // EMAIL TO ADMIN
    if (ADMIN_EMAIL) {
      await sendAdminStatusEmail(emailBookingData, status, meetingLink, ADMIN_EMAIL);
    }

    // EMAIL TO DOCTOR (only if assigned)
    if (doctorEmail) {
      await sendDoctorStatusEmail(emailBookingData, status, meetingLink, doctorEmail);
    }

    return NextResponse.json({
      message: 'Updated successfully',
      nextSuggestedSlot: nextSlot,
      meetingLink,
      meetingId,
      newDate: updateData.date,
      newTime: updateData.time,
    });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// =============================================
// DELETE
// =============================================
export async function DELETE(request) {
  const { client, collection } = await getCollection();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  } finally {
    await client.close();
  }
}
