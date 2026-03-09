import mongoose from 'mongoose';

const SpecialistSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true },
    qualification:  { type: String, default: '' },
    specialization: { type: String, default: '' },
    description:    { type: String, default: '' },
    image:          { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ DELETE cached model first so schema changes always take effect
delete mongoose.models.Specialist;

export default mongoose.model('Specialist', SpecialistSchema);
