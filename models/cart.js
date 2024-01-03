const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  productId: { type: mongoose.Types.ObjectId, ref: "Product", required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
});

module.exports = mongoose.model("Cart", cartSchema);
