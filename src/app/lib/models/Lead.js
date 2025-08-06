import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: {
      type: String,
      enum: ['website', 'newsletter', 'popup', 'referral', 'manual', 'other'],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'assigned', 'qualified', 'converted', 'lost'],
      default: 'new',
    },
    tags: [{ type: String, trim: true }],
    notes: [
      {
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Removed required: true
      },
    ],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    convertedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    converted: { type: Boolean, default: false },
    lastContactedAt: { type: Date },
    nextFollowUpAt: { type: Date },
    followUpCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leadSchema.index({ _id: 1 });

export default leadSchema;
