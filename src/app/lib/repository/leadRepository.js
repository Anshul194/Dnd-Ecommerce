import leadSchema from '../models/Lead.js';
import userSchema from '../models/User.js';

const getModel = (conn, name, schema) => {
  return conn.models[name] || conn.model(name, schema);
};

// ✅ Create
export const createLead = async (data, conn) => {
  try {
    const Lead = getModel(conn, 'Lead', leadSchema);
    return await Lead.create(data);
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};

// ✅ Read All
export const getLeads = async (conn) => {
  try {
    const Lead = getModel(conn, 'Lead', leadSchema);
    const User = getModel(conn, 'User', userSchema);
    return await Lead.find()
      .populate('assignedTo')
      .populate('convertedTo')
      .populate('notes.createdBy')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getLeads:', error);
    throw error;
  }
};

// ✅ Read by ID
export const getLeadById = async (id, conn) => {
  try {
    const Lead = getModel(conn, 'Lead', leadSchema);
    const User = getModel(conn, 'User', userSchema);
    return await Lead.findById(id)
      .populate('assignedTo')
      .populate('convertedTo')
      .populate('notes.createdBy');
  } catch (error) {
    console.error('Error in getLeadById:', error);
    throw error;
  }
};

// ✅ Update
export const updateLead = async (id, data, conn) => {
  try {
    const Lead = getModel(conn, 'Lead', leadSchema);
    return await Lead.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    console.error('Error in updateLead:', error);
    throw error;
  }
};

// ✅ Delete
export const deleteLead = async (id, conn) => {
  try {
    const Lead = getModel(conn, 'Lead', leadSchema);
    return await Lead.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error in deleteLead:', error);
    throw error;
  }
};
