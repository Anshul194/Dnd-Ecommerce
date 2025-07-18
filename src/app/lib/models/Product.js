import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    trim: true,
  }],
  attributeSet: [{
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute',
    },
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);