import mongoose from 'mongoose';

const SpecialistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Specialist ||
  mongoose.model('Specialist', SpecialistSchema);
