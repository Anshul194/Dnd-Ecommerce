import mongoose from 'mongoose';

class DashboardService {
  constructor(orderService, ticketService) {
    this.orderService = orderService;
    this.ticketService = ticketService;
  }

  async getDashboardMetrics(conn) {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Fetch recent 5 orders
      const recentOrders = await this.orderService.getRecentOrders(conn);

      // Calculate income for different periods
      const todayIncome = await this.orderService.calculateIncome({ createdAt: { $gte: startOfToday } }, conn);
      const weekIncome = await this.orderService.calculateIncome({ createdAt: { $gte: startOfWeek } }, conn);
      const monthIncome = await this.orderService.calculateIncome({ createdAt: { $gte: startOfMonth } }, conn);
      const yearIncome = await this.orderService.calculateIncome({ createdAt: { $gte: startOfYear } }, conn);

      // Fetch recent 5 tickets
      const recentTickets = await this.ticketService.getRecentTickets(conn);

      return {
        recentOrders,
        income: {
          today: todayIncome,
          week: weekIncome,
          month: monthIncome,
          year: yearIncome
        },
        recentTickets
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }
  }
}

export default DashboardService;
