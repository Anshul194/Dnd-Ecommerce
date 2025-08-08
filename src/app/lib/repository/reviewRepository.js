import mongoose from "mongoose";
import { ReviewSchema } from "../models/Review.js";
import { Average } from "next/font/google/index.js";
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
        Reviews: data,
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
}
