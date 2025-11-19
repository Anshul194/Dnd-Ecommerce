

import slugify from 'slugify';
import CrudRepository from "./CrudRepository.js";
import { categorySchema } from '../models/Category.js';

class CategoryRepository extends CrudRepository {
  constructor(conn) {
    // Use the provided connection for tenant DB, or global mongoose if not provided
    const connection = conn || require('mongoose');
    const CategoryModel = connection.models.Category || connection.model('Category', categorySchema);
    super(CategoryModel);
    this.Category = CategoryModel;
  }
  



  async findById(id) {
    try {
      return await this.Category.findOne({ _id: id, deletedAt: null });
    } catch (error) {
      //consolle.error('Repo findById error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const category = new this.Category(data);
      return await category.save();
    } catch (error) {
      //consolle.error('Repo create error:', error);
      throw error;
    }
  }

  async findByName(name) {
    try {
      var data = await this.Category.findOne({ name });
      //consolle.log('data', data);
      return data;
    } catch (error) {
      //consolle.error('Repo findByName error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const category = await this.Category.findById(id);
      if (!category) return null;

      category.set(data);

      if (category.isModified('name')) {
        const baseSlug = slugify(category.name, { lower: true, strict: true });
        let uniqueSlug;

        do {
          const randomNumber = Math.floor(100 + Math.random() * 900);
          uniqueSlug = `${baseSlug}-${randomNumber}`;
        } while (
          await this.Category.exists({
            slug: uniqueSlug,
            deletedAt: null,
            _id: { $ne: category._id },
          })
        );

        category.slug = uniqueSlug;
      }

      return await category.save();
    } catch (err) {
      //consolle.error('Repo update error:', err);
      throw err;
    }
  }

  async softDelete(id) {
    try {
      //consolle.log('Repo softDelete called with:', id);
      return await this.Category.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
    } catch (err) {
      //consolle.error('Repo softDelete error:', err);
      throw err;
    }
  }
}

export default CategoryRepository;
