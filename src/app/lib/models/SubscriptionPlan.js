const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    // Change features to key-value pairs
    features: [{
        key: { type: String, required: true },
        value: { type: String, required: true }
    }],
    // Optional fields for additional metadata
    availability: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' },
    duration: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
    discount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    trialPeriod: { type: Number, default: 0 },
    trialPeriodType: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' },
    isFeatured: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

PlanSchema.index({ isActive: 1, price: 1 });

module.exports = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
