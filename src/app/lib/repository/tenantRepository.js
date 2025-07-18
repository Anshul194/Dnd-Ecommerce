import Tenant from '../models/Tenant.js';
import CrudRepository from './CrudRepository.js';

class TenantRepository extends CrudRepository {
    constructor() {
        super(Tenant);
    }

    async findByTenantId(tenantId) {
        return await Tenant.findOne({ tenantId, isDeleted: false });
    }

    async findByName(companyName) {
        return await Tenant.findOne({ companyName, isDeleted: false });
    }

    async findBySubdomain(subdomain) {
        return await Tenant.findOne({ subdomain, isDeleted: false });
    }
    

    async softDelete(id) {
        return await Tenant.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
}

export default TenantRepository;
