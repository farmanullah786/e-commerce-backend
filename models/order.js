const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  cartitems: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
    },
  ],
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
});

module.exports = mongoose.model("Order", orderSchema);
