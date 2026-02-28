// src/app/api/contact/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';

/* ===== POST: SAVE + EMAIL ===== */
export async function POST(request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
      status: 'new',
    });

    // Send email to admin
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Aadhunika Hospital" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `New Contact Message - ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0F766E,#14B8A6);padding:24px;text-align:center;">
              <h2 style="color:#fff;margin:0;">📩 New Contact Message</h2>
            </div>
            <div style="padding:30px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:12px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6;">Name</td><td style="padding:12px;border-bottom:1px solid #f3f4f6;">${name}</td></tr>
                <tr><td style="padding:12px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6;">Email</td><td style="padding:12px;border-bottom:1px solid #f3f4f6;">${email}</td></tr>
                <tr><td style="padding:12px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6;">Phone</td><td style="padding:12px;border-bottom:1px solid #f3f4f6;">${phone}</td></tr>
                <tr><td style="padding:12px;font-weight:bold;color:#374151;">Message</td><td style="padding:12px;">${message}</td></tr>
              </table>
            </div>
            <div style="background:#f9fafb;padding:16px;text-align:center;color:#6b7280;font-size:13px;">
              Aadhunika Multispeciality Hospital - Contact Form
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email failed:', emailError);
    }

    return NextResponse.json(
      { success: true, data: contact },
      { status: 201 }
    );
  } catch (error) {
    console.error('CONTACT POST ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

/* ===== GET: ADMIN FETCH ===== */
export async function GET() {
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(contacts, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('CONTACT GET ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ===== PUT: UPDATE STATUS ===== */
export async function PUT(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status required' },
        { status: 400 }
      );
    }

    await connectDB();

    await Contact.findByIdAndUpdate(id, {
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Status updated' });
  } catch (error) {
    console.error('CONTACT PUT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}

/* ===== DELETE: REMOVE CONTACT ===== */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID required' },
        { status: 400 }
      );
    }

    await connectDB();

    await Contact.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('CONTACT DELETE ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}