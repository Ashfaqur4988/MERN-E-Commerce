const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true, unique: true },
  //checked: { type: Boolean },
});

//virtual creation
const virtual = categorySchema.virtual("id"); //virtual properties\

//get the property
virtual.get(() => {
  return this._id;
});

//to set the virtual property
categorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

exports.Category = mongoose.model("Category", categorySchema);
