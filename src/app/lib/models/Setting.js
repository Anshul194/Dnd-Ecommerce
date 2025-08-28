import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  tenant: { type: String, required: true, index: true }, // subdomain or tenant id
  codLimit: { type: Number, default: 1500 },
  freeShippingThreshold: { type: Number, default: 500 },
  codShippingChargeBelowThreshold: { type: Number, default: 80 },
  prepaidShippingChargeBelowThreshold: { type: Number, default: 40 },
  repeatOrderRestrictionDays: { type: Number, default: 10 },
  codOtpRequired: { type: Boolean, default: true },
  codDisableForHighRTO: { type: Boolean, default: true },
  codBlockOnRTOAddress: { type: Boolean, default: true },
  highRTOOrderCount: { type: Number, default: 3 },
}, { timestamps: true });

export const SettingSchema = settingSchema;
export const SettingModel = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
export default SettingModel;
