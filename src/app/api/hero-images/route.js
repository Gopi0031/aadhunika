import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroImage from '@/models/HeroImage';

/* GET ALL HERO IMAGES */
export async function GET() {
  await connectDB();
  const heroes = await HeroImage.find({ active: true }).sort({ createdAt: -1 });
  return NextResponse.json(heroes);
}

/* ADD NEW HERO IMAGE */
export async function POST(req) {
  await connectDB();
  const { image } = await req.json();

  const newHero = await HeroImage.create({
    image,
    active: true,
  });

  return NextResponse.json(newHero);
}

/* DELETE ONE HERO IMAGE */
export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  await HeroImage.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
