import mongoose from 'mongoose';
import CallLogSchema from '../models/CallLog.js';
import leadSchema from '../models/Lead.js';
import userSchema from '../models/User.js'; // Placeholder for User schema

class CallLogRepository {
  constructor() {
    this.getCallLogModel = this.getCallLogModel.bind(this);
    this.getAllCallLogs = this.getAllCallLogs.bind(this);
  }

  getCallLogModel(conn) {
    if (!conn) {
      throw new Error('Database connection is required');
    }
    console.log('CallLogRepository using connection:', conn.name || 'global mongoose');
    // Clear cached models for this connection to ensure updated schemas are used
    delete conn.models.CallLog;
    delete conn.models.Lead;
    delete conn.models.User;
    // Register Lead and User models to avoid "Schema hasn't been registered" error
    conn.model('Lead', leadSchema);
    conn.model('User', userSchema);
    return conn.models.CallLog || conn.model('CallLog', CallLogSchema);
  }

  async getAllCallLogs(conn, { page, limit, search }) {
    const CallLog = this.getCallLogModel(conn);
    const query = search
      ? {
          $or: [
            { caller: { $regex: search, $options: 'i' } },
            { agentName: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const skip = (page - 1) * limit;
    const [callLogs, totalItems] = await Promise.all([
      CallLog.find(query)
        .populate('agent leadId')
        .skip(skip)
        .limit(limit)
        .lean(),
      CallLog.countDocuments(query),
    ]);

    return {
      callLogs,
      totalItems,
      currentPage: Number(page),
      itemsPerPage: Number(limit),
      totalPages: Math.ceil(totalItems / limit),
    };
  }
}

export default new CallLogRepository();