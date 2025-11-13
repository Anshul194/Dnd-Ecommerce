import shippingRepository from "../repository/ShippingRepository.js";
import mongoose from "mongoose";

class ShippingService {
  async createShipping(data, conn) {
    console.log(
      "[ShippingService.createShipping] Creating shipping:",
      JSON.stringify(data, null, 2),
      "Connection:",
      conn.name || "global mongoose"
    );
    this.validateShippingData(data);
    return await shippingRepository.createShipping(data, conn);
  }

  async getShippingById(id, conn) {
    console.log(
      "[ShippingService.getShippingById] Fetching shipping:",
      id,
      "Connection:",
      conn.name || "global mongoose"
    );
    return await shippingRepository.getShippingById(id, conn);
  }

  async getAllShipping(filters = {}, conn) {
    console.log(
      "[ShippingService.getAllShipping] Fetching all shipping methods",
      "Connection:",
      conn.name || "global mongoose",
      "Filters:",
      filters
    );
    return await shippingRepository.getAllShipping(filters, conn);
  }

  async updateShipping(id, data, conn) {
    console.log(
      "[ShippingService.updateShipping] Updating shipping:",
      id,
      "Data:",
      JSON.stringify(data, null, 2),
      "Connection:",
      conn.name || "global mongoose"
    );
    this.validateShippingData(data, true);
    return await shippingRepository.updateShipping(id, data, conn);
  }

  async deleteShipping(id, conn) {
    console.log(
      "[ShippingService.deleteShipping] Deleting shipping:",
      id,
      "Connection:",
      conn.name || "global mongoose"
    );
    return await shippingRepository.deleteShipping(id, conn);
  }

  validateShippingData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.name) throw new Error("Name is required");
      if (!data.shippingMethod) throw new Error("Shipping method is required");
      if (
        ![
          "standard",
          "express",
          "overnight",
          "international",
          "pickup",
        ].includes(data.shippingMethod)
      ) {
        throw new Error("Invalid shipping method");
      }
      if (data.cost == null || isNaN(data.cost) || data.cost < 0)
        throw new Error("Cost must be a non-negative number");
      if (
        !data.estimatedDeliveryDays ||
        typeof data.estimatedDeliveryDays !== "object" ||
        data.estimatedDeliveryDays.min == null ||
        data.estimatedDeliveryDays.max == null
      ) {
        throw new Error("Estimated delivery days (min and max) are required");
      }
    } else {
      if (
        data.shippingMethod &&
        ![
          "standard",
          "express",
          "overnight",
          "international",
          "pickup",
        ].includes(data.shippingMethod)
      ) {
        throw new Error("Invalid shipping method");
      }
      if (data.cost != null && (isNaN(data.cost) || data.cost < 0))
        throw new Error("Cost must be a non-negative number");
      if (
        data.estimatedDeliveryDays &&
        (typeof data.estimatedDeliveryDays !== "object" ||
          data.estimatedDeliveryDays.min == null ||
          data.estimatedDeliveryDays.max == null)
      ) {
        throw new Error(
          "Estimated delivery days (min and max) must be provided if updating"
        );
      }
    }

    if (
      data.freeShippingThreshold != null &&
      (isNaN(data.freeShippingThreshold) || data.freeShippingThreshold < 0)
    ) {
      throw new Error("Free shipping threshold must be a non-negative number");
    }
    if (data.supportedRegions) {
      if (!Array.isArray(data.supportedRegions))
        throw new Error("Supported regions must be an array");
      for (const region of data.supportedRegions) {
        if (!region.country)
          throw new Error("Country is required for each supported region");
        if (region.states && !Array.isArray(region.states))
          throw new Error("States must be an array");
        if (region.postalCodes && !Array.isArray(region.postalCodes))
          throw new Error("Postal codes must be an array");
      }
    }
    if (
      data.weightLimit &&
      (typeof data.weightLimit !== "object" ||
        data.weightLimit.min == null ||
        data.weightLimit.max == null)
    ) {
      throw new Error(
        "Weight limit (min and max) must be provided if specified"
      );
    }
    if (
      data.dimensionsLimit &&
      (typeof data.dimensionsLimit !== "object" ||
        data.dimensionsLimit.length == null ||
        data.dimensionsLimit.width == null ||
        data.dimensionsLimit.height == null)
    ) {
      throw new Error(
        "Dimensions limit (length, width, height) must be provided if specified"
      );
    }
    if (
      data.cod &&
      (typeof data.cod !== "object" ||
        data.cod.available == null ||
        (data.cod.available &&
          (data.cod.fee == null || isNaN(data.cod.fee) || data.cod.fee < 0)))
    ) {
      throw new Error(
        "COD fee must be a non-negative number if COD is available"
      );
    }
    if (data.additionalCharges && typeof data.additionalCharges === "object") {
      const charges = [
        "fuelSurcharge",
        "remoteAreaSurcharge",
        "oversizedSurcharge",
        "dangerousGoodsSurcharge",
      ];
      for (const charge of charges) {
        if (
          data.additionalCharges[charge] != null &&
          (isNaN(data.additionalCharges[charge]) ||
            data.additionalCharges[charge] < 0)
        ) {
          throw new Error(`${charge} must be a non-negative number`);
        }
      }
    }
    if (data.customs && typeof data.customs === "object") {
      if (
        data.customs.clearanceRequired != null &&
        typeof data.customs.clearanceRequired !== "boolean"
      ) {
        throw new Error("Customs clearanceRequired must be a boolean");
      }
      if (
        data.customs.documentation &&
        !Array.isArray(data.customs.documentation)
      ) {
        throw new Error("Customs documentation must be an array");
      }
    }
    if (data.proofOfDelivery && typeof data.proofOfDelivery === "object") {
      if (
        data.proofOfDelivery.available != null &&
        typeof data.proofOfDelivery.available !== "boolean"
      ) {
        throw new Error("Proof of delivery available must be a boolean");
      }
    }
    if (data.status && !["active", "inactive"].includes(data.status)) {
      throw new Error("Invalid status");
    }
  }
}

const shippingService = new ShippingService();
export default shippingService;
