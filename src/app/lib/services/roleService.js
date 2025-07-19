import Role from '../models/role.js';
import RoleRepository from '../repository/roleRepository.js';

class RoleService {
    constructor() {
        this.roleRepo = new RoleRepository();
    }

    // Create
    async createRole(data) {
        try {
            return await this.roleRepo.createRole(data);
        } catch (error) {
            throw new Error('Error creating role');
        }
    }

    // Read all
    async getRoles(query = {}) {
        try {
            // Extract pagination params from query
            const pageNum = query.page ? parseInt(query.page, 10) : 1;
            const limitNum = query.limit ? parseInt(query.limit, 10) : 10;
            // Remove pagination keys from filter
            const filter = { ...query };
            delete filter.page;
            delete filter.limit;
            // Only fetch non-deleted roles
            filter.deletedAt = null;
            const result = await this.roleRepo.getAll(filter, {}, pageNum, limitNum);
            return result;
        } catch (error) {
            throw new Error('Error fetching roles');
        }
    }

    // Read one
    async getRoleById(id) {
        try {
            return await this.roleRepo.getRoleById(id);
        } catch (error) {
            throw new Error('Error fetching role');
        }
    }

    // Update
    async updateRole(id, data) {
        try {
            return await this.roleRepo.updateRole(id, data);
        } catch (error) {
            throw new Error('Error updating role');
        }
    }

    //findbyname    
    async findByName(name) {
        try {
            return await this.roleRepo.findByName(name);
        } catch (error) {
            throw new Error('Error fetching role');
        }
    }

    // Delete
    async deleteRole(id) {
        try {
            return await this.roleRepo.deleteRole(id);
        } catch (error) {
            throw new Error('Error deleting role');
        }
    }
}

export default RoleService;
