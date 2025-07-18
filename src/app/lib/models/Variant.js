import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  stock: { type: Number, required: true },
  // sku removed
  images: [{ type: String }],
  attributes: [
    {
      name: String,
      value: String
    }
  ],
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// ✅ Force recompile model to avoid using old cached one
delete mongoose.models.Variant;
export default mongoose.model('Variant', variantSchema);