import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percent', 'flat'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  usageLimit: {
    type: Number
  },
  usedCount: {
    type: Number,
    default: 0
  },
  minCartValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
