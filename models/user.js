const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  notification: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
  ],
  resetToken: String,
  resetTokenExpiration: Date,
  is_staff: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
