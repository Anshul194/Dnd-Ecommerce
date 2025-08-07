import mongoose from 'mongoose';
import { wishlistSchema } from '../models/Wishlist.js';

class WishlistRepository {
  constructor() {
    this.getWishlistModel = this.getWishlistModel.bind(this);
    this.getWishlistByUser = this.getWishlistByUser.bind(this);
    this.getWishlistById = this.getWishlistById.bind(this);
    this.createWishlist = this.createWishlist.bind(this);
    this.updateWishlist = this.updateWishlist.bind(this);
    this.updateWishlistById = this.updateWishlistById.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.clearWishlist = this.clearWishlist.bind(this);
  }

  getWishlistModel(conn) {
    if (!conn) {
      throw new Error('Database connection is required');
    }
    console.log('WishlistRepository using connection:', conn.name || 'global mongoose');
    return conn.models.Wishlist || conn.model('Wishlist', wishlistSchema);
  }

  async getWishlistByUser(userId, conn) {
    console.log('Fetching wishlist for user:', userId, 'Connection:', conn.name || 'global mongoose');
    const Wishlist = this.getWishlistModel(conn);
    if (!userId) throw new Error('User ID is required to fetch wishlist');
    return Wishlist.findOne({ user: userId }).populate('items.product').populate('items.variant');
  }

  async getWishlistById(wishlistId, userId, conn) {
    console.log('Fetching wishlist by ID:', wishlistId, 'for user:', userId, 'Connection:', conn.name || 'global mongoose');
    const Wishlist = this.getWishlistModel(conn);
    if (!mongoose.Types.ObjectId.isValid(wishlistId)) throw new Error('Invalid wishlist ID');
    const wishlist = await Wishlist.findOne({ _id: wishlistId, user: userId }).populate('items.product').populate('items.variant');
    if (!wishlist) throw new Error('Wishlist not found or does not belong to user');
    return wishlist;
  }

  async createWishlist(userId, conn) {
    const Wishlist = this.getWishlistModel(conn);
    return Wishlist.create({ user: userId, items: [] });
  }

  async updateWishlist(userId, update, conn) {
    const Wishlist = this.getWishlistModel(conn);
    return Wishlist.findOneAndUpdate({ user: userId }, update, { new: true });
  }

  async updateWishlistById(wishlistId, userId, update, conn) {
    console.log('Updating wishlist by ID:', wishlistId, 'for user:', userId, 'Connection:', conn.name || 'global mongoose');
    const Wishlist = this.getWishlistModel(conn);
    if (!mongoose.Types.ObjectId.isValid(wishlistId)) throw new Error('Invalid wishlist ID');
    const wishlist = await Wishlist.findOneAndUpdate(
      { _id: wishlistId, user: userId },
      update,
      { new: true }
    ).populate('items.product').populate('items.variant');
    if (!wishlist) throw new Error('Wishlist not found or does not belong to user');
    return wishlist;
  }

  async addItem(userId, item, conn) {
    let wishlist = await this.getWishlistByUser(userId, conn);
    if (!wishlist) wishlist = await this.createWishlist(userId, conn);
    const existingItem = wishlist.items.find(i => i.product.equals(item.product) && (!item.variant || (i.variant && i.variant.equals(item.variant))));
    if (!existingItem) {
      wishlist.items.push(item);
    }
    await wishlist.save();
    return wishlist;
  }

  async removeItem(userId, productId, variantId, conn) {
    const wishlist = await this.getWishlistByUser(userId, conn);
    if (!wishlist) return null;
    wishlist.items = wishlist.items.filter(i => !(i.product.equals(productId) && (!variantId || (i.variant && i.variant.equals(variantId)))));
    await wishlist.save();
    return wishlist;
  }

  async clearWishlist(userId, conn) {
    return this.updateWishlist(userId, { items: [] }, conn);
  }
}

export default new WishlistRepository();