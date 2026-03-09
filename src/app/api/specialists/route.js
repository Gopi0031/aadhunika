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

/* =====================
   GET – Fetch all specialists
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
   POST – Upload image + save new specialist
===================== */
export async function POST(request) {
  try {
    await connectDB();

    const formData      = await request.formData();
    const name          = formData.get('name');
    const qualification = formData.get('qualification') || '';  // ✅ NEW
    const specialization = formData.get('specialization') || '';
    const description   = formData.get('description')    || '';
    const file          = formData.get('image');

    if (!name || !file) {
      return NextResponse.json(
        { error: 'Name and image are required' },
        { status: 400 }
      );
    }

    const buffer       = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToCloudinary(buffer);

    const specialist = await Specialist.create({
      name,
      qualification,    // ✅ NEW
      specialization,
      description,
      image: uploadResult.secure_url,
    });

    return NextResponse.json(specialist, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* =====================
   PUT – Edit existing specialist (image optional)
===================== */
export async function PUT(request) {
  try {
    await connectDB();

    const formData       = await request.formData();
    const id             = formData.get('id');
    const name           = formData.get('name');
    const qualification  = formData.get('qualification')  || '';
    const specialization = formData.get('specialization') || '';
    const description    = formData.get('description')    || '';
    const file           = formData.get('image');

    // ✅ Use $set so MongoDB always writes every field
    const $set = { name, qualification, specialization, description };

    if (file && file.size > 0) {
      const buffer       = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer);
      $set.image         = uploadResult.secure_url;
    }

    const updated = await Specialist.findByIdAndUpdate(
      id,
      { $set },
      { new: true }
    );

    return NextResponse.json(updated);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


/* =====================
   DELETE – Remove specialist by id
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
