import AttributeRepository from '../repository/attributeRepository.js';

class AttributeService {
  constructor(conn) {
    this.attributeRepo = new AttributeRepository(conn);
  }

  async createAttribute(data) {
    return await this.attributeRepo.create(data);
  }

  async getAllAttributes(query = {}) {
    // Support pagination, filtering, search, and sorting
    const {
      page = 1,
      limit = 10,
      filters = '{}',
      searchFields = '{}',
      sort = '{}',
      populateFields = [],
      selectFields = {}
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const parsedSearchFields = typeof searchFields === 'string' ? JSON.parse(searchFields) : searchFields;
    const parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;

    // Build filter conditions
    const filterConditions = { deletedAt: null, ...parsedFilters };
    // Build search conditions
    const searchConditions = [];
    for (const [field, term] of Object.entries(parsedSearchFields)) {
      searchConditions.push({ [field]: { $regex: term, $options: 'i' } });
    }
    if (searchConditions.length > 0) {
      filterConditions.$or = searchConditions;
    }
    // Build sort conditions
    const sortConditions = {};
    for (const [field, direction] of Object.entries(parsedSort)) {
      sortConditions[field] = direction === 'asc' ? 1 : -1;
    }

    // Call repository getAll for paginated, filtered, sorted results
    return await this.attributeRepo.getAll(
      filterConditions,
      sortConditions,
      pageNum,
      limitNum,
      populateFields,
      selectFields
    );
  }

  async getAttributeById(id) {
    // get from CrudRepository returns by id
    return await this.attributeRepo.get(id);
  }

  async updateAttribute(id, data) {
    return await this.attributeRepo.update(id, data);
  }

  async deleteAttribute(id) {
    // Use custom soft delete from AttributeRepository
    return await this.attributeRepo.delete(id);
  }

  async searchAttributesByName(name) {
    return await this.attributeRepo.searchByName(name);
  }
}

export default AttributeService;