import { connectDB } from '@/lib/mongodb';
import HeroImage from '@/models/HeroImage';

export async function getHeroImages() {
  await connectDB();
  return HeroImage.find({ active: true }).sort({ createdAt: -1 });
}