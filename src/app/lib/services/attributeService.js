import AttributeRepository from "../repository/attributeRepository.js";

class AttributeService {
  constructor(conn) {
    this.attributeRepo = new AttributeRepository(conn);
  }

  async createAttribute(data) {
    return await this.attributeRepo.create(data);
  }

  async getAllAttributes(query = {}) {
    // Support pagination, filtering, search, and sorting
    console.log("Query Parameters attribute: ==>", query);
    const {
      page = 1,
      limit = 10,
      filters = "{}",
      searchFields = "{}",
      sort = "{}",
      populateFields = [],
      selectFields = {},
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const parsedFilters =
      typeof filters === "string" ? JSON.parse(filters) : filters;
    const parsedSearchFields =
      typeof searchFields === "string"
        ? JSON.parse(searchFields)
        : searchFields;
    const parsedSort = typeof sort === "string" ? JSON.parse(sort) : sort;

    console.log("requestes ==> ", {
      page,
      limit,
      filters,
      searchFields,
      sort,
      populateFields,
      selectFields,
    });
    // Build filter conditions
    const filterConditions = { deletedAt: null };

    for (const [key, value] of Object.entries(parsedFilters)) {
      filterConditions[key] = value;
    }

    // Build search conditions
    const searchConditions = [];

    console.log("parsedSearchFields ", parsedSearchFields);
    for (const [field, term] of Object.entries(parsedSearchFields)) {
      searchConditions.push({ [field]: { $regex: term, $options: "i" } });
    }
    if (searchConditions.length > 0) {
      filterConditions.$or = searchConditions;
    }
    // Build sort conditions
    const sortConditions = {};
    for (const [field, direction] of Object.entries(parsedSort)) {
      sortConditions[field] = direction === "asc" ? 1 : -1;
    }

    // Call repository getAll for paginated, filtered, sorted results
    return await this.attributeRepo.getAll(
      filterConditions,
      sortConditions,
      pageNum,
      limitNum,
      populateFields
    );
  }

  async getAttributeById(id) {
    // get from CrudRepository returns by id
    return await this.attributeRepo.get(id);
  }

  //getAttributesByProductId
  async getAttributesByProductId(productId) {
    // Assuming the repository has a method to find attributes by product ID
    return await this.attributeRepo.findByProductId(productId);
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
