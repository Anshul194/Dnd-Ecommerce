import Cart from '../models/Cart';

class CartRepository {
  async getCartByUser(userId) {
    return Cart.findOne({ user: userId }).populate('items.product').populate('items.variant');
  }

  async createCart(userId) {
    return Cart.create({ user: userId, items: [] });
  }

  async updateCart(userId, update) {
    return Cart.findOneAndUpdate({ user: userId }, update, { new: true });
  }

  async addItem(userId, item) {
    const cart = await this.getCartByUser(userId) || await this.createCart(userId);
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

  async removeItem(userId, productId, variantId) {
    const cart = await this.getCartByUser(userId);
    if (!cart) return null;
    cart.items = cart.items.filter(i => !(i.product.equals(productId) && (!variantId || (i.variant && i.variant.equals(variantId)))));
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    return cart;
  }

  async clearCart(userId) {
    return this.updateCart(userId, { items: [], total: 0 });
  }
}

const cartRepository = new CartRepository();
export default cartRepository;
