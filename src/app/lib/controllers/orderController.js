import OrderService from '../services/orderService.js';

class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  async create(req, conn) {
    console.log('Controller received create order data:', req.body);
    try {
      const result = await this.orderService.createOrder(req.body, conn);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  async check(req, conn) {
    console.log('Controller received check order data:', req.body);
    try {
      const result = await this.orderService.checkOrder(req.body, conn);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

    async getUserOrders(request, conn) {
    console.log('Controller received get user orders request');
    try {
      const result = await this.orderService.getUserOrders(request, conn);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  async getOrderDetails(request, conn, params) {
    console.log('Controller received get order details request for orderId:', params.id);
    try {
      const result = await this.orderService.getOrderDetails(request, conn, params);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}

export default OrderController;