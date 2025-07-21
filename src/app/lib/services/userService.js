import UserRepository from '../repository/userRepository.js';
import TenantRepository from '../repository/tenantRepository.js';
import mongoose from 'mongoose';
import RoleRepository from '../repository/roleRepository.js';

class UserService {
  constructor() {
    this.userRepo = new UserRepository();
    this.tenantRepo = new TenantRepository();
    this.roleRepo = new RoleRepository(); // Assuming roleRepo is also a UserRepository, adjust if needed
  }

  // Create
  async createUser(data) {
    try {
      // Validate data
      if (!data.name || !data.email || !data.passwordHash) {
        throw new Error('Name, email, and password are required');
      }
      // Check if user already exists
      const existingUser = await this.userRepo.findByEmail(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      // valida role id and tenant id if provided
      if (data.role && !mongoose.Types.ObjectId.isValid(data.role)) {
        throw new Error('Invalid role ID');
      }
      if (data.tenant && !mongoose.Types.ObjectId.isValid(data.tenant)) {
        throw new Error('Invalid tenant ID');
      }

      if(data?.tenant) {
        var tenant = await this.tenantRepo.findByTenantId(data.tenant);
        if (!tenant) {
          throw new Error('Tenant not found');
        }
      }

      //check role belongs to that tenant only and role and tenant belong in db
      if (data.role && data.tenant) {
        const role = await this.roleRepo.findById({ _id: data.role });
        console.log('dftgyuhji', role);
        if (!role || role.tenantId.toString() !== data.tenant) {
          console.error('Role does not belong to the specified tenant');
          throw new Error('Role does not belong to the specified tenant');
        }
      }

      console.log('Creating user with data:', data);

      return await this.userRepo.createUser(data);
    } catch (error) {
      console.error('UserService createUser error:', error?.message);
      throw error;
    }
  }

  // Read all
  async getAllUsers(query = {}) {
    try {
      const pageNum = query.page ? parseInt(query.page, 10) : 1;
      const limitNum = query.limit ? parseInt(query.limit, 10) : 10;
      const filter = { ...query };
      delete filter.page;
      delete filter.limit;
      filter.isDeleted = false;
      return await this.userRepo.getAll(filter, pageNum, limitNum);
    } catch (error) {
      throw error; // Rethrow the original error
    }
  }

  // Read one
  async getUserById(id) {
    try {
      return await this.userRepo.findById(id);
    } catch (error) {
      throw error; // Rethrow the original error
    }
  }

  // Find by email
  async findByEmail(email) {
    try {
      return await this.userRepo.findByEmail(email);
    } catch (error) {
      throw error; // Rethrow the original error
    }
  }

  // Update
  async updateUser(id, data) {
    try {
      return await this.userRepo.updateUser(id, data);
    } catch (error) {
      throw error; // Rethrow the original error
    }
  }

  // Delete (soft)
  async deleteUser(id) {
    try {
      return await this.userRepo.softDelete(id);
    } catch (error) {
      throw error; // Rethrow the original error
    }
  }


  // Additional methods can be added as needed
  async findRoleById(roleId) {
    try {
      return await this.userRepo.findRoleById(roleId);
    } catch (error) {
      throw error; // Rethrow the original error
    }
  }
}

export default UserService;
