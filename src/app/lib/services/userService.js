import UserRepository from '../repository/userRepository.js';
import TenantRepository from '../repository/tenantRepository.js';
import mongoose from 'mongoose';
import RoleRepository from '../repository/roleRepository.js';
import { file } from 'googleapis/build/src/apis/file/index.js';

class UserService {
  constructor(conn) {
    this.userRepo = new UserRepository(conn);
    this.tenantRepo = new TenantRepository(conn);
    this.roleRepo = new RoleRepository(conn); // Assuming roleRepo is also a UserRepository, adjust if needed
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
      // If tenant is provided, verify it exists
      let tenant = null;
      if (data.tenant) {
        tenant = await this.tenantRepo.findByTenantId(data.tenant);
        if (!tenant) {
          throw new Error('Tenant not found');
        }
      }   
      // If role is provided, verify role exists and matches tenant if applicable
      if (data.role) {
        const role = await this.roleRepo.findById({ _id: data.role });   
        if (!role) {
          throw new Error('Role not found');
        }   
        // If the role is tenant-scoped, ensure it belongs to the correct tenant
        if (role.scope === 'tenant') {
          if (!role.tenantId || role.tenantId.toString() !== data.tenant) {
            throw new Error('Tenant-scoped role does not belong to the specified tenant');
          }
        }   
        // If role is global, tenant may be optional
      }   
      console.log('Creating user with data:', data);   
      // Create user in DB
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
      
      // Only add deleted filter if not explicitly requesting all users
      if (!query.includeDeleted) {
        // Try different approaches for deleted filter
        filter.deleted = { $in: [false, null, undefined] }; // Match false, null, or undefined
        // Alternative approach: filter.deleted = { $ne: true }; // Not equal to true
      }

      delete filter.page;
      delete filter.limit;
      delete filter.includeDeleted;
      
      // Use CrudRepository's getAll method
      const result = await this.userRepo.getAll(filter, {}, pageNum, limitNum);
      
      // Transform the response to match expected format
      return {
        users: result.result,
        total: result.totalDocuments,
        page: result.currentPage,
        totalPages: result.totalPages,
        limit: limitNum
      };
    } catch (error) {
      throw error; // Rethrow the original error
    }
  }

  // Read one
async getUserById(id) {
  return await this.userRepo.findById(id);
}

async findById(id) {
  return await this.userRepo.findById(id);
}



  // Find by email
  async findByEmail(email) {
    try {
      return await this.userRepo.findByEmail(email);
    } catch (error) {
      console.error('UserService findByEmail error:', error?.message);
      throw error; // Rethrow the original error
    }
  }

  // Update
  // async updateUser(id, data) {
  //   try {
  //     console.log('Services Updating user with id:', id, 'and data:', data);
      
  //     return await this.userRepo.updateUser(id, data);
  //   } catch (error) {
  //     console.error('UserService updateUser error:', error?.message);
  //     throw error; // Rethrow the original error
  //   }
  // }
  async updateUser(id, data) {
  try {
    console.log('Services Updating user with id:', id, 'and data:', data);

    const tenantId = data?.tenant || data?.tenantId;
    console.log('Calling findById with ID:', id, 'and tenantId:', tenantId);

    const user = await this.userRepo.findById(id, tenantId);
    if (!user) {
      return {
        status: 404,
        body: { success: false, message: 'User not found' },
      };
    }

    return await this.userRepo.updateUser(id, data);
  } catch (error) {
    console.error('UserService updateUser error:', error?.message);
    throw error; // Rethrow the original error
  }
}


  // Delete (soft)
 async deleteUser(id) {
  try {
    console.log('Deleting user with id:', id);
    const deletedUser = await this.userRepo.softDelete(id);
    return {
      status: 200,
      body: { success: true, message: 'User deleted successfully', data: deletedUser }
    };
  } catch (error) {
    console.error('UserService deleteUser error:', error?.message);
    return {
      status: 500,
      body: { success: false, message: 'Failed to delete user' }
    };
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
