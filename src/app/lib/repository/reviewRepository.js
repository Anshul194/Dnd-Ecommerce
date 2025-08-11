import mongoose from "mongoose";
import { ReviewSchema } from "../models/Review.js";
import UserSchema from "../models/User.js"; // Import User schema for population

export default class ReviewRepository {
  constructor(connection) {
    this.connection = connection || mongoose;
    this.Review =
      this.connection.models.Review ||
      this.connection.model("Review", ReviewSchema);
    console.log(
      "ReviewRepository initialized with connection:",
      this.connection
        ? this.connection.name || "global mongoose"
        : "no connection"
    );
  }

  async create(data) {
    try {
      console.log("Creating review with data:", JSON.stringify(data, null, 2));
      return await this.Review.create(data);
    } catch (error) {
      console.error("ReviewRepository Create Error:", error.message);
      throw error;
    }
  }

  async findById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid reviewId: ${id}`);
      }
      const review = await this.Review.findById(id);
      if (!review) {
        throw new Error(`Review ${id} not found`);
      }
      return review;
    } catch (error) {
      console.error("ReviewRepository findById Error:", error.message);
      throw error;
    }
  }

  async findByProductId(productId, conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Invalid productId: ${productId}`);
      }

      let populatedFaq;

      const hasProductModel =
        conn.models.User || conn.model("User", UserSchema);
      console.log("hasProductModel:", hasProductModel);
      if (hasProductModel) {
        console.log("if -->");
        populatedFaq = await this.Review.find({ productId }).populate("userId");
      } else {
        console.log("else -->");
        populatedFaq = await this.Review.find({ productId });
      }

      console.log(
        "ReviewRepository findByProductId - populatedFaq:",
        populatedFaq
      );

      const data = await this.Review.find({ productId })
        .populate("userId")
        .sort({ createdAt: -1 })
        .exec();

      const result = await this.Review.aggregate([
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            rating: "$_id",
            count: 1,
            _id: 0,
          },
        },
        {
          $facet: {
            ratings: [
              {
                $group: {
                  _id: null,
                  ratings: { $push: "$$ROOT" },
                  total: { $sum: "$count" },
                },
              },
            ],
          },
        },
        {
          $unwind: "$ratings",
        },
        {
          $addFields: {
            ratingBreakdown: {
              $map: {
                input: [5, 4, 3, 2, 1], // enforce the order
                as: "star",
                in: {
                  rating: "$$star",
                  count: {
                    $let: {
                      vars: {
                        matched: {
                          $first: {
                            $filter: {
                              input: "$ratings.ratings",
                              as: "item",
                              cond: { $eq: ["$$item.rating", "$$star"] },
                            },
                          },
                        },
                      },
                      in: {
                        $ifNull: ["$$matched.count", 0],
                      },
                    },
                  },
                  percentage: {
                    $let: {
                      vars: {
                        matched: {
                          $first: {
                            $filter: {
                              input: "$ratings.ratings",
                              as: "item",
                              cond: { $eq: ["$$item.rating", "$$star"] },
                            },
                          },
                        },
                      },
                      in: {
                        $cond: {
                          if: { $gt: ["$ratings.total", 0] },
                          then: {
                            $round: [
                              {
                                $multiply: [
                                  {
                                    $divide: [
                                      { $ifNull: ["$$matched.count", 0] },
                                      "$ratings.total",
                                    ],
                                  },
                                  100,
                                ],
                              },
                              1,
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
            totalReviews: "$ratings.total",
          },
        },
        {
          $project: {
            _id: 0,
            totalReviews: 1,
            ratingBreakdown: 1,
          },
        },
      ]);

      const avgResult = await this.Review.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
          },
        },
      ]);

      const response = {
        ratingBreakdown: result[0].ratingBreakdown,
        Average: avgResult[0]?.avgRating || 0,
        Reviews: data.map(review => ({
          ...review.toObject(),
          likes: review.likes || [], // Ensure likes is included
          likeCount: review.likes ? review.likes.length : 0,
        })),
      };
      console.log("ReviewRepository findByProductId Response:", response);
      return response;
    } catch (error) {
      console.error("ReviewRepository findByProductId Error:", error.message);
      throw error;
    }
  }

  async update(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid reviewId: ${id}`);
      }
      const review = await this.Review.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (!review) {
        throw new Error(`Review ${id} not found`);
      }
      return review;
    } catch (error) {
      console.error("ReviewRepository update Error:", error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid reviewId: ${id}`);
      }
      const review = await this.Review.findByIdAndDelete(id);
      if (!review) {
        throw new Error(`Review ${id} not found`);
      }
      return true;
    } catch (error) {
      console.error("ReviewRepository delete Error:", error.message);
      throw error;
    }
  }

  async voteReview(id, userId, action) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid reviewId: ${id}`);
      }
      const review = await this.Review.findById(id);
      if (!review) {
        throw new Error(`Review ${id} not found`);
      }

      // Initialize likes array if undefined
      if (!review.likes) {
        review.likes = [];
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);

      if (action === 'like') {
        // Add user to likes if not already present
        if (!review.likes.some(u => u.equals(userObjectId))) {
          review.likes.push(userObjectId);
        }
      } else if (action === 'dislike') {
        // Remove user from likes if present
        review.likes = review.likes.filter(u => !u.equals(userObjectId));
      } else {
        throw new Error(`Invalid action: ${action}`);
      }

      await review.save();
      return {
        ...review.toObject(),
        likes: review.likes || [], // Ensure likes is included
        likeCount: review.likes.length,
      };
    } catch (error) {
      console.error("ReviewRepository voteReview Error:", error.message);
      throw error;
    }
  }
}