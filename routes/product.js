const express = require("express");
const { body } = require("express-validator");

const { validateField } = require("../validations/commonValidations");
const authenticateToken = require("../middleware/is-auth");
const router = express.Router();

const productController = require("../controllers/product");

router.get("/products", productController.getProducts);
router.post(
  "/add-product",
  [
    ...validateField("title"),
    body("price")
      .notEmpty()
      .withMessage({
        message: `Price field is required!`,
        statusCode: 422,
      })
      .bail()
      .isNumeric()
      .withMessage({
        message: `Price only accept numeric value!`,
        statusCode: 422,
      }),
    ...validateField("description"),
  ],
  authenticateToken,
  productController.postProduct
);
router.put(
  "/edit-product/:productId",
  [
    ...validateField("title"),
    body("price")
      .notEmpty()
      .withMessage({
        message: `Price field is required!`,
        statusCode: 422,
      })
      .bail()
      .isNumeric()
      .withMessage({
        message: `Price only accept numeric value!`,
        statusCode: 422,
      }),
    ...validateField("description"),
  ],
  authenticateToken,
  productController.editProduct
);
router.delete(
  "/delete-product/:productId",
  authenticateToken,
  productController.deleteProduct
);

module.exports = router;
