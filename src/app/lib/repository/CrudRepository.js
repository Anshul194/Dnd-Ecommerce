class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  
  async create(data) {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      console.log(error.message)
      throw error;
    }
  }

  async destroy(id) {
    try {
      // console.log('iddcfvghju',id);
      const result = await this.model.findByIdAndUpdate({ _id: id }, { deletedAt: new Date(), deleted: true });
      return result;
      console.log('result',result);
    } catch (error) {
      throw error;
    }
  }
  

  async get(id, populateFields = []) {
    try {
      console.log('hello',id);
      
      let result = await this.model.findById(id);
      
      if (result.plan && result.reviews){
        result = await this.model.findById(id).populate("plan").populate("reviews");
      }

      if (populateFields?.length > 0) {
        result = await this.model.findById(id).populate(populateFields);
      }
      
      console.log('result',result);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getALL() {
    try {
      const result = await this.model.find();
      return result;
    } catch (error) {
      throw error;
    }
  }

 

  async getAll(filterCon = {}, sortCon = {}, pageNum, limitNum, populateFields = [],selectFields = {}) {
    console.log('dfgh', pageNum)
    let query;
    sortCon = Object.keys(sortCon).length === 0 ? { createdAt: -1 } : sortCon;
    if(pageNum > 0){
    query = this.model
      .find(filterCon)
      .select(selectFields)
      .sort(sortCon)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .collation({ locale: 'en', strength: 2 });
    }else{
      query = this.model
      .find(filterCon)
      .select(selectFields)
      .sort(sortCon)
      .collation({ locale: 'en', strength: 2 });
    }
    

    // Populate fields if any
    if (populateFields?.length > 0 && Object.keys(selectFields).length === 0) {
      populateFields?.forEach((field) => {
      query = query.populate(field);
      });
    }
    const result = await query;
    // Get the total count of documents matching the filter
    const totalDocuments = await this.model.countDocuments(filterCon);

    return {
      result,
      currentPage: pageNum,
      totalPages: Math.ceil(totalDocuments / limitNum),
      totalDocuments,
    };
  }

  async update(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(id, data, { new: true });
      console.log('result',result);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default CrudRepository;
