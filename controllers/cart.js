const { validationResult } = require("express-validator");
const Cart = require("../models/cart");

exports.getCarts = (req, res, next) => {
  const userId = req.user._id;

  Cart.find({
    userId: userId,
  })
    .populate("productId")
    .then((carts) => {
      res.status(200).json({
        message: "Fetched carts successfully!",
        carts: carts,
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};

exports.addToCart = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }

  const productId = req.body.productId;
  const userId = req.body.userId;
  const price = req.body.price;

  Cart.findOne({
    productId: productId,
    userId: userId,
  })
    .then((cart) => {
      if (!cart) {
        const cart = new Cart({
          productId: productId,
          userId: userId,
          price: price,
          qty: 1,
        });

        return cart.save();
      }

      cart.price += +price;
      cart.qty += 1;
      return cart.save();
    })
    .then((cartResult) => {
      res.status(200).json({
        message: "Product added to the cart successfully!",
        cart: cartResult,
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};
exports.deleteCart = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }

  const _id = req.body._id;
  const userId = req.body.userId;

  console.log(_id,userId)

  Cart.findOne({
    _id: _id,
    userId: userId,
  })
    .then((cart) => {
      if (!cart) {
        const error = new Error("Cart not found!");
        error.statusCode = 404;
        throw error;
      }
      if (cart.qty > 1) {
        cart.price -= +cart.price / +cart.qty;
        cart.qty -= 1;
        return cart.save();
      }
      return cart.deleteOne();
    })
    .then((cartResult) => {
      let message;
      if (cartResult.deletedCount && cartResult.deletedCount > 0) {
        message = "Cart deleted successfully!";
      } else {
        message = "Cart updated successfully!";
      }
      res.status(200).json({
        message: message,
        cart: cartResult,
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};
