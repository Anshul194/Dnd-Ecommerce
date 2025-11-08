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
        console.log("Controller received check order data:", req.body);
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
        // console.log("Order fetched in controller for shipment:", order);
        if (!order) return { success: false, message: "Order not found" };

        const shipmentResp = await this.orderService.createShipment(
            order.data,
            courier,
            serviceCode
        );

        return {
            success: true,
            orderId,
            courier,
            response: shipmentResp.data,
        };
    }

    //generateLabel
    async generateLabel({ body }) {
        const { orderId, courier } = body;

        if (courier === 'dtdc') {
            if (!body.labelCode) {
                return { success: false, message: "Missing label code" };
            }
        }

        if (!orderId || !courier)
            return { success: false, message: "Missing data" };

        const order = await this.orderService.getOrderById(orderId);
        // console.log("Order fetched in controller for label generation:", order);
        if (!order) return { success: false, message: "Order not found" };

        const labelResp = await this.orderService.generateLabel(
            order.data,
            courier,
            body
        );
        return {
            success: true,
            orderId,
            courier,
            response: labelResp,
        };
    }


    //trackShipment
    async trackShipment(req, conn, tenant) {

        try {



            //fetch all orders for tracking
            const orders = await this.orderService.getAllOrdersForTracking(req, conn, tenant);
            // console.log("Orders fetched for tracking:", orders);

            if (!orders.data || orders.data.length === 0) {
                return { success: false, message: "No orders found for tracking" };
            }

            for (const orderRecord of orders.data) {
              const orderId = orderRecord._id;
              // console.log("Processing order for tracking:", orderId);
              if (!orderRecord || !orderRecord.shipping_details) {
                //console.log(`No shipping details for Order ID: ${orderId}, skipping...`);
                continue;
              }
                const trackingNumber = orderRecord.shipping_details.reference_number;
                console.log(`Processing tracking for Order ID: ${orderId}, Tracking Number: ${trackingNumber}`);
                if (orderId && trackingNumber) {
                    console.log(`Tracking shipment for Order ID: ${orderId}, Tracking Number: ${trackingNumber}`);
                    const order = await this.orderService.getOrderById(orderId);
                    if (!order) return { success: false, message: "Order not found" };
                    await this.orderService.trackShipment(
                        order.data,
                        trackingNumber,
                    );

                    console.log(`Tracking updated for Order ID: ${orderId}`);
                   
                }

                console.log(`Missing orderId or trackingNumber for Order ID: ${orderId}, skipping...`);
                continue;
            }
            return {
                success: true,
                message: "Shipment tracking completed for all orders",
                data: orders.data,
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
}


export default OrderController;