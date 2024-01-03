const express = require("express");
const {
  requiredField,
} = require("../validations/commonValidations");

const authenticateToken = require("../middleware/is-auth");

const router = express.Router();

const cartController = require("../controllers/cart");

router.get("/carts", authenticateToken, cartController.getCarts);
router.post(
  "/add-to-cart",
  [
    ...requiredField("productId"),
    ...requiredField("userId"),
    ...requiredField("price"),
  ],
  authenticateToken,
  cartController.addToCart
);

router.delete(
  "/delete-cart",
  [
    ...requiredField("_id"),
    ...requiredField("userId"),
    // ...requiredField("price"),
  ],
  authenticateToken,
  cartController.deleteCart
);

module.exports = router;
