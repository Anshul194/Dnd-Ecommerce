import OrderService from "../services/orderService.js";

class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  async create(req, conn, tenant) {
    console.log("Controller received create order data:", req.body);
    console.log("Controller tenant:", tenant);
    try {
      const result = await this.orderService.createOrder(
        req.body,
        conn,
        tenant
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async check(req, conn, tenant) {
    console.log("Controller tenant:", tenant);
    try {
      const result = await this.orderService.checkOrder(req.body, conn, tenant);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getUserOrders(request, conn) {
    console.log("Controller received get user orders request");
    try {
      const result = await this.orderService.getUserOrders(request, conn);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getOrderDetails(request, conn, params) {
    // console.log(
    //   "Controller received get order details request for orderId:",
    //   params.id
    // );
    try {
      const result = await this.orderService.getOrderDetails(
        request,
        conn,
        params
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getAllOrders(request, conn) {
    console.log("Controller received get all orders request");
    try {
      const result = await this.orderService.getAllOrders(request, conn);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  //serviceList

  async serviceList({ body }, conn, tenant) {
    console.log("Controller received service list request with body:", body);
    const { orderId } = body;

    // Fetch order from DB
    const order = await this.orderService.getOrderById(orderId);
    console.log("Order fetched in controller:", order);
    if (!order) return { success: false, message: "Order not found" };
    // console.log('F
    // etched order:', order);
    const services = await this.orderService.getServiceOptions(order, conn);

    return { success: true, orderId, services };
  }

  async createShipment({ body }) {
    const { orderId, courier, serviceCode } = body;
    if (!orderId || !courier || !serviceCode)
      return { success: false, message: "Missing data" };

    const order = await this.orderService.getOrderById(orderId);
    if (!order) return { success: false, message: "Order not found" };

    const shipmentResp = await this.orderService.createShipment(
      order,
      courier,
      serviceCode
    );

    return {
      success: true,
      orderId,
      courier,
      response: shipmentResp.response,
    };
  }
}

export default OrderController;
