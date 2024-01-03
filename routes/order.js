const express = require("express");
const { requiredField } = require("../validations/commonValidations");

const authenticateToken = require("../middleware/is-auth");

const router = express.Router();

const orderController = require("../controllers/order");

router.get("/orders", authenticateToken, orderController.getOrders);
router.post(
  "/order",
  [
    ...requiredField("cartItems"),
    ...requiredField("userId"),
    ...requiredField("price"),
    ...requiredField("qty"),
  ],
  authenticateToken,
  orderController.postOrder
);

router.delete(
  "/delete-order/:orderId",
  authenticateToken,
  orderController.deleteOrder
);

module.exports = router;
