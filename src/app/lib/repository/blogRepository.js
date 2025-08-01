

import getBlogModel from '../models/Blog';
import CrudRepository from './CrudRepository';

export class BlogRepository extends CrudRepository {
  constructor(conn) {
    super(getBlogModel(conn));
  }
}
