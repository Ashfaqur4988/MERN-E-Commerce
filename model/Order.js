const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentMethods = {
  values: ["card", "cash"],
  message: "enum validator failed for payment methods",
};

const orderSchema = new Schema(
  {
    items: { type: [Schema.Types.Mixed], required: true },
    totalAmount: { type: Number },
    totalItems: { type: Number },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethod: { type: String, required: true, enum: paymentMethods },
    paymentStatus: { type: String, default: "pending" },
    status: { type: String, default: "pending" },
    selectedAddress: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

//virtual creation
const virtual = orderSchema.virtual("id"); //virtual properties\

//get the property
virtual.get(() => {
  return this._id;
});

//to set the virtual property
orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

exports.Order = mongoose.model("Order", orderSchema);
