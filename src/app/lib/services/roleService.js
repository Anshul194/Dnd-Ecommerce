import Role from '../models/role.js';
import RoleRepository from '../repository/roleRepository.js';

class RoleService {
    constructor() {
        this.roleRepo = new RoleRepository();
    }

    // Create
    async createRole(data, currentUser = null) {
        try {
            // If currentUser is tenant admin, restrict permissions
            if (currentUser && !currentUser.isSuperAdmin) {
                // Fetch current user's role with permissions
                let userRole = currentUser.role;
                if (!userRole || typeof userRole === 'string' || (userRole._bsontype === 'ObjectId')) {
                    userRole = await this.roleRepo.getRoleById(currentUser.role);
                }

                console.log('Current user role:', userRole);
                // Only allow assigning permissions that the user has
                if (userRole && userRole.modulePermissions && Array.isArray(data.modulePermissions)) {
                    // Build a map of allowed permissions per module
                    const allowed = {};
                    userRole.modulePermissions.forEach(mp => {
                        allowed[mp.module.toString()] = mp.permissions;
                    });
                    // Filter data.modulePermissions: only include modules present in allowed
                    data.modulePermissions = data.modulePermissions
                        .filter(mp => allowed.hasOwnProperty(mp.module?.toString()))
                        .map(mp => ({
                            module: mp.module,
                            permissions: mp.permissions.filter(p => allowed[mp.module?.toString()].includes(p))
                        }));
                }
            }
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
            console.error('RoleService.getRoles error:', error);
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
    async updateRole(id, data, currentUser = null) {
        try {
            // Debug: log currentUser at the start
            console.log('updateRole called with currentUser:', currentUser);

            // If currentUser is tenant admin, restrict permissions
            if (currentUser && !currentUser.isSuperAdmin) {
                // Fetch current user's role with permissions
                let userRole = currentUser.role;
                if (!userRole || typeof userRole === 'string' || (userRole._bsontype === 'ObjectId')) {
                    userRole = await this.roleRepo.getRoleById(currentUser.role);
                }

                // Debug: log admin's allowed permissions
                console.log('Admin role:', userRole);
                console.log('Admin role modulePermissions:', userRole && userRole.modulePermissions);

                // Only allow assigning permissions that the user has
                if (userRole && userRole.modulePermissions && Array.isArray(data.modulePermissions)) {
                    const allowed = {};
                    userRole.modulePermissions.forEach(mp => {
                        allowed[mp.module.toString()] = mp.permissions;
                    });
                    console.log('Allowed permissions map:', allowed);
                    data.modulePermissions = data.modulePermissions
                        .filter(mp => {
                            const allowedPerms = allowed[mp.module?.toString()] || [];
                            // Debug: log requested permissions vs allowed
                            console.log(
                                `Requested module: ${mp.module}, requested permissions: ${mp.permissions}, allowed: ${allowedPerms}`
                            );
                            // Only include if at least one permission matches allowed
                            return allowed.hasOwnProperty(mp.module?.toString()) &&
                                mp.permissions.some(p => allowedPerms.includes(p));
                        })
                        .map(mp => ({
                            module: mp.module,
                            permissions: mp.permissions.filter(p => {
                                const allowedPerms = allowed[mp.module?.toString()] || [];
                                // Debug: log each permission check
                                console.log(
                                    `Checking permission "${p}" for module "${mp.module}": ${allowedPerms.includes(p)}`
                                );
                                return allowedPerms.includes(p);
                            })
                        }))
                        .filter(mp => mp.permissions.length > 0); // Only keep modules with at least one allowed permission
                } else {
                    console.log('No modulePermissions to process or userRole missing.');
                }
            } else {
                console.log('Current user is super admin or not provided.', currentUser);
            }
            return await this.roleRepo.updateRole(id, data);
        } catch (error) {
            console.error('Error in updateRole:', error);
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
