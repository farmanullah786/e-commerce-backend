const { validationResult } = require("express-validator");
const Order = require("../models/order");
const Cart = require("../models/cart");

exports.getOrders = (req, res, next) => {
  const userId = req.user._id;

  Order.find({
    userId: userId,
  })
    .populate("cartitems")
    .populate("cartitems.productId")
    .then((orders) => {
      res.status(200).json({
        message: "Fetched orders successfully!",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};

exports.postOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }

  const cartItems = req.body.cartItems;
  const userId = req.body.userId;
  const price = req.body.price;
  const qty = req.body.qty;
  let orderResult;
  try {
    const order = new Order({
      cartitems: JSON.parse(cartItems),
      userId: userId,
      price: price,
      qty: qty,
    });

    orderResult = await order.save();
    const deleteCart = await Cart.find({
      userId: userId,
    }).deleteMany();

    if (deleteCart.deletedCount > 0) {
      res.status(200).json({
        message: "Order placed successfully!",
        order: orderResult,
      });
    } else {
      // Rollback: Delete the created order
      await Order.findByIdAndDelete(orderResult._id);
      res.status(400).json({
        message: "Order not placed! Failed to delete items from the Cart.",
      });
    }
  } catch (err) {
    await Order.findByIdAndDelete(orderResult._id);
    const error = new Error(err?.message ? err?.message : "Server Error");
    error.statusCode = err.statusCode ? err.statusCode : 500;
    next(error);
  }
};
exports.deleteOrder = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }

  const userId = req.user._id;
  const orderId = req.params.orderId;

  Order.findOne({
    _id: orderId,
    userId: userId,
  })
    .then((order) => {
      if (!order) {
        const error = new Error("Order not found!");
        error.statusCode = 404;
        throw error;
      }
      return order.deleteOne();
    })
    .then((orderResult) => {
      let message;
      if (orderResult.deletedCount > 0) {
        message = "Order deleted successfully!";
      }
      res.status(200).json({
        message: message,
        order: orderResult,
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};
