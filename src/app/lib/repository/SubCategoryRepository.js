import SubCategory from '../models/SubCategory.js';
import mongoose from 'mongoose';
import slugify from 'slugify';
import CrudRepository from "./CrudRepository.js";

class SubCategoryRepository extends CrudRepository {
  constructor() {
    super(SubCategory);
  }

  async findById(id) {
    try {
      return await SubCategory.findOne({ _id: id, deletedAt: null }).populate('parentCategory');
    } catch (error) {
      console.error('SubCategory Repo findById error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const subCategory = new SubCategory(data);
      return await subCategory.save();
    } catch (error) {
      console.error('SubCategory Repo create error:', error);
      throw error;
    }
  }

  async findByName(name) {
    try {
      return await SubCategory.findOne({ name });
    } catch (error) {
      console.error('SubCategory Repo findByName error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const SubCategoryModel = mongoose.models.SubCategory;
      const subCategory = await SubCategoryModel.findById(id);
      if (!subCategory) return null;

      subCategory.set(data);

      if (subCategory.isModified('name')) {
        const baseSlug = slugify(subCategory.name, { lower: true, strict: true });
        let uniqueSlug;

        do {
          const randomNumber = Math.floor(100 + Math.random() * 900);
          uniqueSlug = `${baseSlug}-${randomNumber}`;
        } while (
          await SubCategoryModel.exists({
            slug: uniqueSlug,
            deletedAt: null,
            _id: { $ne: subCategory._id },
          })
        );

        subCategory.slug = uniqueSlug;
      }

      return await subCategory.save();
    } catch (err) {
      console.error('SubCategory Repo update error:', err);
      throw err;
    }
  }

  async softDelete(id) {
    try {
      return await SubCategory.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
    } catch (err) {
      console.error('SubCategory Repo softDelete error:', err);
      throw err;
    }
  }

  async findByParentCategory(parentCategoryId) {
    try {
      return await SubCategory.find({ parentCategory: parentCategoryId, deletedAt: null });
    } catch (err) {
      console.error('SubCategory Repo findByParentCategory error:', err);
      throw err;
    }
  }
}

export default SubCategoryRepository;