import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Specialist from '@/models/Specialist';
import cloudinary from '@/lib/cloudinary';

/* =====================
   GET – Fetch specialists
===================== */
export async function GET() {
  try {
    await connectDB();
    const specialists = await Specialist.find().sort({ createdAt: -1 });
    return NextResponse.json(specialists);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* =====================
   POST – Upload image + save
===================== */
export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name');
    const file = formData.get('image');

    if (!name || !file) {
      return NextResponse.json(
        { error: 'Name and image are required' },
        { status: 400 }
      );
    }

    // Convert file → buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'specialists' },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    // Save to MongoDB
    const specialist = await Specialist.create({
      name,
      image: uploadResult.secure_url,
    });

    return NextResponse.json(specialist, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* =====================
   DELETE – Remove specialist
===================== */
export async function DELETE(request) {
  try {
    await connectDB();
    const { id } = await request.json();

    await Specialist.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
