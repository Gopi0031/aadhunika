// src/app/about/page.js
import { connectDB } from '@/lib/mongodb';
import AboutImage from '@/models/AboutImage';
import AboutPageClient from './AboutPageClient.js'; // ← explicit .js extension

export const dynamic = 'force-dynamic';

async function getAboutImages() {
  try {
    await connectDB();
    const docs = await AboutImage.find({ active: true }).lean();
    return JSON.parse(JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to fetch about images:', err);
    return [];
  }
}

export default async function AboutPage() {
  const aboutImages = await getAboutImages();

  const whoWeAreImage = aboutImages.find(
    (img) => img.section === 'who-we-are'
  );
  const whyChooseImage = aboutImages.find(
    (img) => img.section === 'why-choose-us'
  );

  return (
    <AboutPageClient
      whoWeAreImage={whoWeAreImage}
      whyChooseImage={whyChooseImage}
    />
  );
}