import { cartSchema } from '../models/Cart';
import { orderSchema } from '../models/Order';

class OrderRepository {
  
    getOrderModel(conn) {
        if (!conn) {
            throw new Error('Database connection is required');
        }
        return conn.models.Order || conn.model('Order', orderSchema);
    }

    //placeOrder
    async placeOrder(orderData, Order, conn) {
        const OrderModel = this.getOrderModel(conn);
        const order = new OrderModel(orderData);
        return await order.save();
    }
    //findOrderById
    async findOrderById(orderId, conn) {
        const OrderModel = this.getOrderModel(conn);
        return await OrderModel.findById(orderId).populate('items.product').populate('items.variant');
    }

    //findOrdersByUserId
    async findOrdersByUserId(userId, conn) {
        const OrderModel = this.getOrderModel(conn);
        return await OrderModel.find({ userId }).populate('items.product').populate('items.variant');
    }

}



const orderRepository = new OrderRepository();
export default orderRepository; 