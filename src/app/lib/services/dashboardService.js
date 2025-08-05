import UserRepository from '../repository/userRepository.js';
import OrderRepository from '../repository/OrderRepository.js';
import TicketRepository from '../repository/ticketRepository.js';

class DashboardService {
  constructor(userRepository, orderRepository, ticketRepository) {
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
    this.ticketRepository = ticketRepository;
  }

  async getDashboardData(conn) {
    try {
      // Calculate date ranges
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of Monday
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Fetch dashboard data
      const totalUsers = await this.userRepository.getTotalUsers();
      const totalOrders = await this.orderRepository.getTotalOrders();
      const monthlyIncome = await this.orderRepository.getIncomeByPeriod(startOfMonth, endOfToday);
      const yearlyIncome = await this.orderRepository.getIncomeByPeriod(startOfYear, endOfToday);
      const weeklyIncome = await this.orderRepository.getIncomeByPeriod(startOfWeek, endOfToday);
      const todayIncome = await this.orderRepository.getIncomeByPeriod(startOfToday, endOfToday);
      const todayOrders = await this.orderRepository.getTodayOrders(['items.product', 'items.variant', 'coupon']);
      const firstFiveTickets = await this.ticketRepository.getFirstFiveTickets(['customer', 'assignedTo', 'replies.repliedBy']);
      const latestFiveTickets = await this.ticketRepository.getLatestFiveTickets(['customer', 'assignedTo', 'replies.repliedBy']);

      return {
        success: true,
        message: 'Dashboard data fetched successfully',
        data: {
          totalUsers,
          totalOrders,
          monthlyIncome,
          yearlyIncome,
          weeklyIncome,
          todayIncome,
          todayOrders,
          firstFiveTickets,
          latestFiveTickets
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}

export default DashboardService;