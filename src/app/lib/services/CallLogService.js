import callLogRepository from '../repository/CallLogRepository.js';

class CallLogService {
  async getAllCallLogs(conn, { page = 1, limit = 10, search = '' }) {
    console.log('[CallLogService.getAllCallLogs] Fetching all call logs', 'Connection:', conn.name || 'global mongoose', 'Page:', page, 'Limit:', limit, 'Search:', search);
    return await callLogRepository.getAllCallLogs(conn, { page, limit, search });
  }
}

const callLogService = new CallLogService();
export default callLogService;