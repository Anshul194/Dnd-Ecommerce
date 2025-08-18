import mongoose from "mongoose";

export const shippingZoneSchema = new mongoose.Schema(
  {
    shippingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipping",
      required: true,
    },
    postalCodes: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one postal code is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const ShippingZoneModel = mongoose.models.ShippingZone || mongoose.model("ShippingZone", shippingZoneSchema);
export default ShippingZoneModel;