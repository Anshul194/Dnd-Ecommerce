import mongoose from 'mongoose';
import { shippingSchema } from '../models/Shipping.js';

class ShippingRepository {
  constructor() {
    this.getShippingModel = this.getShippingModel.bind(this);
    this.createShipping = this.createShipping.bind(this);
    this.getShippingById = this.getShippingById.bind(this);
    this.getAllShipping = this.getAllShipping.bind(this);
    this.updateShipping = this.updateShipping.bind(this);
    this.deleteShipping = this.deleteShipping.bind(this);
  }

  getShippingModel(conn) {
    if (!conn) {
      throw new Error('Database connection is required');
    }
    console.log('ShippingRepository using connection:', conn.name || 'global mongoose');
    return conn.models.Shipping || conn.model('Shipping', shippingSchema);
  }

  async createShipping(data, conn) {
    const Shipping = this.getShippingModel(conn);
    const shipping = new Shipping(data);
    return await shipping.save();
  }

  async getShippingById(id, conn) {
    const Shipping = this.getShippingModel(conn);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid shipping ID');
    const shipping = await Shipping.findOne({ _id: id, deletedAt: null });
    if (!shipping) throw new Error('Shipping method not found or has been deleted');
    return shipping;
  }

  async getAllShipping(conn) {
    const Shipping = this.getShippingModel(conn);
    return await Shipping.find({ deletedAt: null, status: 'active' });
  }

  async updateShipping(id, update, conn) {
    console.log("Updating shipping method:", id, update);
    const Shipping = this.getShippingModel(conn);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid shipping ID');
    const shipping = await Shipping.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: update },
      { new: true }
    );
    if (!shipping) throw new Error('Shipping method not found or has been deleted');
    return shipping;
  }

  async deleteShipping(id, conn) {
    const Shipping = this.getShippingModel(conn);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid shipping ID');
    const shipping = await Shipping.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date(), status: 'inactive' } },
      { new: true }
    );
    if (!shipping) throw new Error('Shipping method not found or has been deleted');
    return shipping;
  }
}

export default new ShippingRepository();