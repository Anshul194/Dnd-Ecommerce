import userSchema from '../models/User.js';
import mongoose from 'mongoose';
import roleSchema from '../models/role.js';
class UserRepository {
  constructor(conn) {
    this.model = conn.model('User', userSchema, 'users');
    this.roleModel = conn.model('Role', roleSchema, 'roles');
  }

  async createUser(data) {
    try {
      const user = new this.model(data);
      return await user.save();
    } catch (error) {
      console.error('UserRepo create error:', error);
      throw error;
    }
  }

  async findById(id, tenantId = null) {
    try {
      const query = { _id: id, isDeleted: false };
      if (tenantId) query.tenant = tenantId;
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
      console.error('UserRepo findByEmail error:', error);
      throw error;
    }
  }

  async getAll(filter = {}, page = 1, limit = 10) {
    try {
      const query = { ...filter, isDeleted: false };
      const skip = (page - 1) * limit;
      const users = await this.model.find(query).skip(skip).limit(limit);
      const total = await this.model.countDocuments(query);
      return { users, total, page, limit };
    } catch (error) {
      console.error('UserRepo getAll error:', error);
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      const user = await this.model.findById(id);
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
      return await this.model.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
    } catch (error) {
      console.error('UserRepo softDelete error:', error);
      throw error;
    }
  }
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
