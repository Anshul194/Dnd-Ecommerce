import mongoose from 'mongoose';

export const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number
  },
  stock: {
    type: Number,
    required: true
  },
  images: [String],
  attributes: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute',
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  ],
  offerTag: String, 
  isDefault: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

delete mongoose.models.Variant;
export default mongoose.model('Variant', variantSchema);
