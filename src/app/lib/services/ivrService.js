import IVRRepository from '../repository/ivrRepository';

class IVRService {
  constructor(conn) {
    this.conn = conn;
    this.repo = new IVRRepository(conn);
  }

  async fetchUsersFromAPI() {
    const token = process.env.MYOPERATOR_API_TOKEN;
    const url = `https://developers.myoperator.co/user?token=${token}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch users from API: ${error.message}`);
    }
  }

  async syncUsersFromAPI() {
    try {
      const apiResult = await this.fetchUsersFromAPI();
      if (apiResult.status !== 'success' || !Array.isArray(apiResult.data)) {
        throw new Error('Invalid API response');
      }
      const users = [];
      for (const apiUser of apiResult.data) {
        const userDoc = await this.repo.upsert(apiUser);
        users.push(userDoc);
      }
      return users;
    } catch (error) {
      throw new Error(`Failed to sync users: ${error.message}`);
    }
  }


  //processAfterCallData
  async processAfterCallData(body, conn) {
    try {
      // Process the after call data
      // This is a placeholder for actual processing logic
      console.log('Processing after call data:', body);

      // --- Setup repositories ---
      const userRepo = this.repo;
      // Inline LeadRepository for brevity
      const LeadModel = conn.models.Lead || conn.model('Lead', require('../models/Lead.js'));
      const CallLogModel = conn.models.CallLog || conn.model('CallLog', require('../models/CallLog.js'));

      // Helper functions for lead operations
      const findLead = async (query) => LeadModel.findOne(query);
      const createLead = async (data) => LeadModel.create(data);

      const caller = body._cl;
      const callerRaw = body._cr;
      const callId = body._ci;
      const callDuration = body._dr;
      const durationMs = body._ss;
      const recordingUrl = body._fu;
      const callStatus = body._ld?.[0]?._ds || "UNKNOWN";
      const disposition = body._ld?.[0]?._ac || null;

      // Agent info from webhook
      const agentData = body._ld?.[0]?._rr?.[0] || {};
      const agentName = agentData._na || null;
      const agentNumber = agentData._nr || null;
      const agentId = agentData._id || null; // MyOperator's agent ID

      let agent = null;

      // Use repository for user lookup
      if (agentId) {
        agent = await userRepo.UserModel.findOne({ ivrUuid: agentId });
      }
      if (!agent && agentNumber) {
        agent = await userRepo.UserModel.findOne({ phone: agentNumber });
      }

      let lead = await findLead({ phone: caller });
      if (!lead) {
        lead = await createLead({
          phone: caller,
          rawPhone: callerRaw,
          source: "IVR",
          status: "new",
          assignedTo: agent ? agent._id : null,
          lastContactedAt: new Date(),
          nextFollowUpAt: null,
          followUpCount: 0,
        });
      } else {
        lead.lastCallStatus = callStatus;
        lead.lastContactedAt = new Date();
        if (agent) lead.assignedTo = agent._id; // Update assignment
        await lead.save();
      }

      await CallLogModel.create({
        leadId: lead._id,
        callId,
        caller,
        duration: callDuration,
        durationMs,
        status: callStatus,
        disposition,
        recordingUrl,
        agent: agent ? agent._id : null,
        agentName,
        agentNumber,
      });
      // You can add your business logic here
      console.log('After call data processed successfully');
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to process after call data: ${error.message}`);
    }
  }

  async getAllUsers(query = {}) {
    try {
      return await this.repo.getAll(query);
    } catch (error) {
      throw new Error(`Failed to get all users: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      return await this.repo.getById(id);
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }
  }

  async updateUser(id, data) {
    try {
      return await this.repo.update(id, data);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      return await this.repo.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export default IVRService;
