// src/app/api/debug/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroImage from '@/models/HeroImage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const count = await HeroImage.countDocuments();
    const images = await HeroImage.find({ active: true }).lean();

    return NextResponse.json({
      status: 'connected',
      totalImages: count,
      images: images.map((img) => ({
        id: img._id.toString(),
        image: img.image,
        active: img.active,
      })),
      mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        message: err.message,
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      },
      { status: 500 }
    );
  }
}