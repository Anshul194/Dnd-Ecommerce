import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },

  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },

  isSuperAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  deletedAt: { type: Date, default: null },
  deleted: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }

});



export const UserSchema = userSchema;
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;


