import shippingService from '../services/ShippingService.js';
import { NextResponse } from 'next/server';

class ShippingController {
  async createShipping(req, _res, body, conn) {
    try {
      const userId = req.user._id;
      console.log('[ShippingController.createShipping] Creating shipping for user:', userId, 'Body:', JSON.stringify(body, null, 2), 'Connection:', conn.name || 'global mongoose');
      // Assume only admins can create shipping methods
     
      const shipping = await shippingService.createShipping(body, conn);
      return NextResponse.json({ status:'success', message: 'Shipping method created successfully', shipping }, { status: 201 });
    } catch (err) {
      console.error('[ShippingController.createShipping] Error:', err.message, err.stack);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  async getShippingById(req, _res, id, conn) {
    try {
      console.log('[ShippingController.getShippingById] Fetching shipping:', id, 'Connection:', conn.name || 'global mongoose');
      const shipping = await shippingService.getShippingById(id, conn);
      return NextResponse.json({ message: 'Shipping method fetch successfully', shipping }, { status: 200 });
      
    } catch (err) {
      console.error('[ShippingController.getShippingById] Error:', err.message, err.stack);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  async getAllShipping(req, _res, conn) {
    try {
      console.log('[ShippingController.getAllShipping] Fetching all shipping methods', 'Connection:', conn.name || 'global mongoose');
      const shippingMethods = await shippingService.getAllShipping(conn);
      return NextResponse.json({status:'success', message: 'Shipping method fetch successfully', shippingMethods }, { status: 200 });
    } catch (err) {
      console.error('[ShippingController.getAllShipping] Error:', err.message, err.stack);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  async updateShipping(req, _res, body, id, conn) {
    try {
      const userId = req.user._id;
      console.log('[ShippingController.updateShipping] Updating shipping:', id, 'for user:', userId, 'Body:', JSON.stringify(body, null, 2), 'Connection:', conn.name || 'global mongoose');
      // if (!req.user.isSuperAdmin && req.user.role !== 'admin') {
      //   return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
      // }
      const shipping = await shippingService.updateShipping(id, body, conn);
      return NextResponse.json({ message: 'Shipping method updated successfully', shipping });
    } catch (err) {
      console.error('[ShippingController.updateShipping] Error:', err.message, err.stack);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  async deleteShipping(req, _res, id, conn) {
    try {
      const userId = req.user._id;
      console.log('[ShippingController.deleteShipping] Deleting shipping:', id, 'for user:', userId, 'Connection:', conn.name || 'global mongoose');
      
      const shipping = await shippingService.deleteShipping(id, conn);
      return NextResponse.json({ message: 'Shipping method deleted successfully', shipping });
    } catch (err) {
      console.error('[ShippingController.deleteShipping] Error:', err.message, err.stack);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }
}

const shippingController = new ShippingController();
export default shippingController;