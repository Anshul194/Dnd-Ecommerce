import Category from '../models/Category.js';
import mongoose from 'mongoose';
import slugify from 'slugify';
import CrudRepository from "./CrudRepository.js";

class CategoryRepository extends CrudRepository {
  constructor() {
    super(Category);
  }
  



  async findById(id) {
    try {
      return await Category.findOne({ _id: id, deletedAt: null });
    } catch (error) {
      console.error('Repo findById error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const category = new Category(data);
      return await category.save();
    } catch (error) {
      console.error('Repo create error:', error);
      throw error;
    }
  }

  async findByName(name) {
    try {
      var data= await Category.findOne({ name});
      console.log('data',data);
      return data;
    } catch (error) {
      console.error('Repo findByName error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const CategoryModel = mongoose.models.Category;
      const category = await CategoryModel.findById(id);
      if (!category) return null;

      category.set(data);

      if (category.isModified('name')) {
        const baseSlug = slugify(category.name, { lower: true, strict: true });
        let uniqueSlug;

        do {
          const randomNumber = Math.floor(100 + Math.random() * 900);
          uniqueSlug = `${baseSlug}-${randomNumber}`;
        } while (
          await CategoryModel.exists({
            slug: uniqueSlug,
            deletedAt: null,
            _id: { $ne: category._id },
          })
        );

        category.slug = uniqueSlug;
      }

      return await category.save();
    } catch (err) {
      console.error('Repo update error:', err);
      throw err;
    }
  }

  async softDelete(id) {
    try {
      console.log('Repo softDelete called with:', id);
      return await Category.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
    } catch (err) {
      console.error('Repo softDelete error:', err);
      throw err;
    }
  }
}

export default CategoryRepository;
