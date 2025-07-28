
import cartRepository from '../repository/CartRepository';
import Product from '../models/Product';
import Variant from '../models/Variant';
// Coupon model assumed, create if not exists
import Coupon from '../models/Coupon';

class CartService {
  async getCart(userId) {
    return cartRepository.getCartByUser(userId);
  }


  async addItem(userId, { product, variant, quantity, price, couponCode }) {
    // Validate product existence
    const prod = await Product.findById(product);
    if (!prod) throw new Error('Product not found');

    // If variant is provided, validate variant existence and stock
    let variantDoc = null;
    if (variant) {
      variantDoc = await Variant.findById(variant);
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
    let cart = await cartRepository.addItem(userId, { product, variant, quantity, price });

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


  async removeItem(userId, productId, variantId) {
    // Validate product existence
    const prod = await Product.findById(productId);
    if (!prod) throw new Error('Product not found');
    let removedQty = 0;
    if (variantId) {
      const variantDoc = await Variant.findById(variantId);
      if (!variantDoc) throw new Error('Variant not found');
      if (variantDoc.productId.toString() !== productId.toString()) throw new Error('Variant does not belong to product');
      // Find cart to get quantity being removed
      const cart = await cartRepository.getCartByUser(userId);
      const item = cart.items.find(i => i.product.equals(productId) && i.variant && i.variant.equals(variantId));
      removedQty = item ? item.quantity : 0;
      // Inventory sync: increment stock
      if (removedQty > 0) {
        variantDoc.stock += removedQty;
        await variantDoc.save();
      }
    }
    return cartRepository.removeItem(userId, productId, variantId);
  }

  async clearCart(userId) {
    // Inventory sync: restore all variant stocks
    const cart = await cartRepository.getCartByUser(userId);
    if (cart && cart.items) {
      for (const item of cart.items) {
        if (item.variant) {
          const variantDoc = await Variant.findById(item.variant);
          if (variantDoc) {
            variantDoc.stock += item.quantity;
            await variantDoc.save();
          }
        }
      }
    }
    return cartRepository.clearCart(userId);
  }
}

const cartService = new CartService();
export default cartService;
