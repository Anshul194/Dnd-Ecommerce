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
      // For phone-based registration, only require name and phone, make email optional
     
      

      // Check if user already exists by email (if email provided)
      if (data.email) {
        const existingUser = await this.userRepo.findByEmail(data.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
      }

      // Check if user already exists by phone (if phone provided)
      if (data.phone) {
        const existingPhoneUser = await this.userRepo.findByPhone(data.phone);
        if (existingPhoneUser) {
          throw new Error('User with this phone number already exists');
        }
      }

      // Validate role id and tenant id if provided
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
      //console.log('Creating user with data:', data);   
      // Create user in DB
      return await this.userRepo.createUser(data);
    } catch (error) {
      //console.error('UserService createUser error:', error?.message);
      throw error;
    }
  }     

  // Read all
  async getAllUsers(query = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        filters = "{}",
        searchFields = "{}",
        sort = "{}",
        populateFields = [],
        selectFields = {},
        includeDeleted,
      } = query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const parsedFilters =
        typeof filters === "string" ? JSON.parse(filters) : filters;
      const parsedSearchFields =
        typeof searchFields === "string" ? JSON.parse(searchFields) : searchFields;
      const parsedSort = typeof sort === "string" ? JSON.parse(sort) : sort;

      const filterConditions = { ...parsedFilters };

      // Only add deleted filter if not explicitly requesting all users
      if (!includeDeleted) {
        filterConditions.deleted = { $in: [false, null, undefined] };
      }

      // Accept simple query params like name/email/phone and convert to regex search
      const controlKeys = new Set([
        "page",
        "limit",
        "filters",
        "searchFields",
        "sort",
        "populateFields",
        "selectFields",
        "includeDeleted",
      ]);

      for (const [k, v] of Object.entries(query)) {
        if (controlKeys.has(k)) continue;
        if (v === undefined || v === null || v === "") continue;
        if (["name", "email", "phone"].includes(k)) {
          filterConditions[k] = { $regex: v, $options: "i" };
        } else {
          filterConditions[k] = v;
        }
      }

      // Build searchFields $or conditions
      const searchConditions = [];
      if (parsedSearchFields && typeof parsedSearchFields === "object") {
        for (const [field, term] of Object.entries(parsedSearchFields)) {
          if (term === undefined || term === null || term === "") continue;
          searchConditions.push({ [field]: { $regex: term, $options: "i" } });
        }
      }

      if (searchConditions.length > 0) {
        // If filterConditions already has $or, merge with it; otherwise assign
        if (filterConditions.$or) {
          filterConditions.$or = filterConditions.$or.concat(searchConditions);
        } else {
          filterConditions.$or = searchConditions;
        }
      }

      // Build sort conditions
      const sortConditions = {};
      if (parsedSort && typeof parsedSort === "object") {
        for (const [field, direction] of Object.entries(parsedSort)) {
          sortConditions[field] = direction === "asc" ? 1 : -1;
        }
      }

      // Use CrudRepository's getAll method
      const result = await this.userRepo.getAll(
        filterConditions,
        sortConditions,
        pageNum,
        limitNum,
        populateFields,
        selectFields
      );

      // Transform the response to match expected format
      return {
        users: result.result,
        total: result.totalDocuments,
        page: result.currentPage,
        totalPages: result.totalPages,
        limit: limitNum,
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
      //console.error('UserService findByEmail error:', error?.message);
      throw error; // Rethrow the original error
    }
  }

  // Find by phone
  async findByPhone(phone) {
    try {
      return await this.userRepo.findByPhone(phone);
    } catch (error) {
      //console.error('UserService findByPhone error:', error?.message);
      throw error; // Rethrow the original error
    }
  }

  // Get user by phone (alias)
  async getUserByPhone(phone) {
    return await this.findByPhone(phone);
  }

  // Update user by ID
  async updateUserById(id, data) {
    try {
      return await this.userRepo.updateUser(id, data);
    } catch (error) {
      //console.error('UserService updateUserById error:', error?.message);
      throw error;
    }
  }

  // Update
  // async updateUser(id, data) {
  //   try {
  //     //console.log('Services Updating user with id:', id, 'and data:', data);
      
  //     return await this.userRepo.updateUser(id, data);
  //   } catch (error) {
  //     //console.error('UserService updateUser error:', error?.message);
  //     throw error; // Rethrow the original error
  //   }
  // }
  async updateUser(id, data) {
  try {
    //console.log('Services Updating user with id:', id, 'and data:', data);

    const tenantId = data?.tenant || data?.tenantId;
    //console.log('Calling findById with ID:', id, 'and tenantId:', tenantId);

    const user = await this.userRepo.findById(id, tenantId);
    if (!user) {
      return {
        status: 404,
        body: { success: false, message: 'User not found' },
      };
    }

    return await this.userRepo.updateUser(id, data);
  } catch (error) {
    //console.error('UserService updateUser error:', error?.message);
    throw error; // Rethrow the original error
  }
}


  // Delete (soft)
 async deleteUser(id) {
  try {
    //console.log('Deleting user with id:', id);
    const deletedUser = await this.userRepo.softDelete(id);
    return {
      status: 200,
      body: { success: true, message: 'User deleted successfully', data: deletedUser }
    };
  } catch (error) {
    //console.error('UserService deleteUser error:', error?.message);
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
