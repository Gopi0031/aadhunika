// seed.js  ← run with: node seed.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb+srv://YOUR_URI_HERE';

const doctors = [
  {
    name: 'Dr. Ramesh Kumar',
    email: 'ramesh@hospital.com',
    phone: '9876543210',
    dept: 'Cardiology',
    specialization: 'Cardiac Surgeon',
    fee: 500,
    password: 'doctor123',
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya@hospital.com',
    phone: '9876543211',
    dept: 'Cardiology',
    specialization: 'Cardiologist',
    fee: 400,
    password: 'doctor456',
  },
  {
    name: 'Dr. Arjun Mehta',
    email: 'arjun@hospital.com',
    phone: '9876543212',
    dept: 'Neurology',
    specialization: 'Neurologist',
    fee: 600,
    password: 'doctor789',
  },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('hospital');
    const col = db.collection('doctors');

    console.log('🌱 Seeding doctors...\n');

    for (const doc of doctors) {
      // Check if already exists
      const existing = await col.findOne({ email: doc.email });
      if (existing) {
        console.log(`⚠️  Skipped (already exists): ${doc.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(doc.password, 10);

      await col.insertOne({
        name:           doc.name,
        email:          doc.email.toLowerCase(),
        phone:          doc.phone,
        dept:           doc.dept,
        specialization: doc.specialization,
        fee:            doc.fee,
        password:       hashedPassword,
        createdAt:      new Date(),
      });

      console.log(`✅ Added: ${doc.name} (${doc.email}) | dept: ${doc.dept} | pass: ${doc.password}`);
    }

    console.log('\n🎉 Seeding complete!');
  } catch (e) {
    console.error('❌ Seed failed:', e);
  } finally {
    await client.close();
  }
}

seed();
