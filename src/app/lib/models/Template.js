import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({}, { strict: false, _id: false });

const componentSchema = new mongoose.Schema(
  {
    componentType: { type: String, required: true },
    componentVariant: { type: String, required: true },
    componentSpan: { type: Number, required: true },
    sortOrder: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
    settings: settingsSchema,
  },
  { _id: false }
);

const columnSchema = new mongoose.Schema(
  {
    columnIndex: { type: Number, required: true },
    columnWidth: { type: Number, required: true },
    columnTitle: { type: String, required: true },
    components: [componentSchema],
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    layoutId: { type: Number, required: true },
    layoutName: { type: String, required: true },
    totalColumns: { type: Number, required: true },
    columnGap: { type: Number, required: true },
    componentGap: { type: Number, required: true },
    rowGap: { type: Number, required: true },
    columns: [columnSchema],
  },
  {
    timestamps: true,
  }
);

export { templateSchema };
export default mongoose.models.Template ||
  mongoose.model("Template", templateSchema);
