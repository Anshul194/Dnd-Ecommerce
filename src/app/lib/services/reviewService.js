import ReviewRepository from "../repository/reviewRepository";

export default class ReviewService {
  constructor(connection) {
    this.reviewRepository = new ReviewRepository(connection);
  }

  async createReview(data) {
    return await this.reviewRepository.create(data);
  }

  async getReviewsByProductId(productId) {
    return await this.reviewRepository.findByProductId(productId);
  }

  async getReviewById(id) {
    return await this.reviewRepository.findById(id);
  }

  async updateReview(id, data) {
    return await this.reviewRepository.update(id, data);
  }

  async deleteReview(id) {
    return await this.reviewRepository.delete(id);
  }
}