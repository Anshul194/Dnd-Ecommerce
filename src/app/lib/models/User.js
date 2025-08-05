import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },

  isSuperAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});



export const UserSchema = userSchema;
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;


