
import slugify from 'slugify';
import CrudRepository from "./CrudRepository.js";
import { default as subCategorySchema } from '../models/SubCategory.js';
import { categorySchema } from '../models/Category.js';

class SubCategoryRepository extends CrudRepository {
  constructor(conn) {
    // Use the provided connection for tenant DB, or global mongoose if not provided
    const connection = conn || require('mongoose');
    // Ensure Category model is registered on this connection
    connection.models.Category || connection.model('Category', categorySchema);
    const SubCategoryModel = connection.models.SubCategory || connection.model('SubCategory', subCategorySchema.schema);
    super(SubCategoryModel);
    this.SubCategory = SubCategoryModel;
  }

  async findById(id) {
    try {
      return await this.SubCategory.findOne({ _id: id, deletedAt: null }).populate('parentCategory');
    } catch (error) {
      //consolle.error('SubCategory Repo findById error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const subCategory = new this.SubCategory(data);
      return await subCategory.save();
    } catch (error) {
      //consolle.error('SubCategory Repo create error:', error);
      throw error;
    }
  }

  async findByName(name) {
    try {
      return await this.SubCategory.findOne({ name });
    } catch (error) {
      //consolle.error('SubCategory Repo findByName error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const subCategory = await this.SubCategory.findById(id);
      if (!subCategory) return null;

      subCategory.set(data);

      if (subCategory.isModified('name')) {
        const baseSlug = slugify(subCategory.name, { lower: true, strict: true });
        let uniqueSlug;

        do {
          const randomNumber = Math.floor(100 + Math.random() * 900);
          uniqueSlug = `${baseSlug}-${randomNumber}`;
        } while (
          await this.SubCategory.exists({
            slug: uniqueSlug,
            deletedAt: null,
            _id: { $ne: subCategory._id },
          })
        );

        subCategory.slug = uniqueSlug;
      }

      return await subCategory.save();
    } catch (err) {
      //consolle.error('SubCategory Repo update error:', err);
      throw err;
    }
  }

  async softDelete(id) {
    try {
      return await this.SubCategory.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
    } catch (err) {
      //consolle.error('SubCategory Repo softDelete error:', err);
      throw err;
    }
  }

  async findByParentCategory(parentCategoryId) {
    try {
      return await this.SubCategory.find({ parentCategory: parentCategoryId, deletedAt: null });
    } catch (err) {
      //consolle.error('SubCategory Repo findByParentCategory error:', err);
      throw err;
    }
  }
}

export default SubCategoryRepository;