import cartService from '../services/CartService';

class CartController {
  async getCart(req, res) {
    try {
      const userId = req.user._id;
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async addItem(req, res) {
    try {
      const userId = req.user._id;
      const { product, variant, quantity, price } = req.body;
      const cart = await cartService.addItem(userId, { product, variant, quantity, price });
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async removeItem(req, res) {
    try {
      const userId = req.user._id;
      const { productId, variantId } = req.body;
      const cart = await cartService.removeItem(userId, productId, variantId);
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user._id;
      const cart = await cartService.clearCart(userId);
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

const cartController = new CartController();
export default cartController;
