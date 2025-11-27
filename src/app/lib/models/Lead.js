import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: null },
    email: { type: String, trim: true, lowercase: true, default: null },
    phone: { type: String, trim: true, default: null },
    source: {
      type: String,
      enum: ['website', 'newsletter', 'popup', 'referral', 'manual', 'other', 'IVR', 'facebook_lead_ads'],
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
    lastCallStatus: { type: String, default: null }, // Status of the last call
    followUpCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leadSchema.index({ _id: 1 });

export default leadSchema;
