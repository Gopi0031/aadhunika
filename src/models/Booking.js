// src/models/Booking.js

import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  appointmentType: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Offline',
  },
  department: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  // File Upload (Online consultation)
  fileBase64: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    default: '',
  },

  // ======= NEW: Payment Fields =======
  paymentId: {
    type: String,
    default: null,
  },
  orderId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'UNPAID', 'REFUNDED', 'FAILED'],
    default: 'UNPAID',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },

  // Google Meet Link (for Online)
  // Zoom Meeting Details (For Online Appointments)
zoomJoinUrl: {
  type: String,
  default: '',
},
zoomStartUrl: {
  type: String,
  default: '',
},
zoomMeetingId: {
  type: String,
  default: '',
},

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);