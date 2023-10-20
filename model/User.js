const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true },
  role: { type: String, required: true, default: "user" },
  addresses: { type: [Schema.Types.Mixed] },
  //todo: we can make a separate schema for this address field
  name: { type: String },
  salt: Buffer,
  // order: { type: [Schema.Types.Mixed] },
});

//virtual creation
const virtual = userSchema.virtual("id"); //virtual properties\

//get the property
virtual.get(() => {
  return this._id;
});

//to set the virtual property
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

exports.User = mongoose.model("User", userSchema);
