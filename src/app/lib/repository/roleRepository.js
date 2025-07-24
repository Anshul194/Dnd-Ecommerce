
import roleSchema from '../models/role.js';
import mongoose from 'mongoose';
import CrudRepository from './CrudRepository.js';

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

class RoleRepository extends CrudRepository {
    constructor() {
        super(Role);
    }

    async createRole(data) {
        try {
            const role = new Role(data);
            return await role.save();
        } catch (error) {
            console.error('RoleRepo create error:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return await Role.findOne({ _id: id, deletedAt: null });
        } catch (error) {
            console.error('RoleRepo findById error:', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const RoleModel = mongoose.models.Role;
            const role = await RoleModel.findById(id);
            if (!role) return null;

            role.set(data);
            return await role.save();
        } catch (error) {
            console.error('RoleRepo update error:', error);
            throw error;
        }
    }

    async softDelete(id) {
        try {
            return await Role.findByIdAndUpdate(
                id,
                { deletedAt: new Date() },
                { new: true }
            );
        } catch (error) {
            console.error('RoleRepo softDelete error:', error);
            throw error;
        }
    }

    async findByName(name) {
        try {
            return await Role.findOne({ name, deletedAt: null });
        } catch (error) {
            console.error('RoleRepo findByName error:', error);
            throw error;
        }
    }

    async getRoleById(id) {
        try {
            return await Role.findOne({ _id: id, deletedAt: null });
        } catch (error) {
            console.error('RoleRepo getRoleById error:', error);
            throw error;
        }
    }

    async updateRole(id, data) {
        try {
            const role = await Role.findById(id);
            if (!role) return null;
            role.set(data);
            return await role.save();
        } catch (error) {
            console.error('RoleRepo updateRole error:', error);
            throw error;
        }
    }

    async deleteRole(id) {
        try {
            return await Role.findByIdAndUpdate(
                id,
                { deletedAt: new Date() },
                { new: true }
            );
        } catch (error) {
            console.error('RoleRepo deleteRole error:', error);
            throw error;
        }
    }
}

export default RoleRepository;