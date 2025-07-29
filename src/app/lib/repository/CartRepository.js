import { cartSchema } from '../models/Cart';

class CartRepository {
  getCartModel(conn) {
    return conn.models.Cart || conn.model('Cart', cartSchema);
  }

  async getCartByUser(userId, conn) {
    const Cart = this.getCartModel(conn);
    return Cart.findOne({ user: userId }).populate('items.product').populate('items.variant');
  }

  async createCart(userId, conn) {
    const Cart = this.getCartModel(conn);
    return Cart.create({ user: userId, items: [] });
  }

  async updateCart(userId, update, conn) {
    const Cart = this.getCartModel(conn);
    return Cart.findOneAndUpdate({ user: userId }, update, { new: true });
  }

  async addItem(userId, item, conn) {
    let cart = await this.getCartByUser(userId, conn);
    if (!cart) cart = await this.createCart(userId, conn);
    const existingItem = cart.items.find(i => i.product.equals(item.product) && (!item.variant || (i.variant && i.variant.equals(item.variant))));
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.price = item.price;
    } else {
      cart.items.push(item);
    }
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    return cart;
  }

  async removeItem(userId, productId, variantId, conn) {
    const cart = await this.getCartByUser(userId, conn);
    if (!cart) return null;
    cart.items = cart.items.filter(i => !(i.product.equals(productId) && (!variantId || (i.variant && i.variant.equals(variantId)))));
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    return cart;
  }

  async clearCart(userId, conn) {
    return this.updateCart(userId, { items: [], total: 0 }, conn);
  }
}

const cartRepository = new CartRepository();
export default cartRepository;
