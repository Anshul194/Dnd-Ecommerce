import mongoose from 'mongoose';
import { shippingZoneSchema } from '../models/ShippingZone.js';

class ShippingZoneRepository {
  constructor() {
    this.getShippingZoneModel = this.getShippingZoneModel.bind(this);
    this.createShippingZone = this.createShippingZone.bind(this);
    this.getShippingZoneById = this.getShippingZoneById.bind(this);
    this.getAllShippingZones = this.getAllShippingZones.bind(this);
    this.updateShippingZone = this.updateShippingZone.bind(this);
    this.deleteShippingZone = this.deleteShippingZone.bind(this);
  }

  getShippingZoneModel(conn) {
    if (!conn) {
      throw new Error('Database connection is required');
    }
    console.log('ShippingZoneRepository using connection:', conn.name || 'global mongoose');
    return conn.models.ShippingZone || conn.model('ShippingZone', shippingZoneSchema);
  }

  async createShippingZone(data, conn) {
    const ShippingZone = this.getShippingZoneModel(conn);
    const shippingZone = new ShippingZone(data);
    return await shippingZone.save();
  }

  async getShippingZoneById(id, conn) {
    const ShippingZone = this.getShippingZoneModel(conn);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid shipping zone ID');
    const shippingZone = await ShippingZone.findById(id).populate('shippingId');
    if (!shippingZone) throw new Error('Shipping zone not found');
    return shippingZone;
  }

  async getAllShippingZones(conn) {
    const ShippingZone = this.getShippingZoneModel(conn);
    return await ShippingZone.find().populate('shippingId');
  }

  async updateShippingZone(id, update, conn) {
    const ShippingZone = this.getShippingZoneModel(conn);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid shipping zone ID');
    const shippingZone = await ShippingZone.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).populate('shippingId');
    if (!shippingZone) throw new Error('Shipping zone not found');
    return shippingZone;
  }

  async deleteShippingZone(id, conn) {
    const ShippingZone = this.getShippingZoneModel(conn);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid shipping zone ID');
    const shippingZone = await ShippingZone.findByIdAndDelete(id);
    if (!shippingZone) throw new Error('Shipping zone not found');
    return shippingZone;
  }
}

export default new ShippingZoneRepository();