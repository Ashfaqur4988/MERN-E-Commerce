const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true }, //reference to the Product schema
  quantity: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, //reference to the User schema
});

//virtual creation
const virtual = cartSchema.virtual("id"); //virtual properties\

//get the property
virtual.get(() => {
  return this._id;
});

//to set the virtual property
cartSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

exports.Cart = mongoose.model("Cart", cartSchema);
