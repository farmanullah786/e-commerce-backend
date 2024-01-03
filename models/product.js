const monoose = require("mongoose");
const Schema = monoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

module.exports = monoose.model("Product", productSchema);
