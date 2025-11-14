const { default: mongoose } = require("mongoose");

const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  line1: {
    type: String,
    required: true,
  },
  line2: {
    type: String,
    default: "",
  },
  landmark: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const AddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    address: addressSchema,
    deletedAt: {
      type: Date,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto-handled
  }
);

export const getAddressModel = (conn) => {
  return conn.models.Address || conn.model("Address", AddressSchema);
};
const Address =
  mongoose.models.Address || mongoose.model("Address", AddressSchema);
export default Address;
