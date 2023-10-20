const mongoose = require("mongoose");
const { Schema } = mongoose;

const brandSchema = Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true, unique: true },
  //checked: {type: Boolean},
});

//virtual creation
const virtual = brandSchema.virtual("id"); //virtual properties\

//get the property
virtual.get(() => {
  return this._id;
});

//to set the virtual property
brandSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

exports.Brand = mongoose.model("Brand", brandSchema);
