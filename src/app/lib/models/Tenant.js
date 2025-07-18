const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },


  dbUri: { type: String },  
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  plan: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['trial', 'active', 'cancelled', 'expired'], default: 'trial' },
  trialEndsAt: { type: Date },
  renewalDate: { type: Date },


  lastAccessedAt: { type: Date },
  notes: { type: String },

  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
