// src/models/Specialist.js
import mongoose from 'mongoose';

const SpecialistSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true },
    specialization: { type: String, default: '' },
    description:    { type: String, default: '' },
    image:          { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Specialist ||
  mongoose.model('Specialist', SpecialistSchema);
