import leadSchema from '../models/Lead.js';
import userSchema from '../models/User.js';
import roleSchema from '../models/role.js';

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

export const bulkAssignLeads = async (leadIds, assignedTo, conn) => {
  try {
    await validateStaffRole(assignedTo, conn);
    const Lead = getModel(conn, 'Lead', leadSchema);
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { assignedTo, status: 'assigned'} },
      { new: true }
    );
    console.log('Bulk assign result:', result);
    return result;
  } catch (error) {
    console.error('Error in bulkAssignLeads:', error);
    throw error;
  }
};

export const validateStaffRole = async (userId, conn) => {
  try {
    console.log('Validating staff role for user:', userId);
    const User = getModel(conn, 'User', userSchema);
    const Role = getModel(conn, 'Role', roleSchema);
    const user = await User.findById(userId).populate('role').exec();
    console.log('User found:', user ? { id: user._id, role: user.role } : 'null');
    if (!user) {
      throw new Error('Assigned user not found');
    }
    console.log('User role:', user.role);

    console.log('role name:', user.role ? user.role.name : 'undefined');
    if (!user.role || user.role.name !== 'Staff') {
      throw new Error('Assigned user must have staff role');
    }
    return true;
  } catch (error) {
    console.error('Error in validateStaffRole:', error);
    throw error;
  }
};
