import mongoose from "mongoose";
import CrudRepository from "./CrudRepository";
import { ProductSchema } from "../models/Product";
import { VariantSchema } from "../models/Variant";
import { OrderSchema } from "../models/Order";

class OrderRepository extends CrudRepository {
  constructor(model, connection) {
    super(model);
    this.model = model;
    this.connection = connection || mongoose;
    console.log(
      "OrderRepository initialized with connection:",
      this.connection
        ? this.connection.name || "global mongoose"
        : "no connection"
    );
  }

  async create(data) {
    try {
      console.log("Creating order with data:", JSON.stringify(data, null, 2));
      // Runtime guard: ensure the model schema contains address fields; if not, re-register using canonical OrderSchema
      try {
        if (
          !this.model.schema.path("shippingAddress") ||
          !this.model.schema.path("billingAddress")
        ) {
          console.warn(
            "Order model on connection is missing address fields. Re-registering Order model with canonical OrderSchema."
          );
          try {
            if (
              this.connection &&
              this.connection.models &&
              this.connection.models.Order
            ) {
              // remove existing model reference so we can re-register
              delete this.connection.models.Order;
            }
            this.model = this.connection.model("Order", OrderSchema);
            console.log(
              "Re-registered Order model on connection:",
              this.connection.name || "global mongoose"
            );
          } catch (regErr) {
            console.error("Failed to re-register Order model:", regErr.message);
          }
        }
      } catch (guardErr) {
        console.warn("Order model guard check failed:", guardErr.message);
      }

      // Debug: log schema paths so we can confirm the model actually contains address fields
      try {
        const schemaPaths = Object.keys(this.model.schema.paths || {}).slice(
          0,
          200
        );
        console.log("Order model schema paths:", schemaPaths);
      } catch (e) {
        console.warn("Could not enumerate model.schema.paths:", e.message);
      }

      const res = await this.model.create(data);
      console.log("order created successfully:", res);
      return res;
    } catch (error) {
      console.error("OrderRepository Create Error:", error.message);
      throw error;
    }
  }

