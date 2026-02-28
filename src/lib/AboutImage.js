// src/models/AboutImage.js
import mongoose from 'mongoose';

const AboutImageSchema = new mongoose.Schema(
  {
    image:   { type: String, required: true },
    title:   { type: String, default: '' },
    section: { type: String, required: true },
    active:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.AboutImage ||
  mongoose.model('AboutImage', AboutImageSchema);