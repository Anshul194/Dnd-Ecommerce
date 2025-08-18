import shippingZoneRepository from '../repository/ShippingZoneRepository.js';
import mongoose from 'mongoose';
import { ShippingModel } from '../models/Shipping.js';

class ShippingZoneService {
  async createShippingZone(data, conn) {
    console.log('[ShippingZoneService.createShippingZone] Creating shipping zone:', JSON.stringify(data, null, 2), 'Connection:', conn.name || 'global mongoose');
    await this.validateShippingZoneData(data, false, conn);
    return await shippingZoneRepository.createShippingZone(data, conn);
  }

  async getShippingZoneById(id, conn) {
    console.log('[ShippingZoneService.getShippingZoneById] Fetching shipping zone:', id, 'Connection:', conn.name || 'global mongoose');
    return await shippingZoneRepository.getShippingZoneById(id, conn);
  }

  async getAllShippingZones(conn, { page = 1, limit = 10, search = '' }) {
    console.log('[ShippingZoneService.getAllShippingZones] Fetching all shipping zones', 'Connection:', conn.name || 'global mongoose', 'Page:', page, 'Limit:', limit, 'Search:', search);
    
    const query = {};
    if (search) {
      query.postalCodes = { $regex: search, $options: 'i' }; // Case-insensitive search on postalCodes
    }

    const ShippingZone = conn.models.ShippingZone || conn.model('ShippingZone', mongoose.model('ShippingZone').schema);
    
    const skip = (page - 1) * limit;
    const [shippingZones, totalItems] = await Promise.all([
      ShippingZone.find(query)
        .populate('shippingId')
        .skip(skip)
        .limit(limit)
        .lean(),
      ShippingZone.countDocuments(query),
    ]);

    return {
      shippingZones,
      totalItems,
      currentPage: Number(page),
      itemsPerPage: Number(limit),
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async updateShippingZone(id, data, conn) {
    console.log('[ShippingZoneService.updateShippingZone] Updating shipping zone:', id, 'Data:', JSON.stringify(data, null, 2), 'Connection:', conn.name || 'global mongoose');
    await this.validateShippingZoneData(data, true, conn);
    return await shippingZoneRepository.updateShippingZone(id, data, conn);
  }

  async deleteShippingZone(id, conn) {
    console.log('[ShippingZoneService.deleteShippingZone] Deleting shipping zone:', id, 'Connection:', conn.name || 'global mongoose');
    return await shippingZoneRepository.deleteShippingZone(id, conn);
  }

  async validateShippingZoneData(data, isUpdate = false, conn) {
    if (!isUpdate) {
      if (!data.shippingId || !mongoose.Types.ObjectId.isValid(data.shippingId)) {
        throw new Error('Valid shipping ID is required');
      }
      if (!data.postalCodes || !Array.isArray(data.postalCodes) || data.postalCodes.length === 0) {
        throw new Error('At least one postal code is required');
      }
    } else {
      if (data.shippingId && !mongoose.Types.ObjectId.isValid(data.shippingId)) {
        throw new Error('Valid shipping ID is required');
      }
      if (data.postalCodes && (!Array.isArray(data.postalCodes) || data.postalCodes.length === 0)) {
        throw new Error('At least one postal code is required if updating postal codes');
      }
    }

    // Check if shippingId exists in the Shipping collection
    if (data.shippingId) {
      const Shipping = conn.models.Shipping || conn.model('Shipping', mongoose.model('Shipping').schema);
      const shipping = await Shipping.findById(data.shippingId);
      if (!shipping) {
        throw new Error('Shipping ID does not exist');
      }
    }
  }
}

const shippingZoneService = new ShippingZoneService();
export default shippingZoneService;