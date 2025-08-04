import mongoose from 'mongoose';
import userSchema from '../models/User.js';
import roleSchema from '../models/role.js';

class UserRepository {
  constructor(conn) {
    this.model = conn.models.User || conn.model('User', userSchema, 'users');
    this.roleModel = conn.models.Role || conn.model('Role', roleSchema, 'roles');
  }

  async createUser(data) {
    try {
      const user = new this.model(data);
      return await user.save();
    } catch (error) {
      console.error('UserRepo createUser error:', error);
      throw error;
    }
  }

  async findById(id, tenantId = null) {
    try {
      const query = { _id: id, isDeleted: false };
      if (tenantId) {
        query.tenant = new mongoose.Types.ObjectId(tenantId);
      }

      console.log('UserRepo findById called with:', query); // ✅ Debug log
      return await this.model.findOne(query);
    } catch (error) {
      console.error('UserRepo findById error:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await this.model.findOne({ email, isDeleted: false });
    } catch (error) {
      console.error('UserRepo findByEmail error:', error?.message);
      throw error;
    }
  }

  async getAll(filter = {}, page = 1, limit = 10) {
    try {
      const query = { ...filter, isDeleted: false };

      // Convert role name to ID if needed
      if (query.role) {
        if (mongoose.Types.ObjectId.isValid(query.role)) {
          query.role = new mongoose.Types.ObjectId(query.role);
        } else {
          const roleDoc = await this.roleModel.findOne({ name: query.role, isDeleted: false });
          if (roleDoc) {
            query.role = roleDoc._id;
          } else {
            return { users: [], total: 0, page, limit };
          }
        }
      }

      const skip = (page - 1) * limit;
      const users = await this.model.find(query).skip(skip).limit(limit).populate('role');
      const total = await this.model.countDocuments(query);

      return { users, total, page, limit };
    } catch (error) {
      console.error('UserRepo getAll error:', error);
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      console.log('UserRepo updateUser called with:', { id, data }); // ✅ Debug log
      const user = await this.model.findById(id);
      console.log('User found:', user); // ✅ Debug log

      if (!user || user.isDeleted) return null;

      user.set(data);
      return await user.save();
    } catch (error) {
      console.error('UserRepo updateUser error:', error);
      throw error;
    }
  }

  async softDelete(id) {
    try {
      // ✅ Use `$set` to ensure both fields are updated properly
      const doc = await this.model.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true, isActive: false } },
        { new: true }
      );

      if (!doc) {
        console.warn('User not found for soft delete:', id);
        return null;
      }

      console.log('Soft deleted user:', doc); // ✅ Debug log
      return doc.toObject(); // ✅ Convert to plain object
    } catch (error) {
      console.error('UserRepo softDelete error:', error);
      throw error;
    }
  }

  // ✅ Find role by ID (skips deleted roles)
  async findRoleById(roleId) {
    try {
      return await this.roleModel.findOne({ _id: roleId, isDeleted: false });
    } catch (error) {
      console.error('UserRepo findRoleById error:', error);
      throw error;
    }
  }
}

export default UserRepository;
