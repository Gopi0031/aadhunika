import { NextResponse } from 'next/server';
import { connectDB }    from '@/lib/mongodb';
import Specialist       from '@/models/Specialist';
import cloudinary       from '@/lib/cloudinary';

/* ── helper: upload buffer → Cloudinary ── */
async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'specialists' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });
}

/* ── GET ── */
export async function GET() {
  try {
    await connectDB();
    const specialists = await Specialist.find().sort({ createdAt: -1 });
    return NextResponse.json(specialists);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ── POST ── */
export async function POST(request) {
  try {
    await connectDB();
    const formData      = await request.formData();
    const name          = formData.get('name');
    const specialization = formData.get('specialization') || '';
    const description   = formData.get('description') || '';
    const file          = formData.get('image');

    if (!name || !file)
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 });

    const buffer       = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToCloudinary(buffer);

    const specialist = await Specialist.create({
      name,
      specialization,
      description,
      image: uploadResult.secure_url,
    });

    return NextResponse.json(specialist, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ── PUT (edit) ── */
export async function PUT(request) {
  try {
    await connectDB();
    const formData       = await request.formData();
    const id             = formData.get('id');
    const name           = formData.get('name');
    const specialization = formData.get('specialization') || '';
    const description    = formData.get('description') || '';
    const file           = formData.get('image'); // optional

    const updateData = { name, specialization, description };

    // Only re-upload if a new image was provided
    if (file && file.size > 0) {
      const buffer       = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer);
      updateData.image   = uploadResult.secure_url;
    }

    const updated = await Specialist.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ── DELETE ── */
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
