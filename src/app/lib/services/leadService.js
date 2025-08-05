import * as leadRepo from '../repository/leadRepository.js';

export const createLeadService = async (payload, conn) => {
  try {
    return await leadRepo.createLead(payload, conn); // ✅
  } catch (error) {
    console.error('Error in createLeadService:', error);
    throw error;
  }
};

export const getLeadsService = async (query, conn) => {
  try {
    return await leadRepo.getLeads(query, conn);
  } catch (error) {
    console.error('Error in getLeadsService:', error);
    throw error;
  }
};


export const updateLeadService = async (id, data, conn) => {
  try {
    return await leadRepo.updateLead(id, data, conn); // ✅
  } catch (error) {
    console.error('Error in updateLeadService:', error);
    throw error;
  }
};

export const deleteLeadService = async (id, conn) => {
  try {
    return await leadRepo.deleteLead(id, conn); // ✅
  } catch (error) {
    console.error('Error in deleteLeadService:', error);
    throw error;
  }
};


export const getLeadByIdService = async (id, conn) => {
  try {
    return await leadRepo.getLeadById(id, conn); // ✅ Fix: pass conn
  } catch (error) {
    console.error('Error in getLeadByIdService:', error);
    throw error;
  }
};

export const bulkAssignLeadsService = async (leadIds, assignedTo, conn) => {
  try {
    return await leadRepo.bulkAssignLeads(leadIds, assignedTo, conn);
  } catch (error) {
    console.error('Error in bulkAssignLeadsService:', error);
    throw error;
  }
};