  async findProductById(productId) {
    console.log("Finding product by ID:", productId);
    try {
      if (!this.connection) {
        throw new Error("Database connection is not provided");
      }
      console.log(
        "Connection name:",
        this.connection.name || "global mongoose"
      );
      const Product =
        this.connection.models.Product ||
        this.connection.model("Product", ProductSchema);
      console.log("Using Product model:", Product.modelName);
      console.log("Database:", this.connection.name || "global mongoose");

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Invalid productId: ${productId}`);
      }

      const found = await Product.findById(productId).select("price");
      if (!found) {
        throw new Error(`Product ${productId} not found`);
      }
      console.log("Found product:", found);
      return found;
    } catch (error) {
      console.error("OrderRepository findProductById Error:", error.message);
      throw error;
    }
  }

  //getAllOrdersForTracking
  async getAllOrdersForTracking(populateFields = []) {
    try {
      //order which status not delivered and which have set shipping_details.tracking_number
      let query = this.model.find({
        status: { $ne: "delivered" },
        "shipping_details.reference_number": { $exists: true, $ne: null },
      });

      if (populateFields.length > 0) {
        populateFields.forEach((field) => {
          query = query.populate(field);
        });
      }

      const orders = await query.exec();

      // console.log("Orders for tracking:", orders);
      return orders;
    } catch (error) {
      console.error("OrderRepository getAllOrdersForTracking Error:", error.message);
      throw error;
    }
  }

  async findVariantById(variantId) {
    console.log("Finding variant by ID:", variantId);
    try {
      if (!this.connection) {
        throw new Error("Database connection is not provided");
      }
      console.log(
        "Connection name:",
        this.connection.name || "global mongoose"
      );
      const Variant =
        this.connection.models.Variant ||
        this.connection.model("Variant", VariantSchema);
      console.log("Using Variant model:", Variant.modelName);
      console.log("Database:", this.connection.name || "global mongoose");

      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error(`Invalid variantId: ${variantId}`);
      }

      const variant = await Variant.findById(variantId).select("price");
      if (!variant) {
        throw new Error(`Variant ${variantId} not found`);
      }
      console.log("Found variant:", variant);
      return variant;
    } catch (error) {
      console.error("OrderRepository findVariantById Error:", error.message);
      throw error;
    }
  }

  async getUserOrders(
    userId,
    filterConditions = {},
    sortConditions = {},
    page,
    limit,
    populateFields = [],
    selectFields = {}
  ) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      const queryFilters = { ...filterConditions, user: userId };
      let query = this.model.find(queryFilters).select(selectFields);

      // Only populate fields that actually exist on the model schema or as virtuals
      if (populateFields.length > 0) {
        const validPopulateFields = populateFields.filter((field) => {
          let root;
          if (typeof field === "string") {
            root = field.split(".")[0];
          } else if (field && typeof field === "object") {
            root = (field.path || "").split(".")[0];
          } else {
            return false;
          }
          const hasPath =
            !!this.model.schema.path(root) ||
            !!(this.model.schema.virtuals && this.model.schema.virtuals[root]);
          if (!hasPath) {
            console.warn(`Skipping populate for missing field: ${root}`);
          }
          return hasPath;
        });

        validPopulateFields.forEach((field) => {
          query = query.populate(field);
        });
      }

      if (Object.keys(sortConditions).length > 0) {
        query = query.sort(sortConditions);
      }

      const totalCount = await this.model.countDocuments(queryFilters);

      if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }

      const results = await query.exec();

      return {
        results,
        totalCount,
        currentPage: page || 1,
        pageSize: limit || 10,
      };
    } catch (error) {
      console.error("OrderRepository getUserOrders Error:", error.message);
      throw error;
    }
  }

  //findById
  async findById(orderId) {
    try {
      console.log("Finding order by ID:", orderId);
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error(`Invalid orderId: ${orderId}`);
      }
      const order = await this.model.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      console.error("OrderRepository findById Error:", error.message);
      throw error;
    }
  }

  async getOrderById(orderId, userId, populateFields = [], selectFields = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error(`Invalid orderId: ${orderId}`);
      }

      const queryFilters = { _id: orderId };
      // if (userId) {
      //   if (!mongoose.Types.ObjectId.isValid(userId)) {
      //     throw new Error(`Invalid userId: ${userId}`);
      //   }
      //   queryFilters.user = userId;
      // }

      let query = this.model.findOne(queryFilters).select(selectFields);

      if (populateFields.length > 0) {
        const validPopulateFields = populateFields.filter((field) => {
          let root;
          if (typeof field === "string") {
            root = field.split(".")[0];
          } else if (field && typeof field === "object") {
            root = (field.path || "").split(".")[0];
          } else {
            return false;
          }
          const hasPath =
            !!this.model.schema.path(root) ||
            !!(this.model.schema.virtuals && this.model.schema.virtuals[root]);
          if (!hasPath) {
            console.warn(`Skipping populate for missing field: ${root}`);
          }
          return hasPath;
        });

        validPopulateFields.forEach((field) => {
          query = query.populate(field);
        });
      }

      // console.log("query ===>  ", query);

      const order = await query.exec();
      if (!order) {
        throw new Error("Order not found or you do not have access");
      }

      return order;
    } catch (error) {
      console.error("OrderRepository getOrderById Error:", error.message);
      throw error;
    }
  }

  async getRecentOrders(limit = 5, populateFields = []) {
    try {
      let query = this.model.find({}).sort({ createdAt: -1 }).limit(limit);

      if (populateFields.length > 0) {
        populateFields.forEach((field) => {
          query = query.populate(field);
        });
      }

      const orders = await query.exec();
      return orders;
    } catch (error) {
      console.error("OrderRepository getRecentOrders Error:", error.message);
      throw error;
    }
  }

  async calculateIncome(filterConditions = {}) {
    try {
      const orders = await this.model.find(filterConditions).select("total");
      const totalIncome = orders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      return totalIncome;
    } catch (error) {
      console.error("OrderRepository calculateIncome Error:", error.message);
      throw error;
    }
  }

  //updateOrder
  async updateOrder(orderId, updateData) {
    try {
        // console.log('Updating order:', orderId, 'with data:', updateData);
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error(`Invalid orderId: ${orderId}`);
      }
      
      const updatedOrder = await this.model.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true }
      );
      if (!updatedOrder) {
        throw new Error("Order not found");
      }
      // console.log('Order updated successfully:', updatedOrder);
      return updatedOrder;
    } catch (error) {
      console.error("OrderRepository updateOrder Error:", error.message);
      throw error;
    }
  }

  async getAllOrders(
    filterConditions = {},
    sortConditions = {},
    page,
    limit,
    populateFields = [],
    selectFields = {}
  ) {
    try {
      const queryFilters = { ...filterConditions };
      let query = this.model
        .find(queryFilters)
        .select(selectFields)
        .sort({ createdAt: -1 });

      if (populateFields.length > 0) {
        populateFields.forEach((field) => {
          query = query.populate(field);
        });
      }

      if (Object.keys(sortConditions).length > 0) {
        query = query.sort(sortConditions);
      }

      const totalCount = await this.model.countDocuments(queryFilters);

      if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }

      const results = await query.exec();

      return {
        results,
        totalCount,
        currentPage: page || 1,
        pageSize: limit || 10,
      };
    } catch (error) {
      console.error("OrderRepository getAllOrders Error:", error.message);
      throw error;
    }
  }
}

export default OrderRepository;
