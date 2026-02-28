import mongoose from 'mongoose';

const HeroImageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.HeroImage ||
  mongoose.model('HeroImage', HeroImageSchema);
