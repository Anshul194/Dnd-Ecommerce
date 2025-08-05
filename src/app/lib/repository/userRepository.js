import mongoose from 'mongoose';
import userSchema from '../models/User.js';
import roleSchema from '../models/role.js';
import CrudRepository from './CrudRepository.js';

class UserRepository extends CrudRepository {
  constructor(conn) {
    const userModel = conn.model('User', userSchema, 'users');
    super(userModel);
    this.roleModel = conn.model('Role', roleSchema, 'roles');
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
        { deleted: true },
        { deletedAt: new Date(), updatedAt: new Date() },
        { new: true }
      );

      if (!doc) {
        console.warn('User not found for soft delete:', id);
        return null;
      }

      console.log('Soft deleted user:', doc); // ✅ Debug log
      return doc.toObject(); // ✅ Convert to plain object
    } catch (error) {
      console.error('UserRepo softDelete error:', error?.message);
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
