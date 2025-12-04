import mongoose from "mongoose";

const categoryPaymentSettingSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    allowPrepaidOnly: { type: Boolean, default: false },
    disableCOD: { type: Boolean, default: false },
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    tenant: { type: String, required: true, index: true }, // subdomain or tenant id
    activeHomepageLayout: {
      type: String,
      required: true,
      enum: ["Modern & Detailed UI", "Minimal & Organic UI"],
      default: "Modern & Detailed UI",
    },
    codLimit: { type: Number, default: 1500 },
    freeShippingThreshold: { type: Number, default: 500 },
    codShippingChargeBelowThreshold: { type: Number, default: 80 },
    prepaidShippingChargeBelowThreshold: { type: Number, default: 40 },
    repeatOrderRestrictionDays: { type: Number, default: 10 },
    codOtpRequired: { type: Boolean, default: true },
    codDisableForHighRTO: { type: Boolean, default: true },
    codBlockOnRTOAddress: { type: Boolean, default: true },
    highRTOOrderCount: { type: Number, default: 3 },
    codAllowed: { type: Boolean, default: true }, // New field to allow/disallow COD globally
    categoryPaymentSettings: [categoryPaymentSettingSchema], // <-- add this line
  },
  { timestamps: true }
);

export const SettingSchema = settingSchema;
export const SettingModel =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
export default SettingModel;
