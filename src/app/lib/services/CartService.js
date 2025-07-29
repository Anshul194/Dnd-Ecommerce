


import cartRepository from '../repository/CartRepository';
import { productSchema } from '../models/Product';
import  { variantSchema } from '../models/Variant';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon';

class CartService {
  async getCart(userId, conn) {
    return cartRepository.getCartByUser(userId, conn);
  }


  async addItem(userId, { product, variant, quantity, price, couponCode }, conn) {
    // Validate product existence
    const ProductModel = conn.models.Product || conn.model('Product', productSchema);
    const VariantModel = conn.models.Variant || conn.model('Variant', variantSchema);
    console.log('[CartService.addItem] Validating product:', product, 'variant:', variant, 'quantity:', quantity, 'price:', price);
    // console.log('nm',conn)
    if (!product) throw new Error('Product is required');
    if (!mongoose.Types.ObjectId.isValid(product)) throw new Error('Invalid product ID');

    // Always use ObjectId for _id query
    const productIdObj = new mongoose.Types.ObjectId(product);
    let prod = await ProductModel.findOne({ 
      _id: productIdObj,
      deletedAt: null
    });
    if (!prod) throw new Error('Product not found or has been deleted');

    // If variant is provided, validate variant existence and stock
    let variantDoc = null;
    if (variant) {
      variantDoc = await VariantModel.findById({ _id: variant });
      if (!variantDoc) throw new Error('Variant not found');
      if (variantDoc.productId.toString() !== product.toString()) throw new Error('Variant does not belong to product');
      if (quantity > variantDoc.stock) throw new Error('Not enough stock for this variant');
      if (price !== undefined && price !== variantDoc.price && price !== variantDoc.salePrice) throw new Error('Price mismatch for variant');
      // Inventory sync: decrement stock
      variantDoc.stock -= quantity;
      await variantDoc.save();
    } else {
      // If no variant, check product-level stock if you have such a field (not shown in Product.js)
      // Optionally, you can skip this or add a stock field to Product
    }
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    let cart = await cartRepository.addItem(userId, { product, variant, quantity, price }, conn);

    // Coupon logic
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (!coupon) throw new Error('Invalid or expired coupon');
      // Example: flat or percent discount
      let discount = 0;
      if (coupon.type === 'percent') {
        discount = cart.total * (coupon.value / 100);
      } else if (coupon.type === 'flat') {
        discount = coupon.value;
      }
      cart.total = Math.max(0, cart.total - discount);
      cart.coupon = coupon._id;
      await cart.save();
    }
    return cart;
  }


  async removeItem(userId, productId, variantId, conn) {
    // Validate product existence
    const ProductModel = conn.models.Product || conn.model('Product', productSchema);
    const VariantModel = conn.models.Variant || conn.model('Variant', variantSchema);
    const prod = await ProductModel.findById(productId);
    if (!prod) throw new Error('Product not found');
    let removedQty = 0;
    if (variantId) {
      const variantDoc = await VariantModel.findById(variantId);
      if (!variantDoc) throw new Error('Variant not found');
      if (variantDoc.productId.toString() !== productId.toString()) throw new Error('Variant does not belong to product');
      // Find cart to get quantity being removed
      const cart = await cartRepository.getCartByUser(userId, conn);
      const item = cart.items.find(i => i.product.equals(productId) && i.variant && i.variant.equals(variantId));
      removedQty = item ? item.quantity : 0;
      // Inventory sync: increment stock
      if (removedQty > 0) {
        variantDoc.stock += removedQty;
        await variantDoc.save();
      }
    }
    return cartRepository.removeItem(userId, productId, variantId, conn);
  }

  async clearCart(userId, conn) {
    // Inventory sync: restore all variant stocks
    const VariantModel = conn.models.Variant || conn.model('Variant', variantSchema);
    const cart = await cartRepository.getCartByUser(userId, conn);
    if (cart && cart.items) {
      for (const item of cart.items) {
        if (item.variant) {
          const variantDoc = await VariantModel.findById(item.variant);
          if (variantDoc) {
            variantDoc.stock += item.quantity;
            await variantDoc.save();
          }
        }
      }
    }
    return cartRepository.clearCart(userId, conn);
  }
}

const cartService = new CartService();
export default cartService;
