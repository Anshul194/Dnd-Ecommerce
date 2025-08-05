import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String, unique: true, sparse: true }, // Made optional and sparse
  passwordHash: { type: String},
  phone: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },

  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },

  isSuperAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

export default userSchema;
