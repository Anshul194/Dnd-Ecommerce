import mongoose from 'mongoose';
import slugify from 'slugify';

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  values: [String],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

attributeSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

export default mongoose.models.Attribute || mongoose.model('Attribute', attributeSchema);
export { attributeSchema };
