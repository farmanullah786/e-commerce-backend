const mongoose = require("mongoose");
const Product = require("../models/product");
const Cart = require("../models/cart");
const { validationResult } = require("express-validator");
const { clearImage } = require("../helper/clearImage");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) =>
      res
        .status(200)
        .json({ message: "Fetched all products!", products: products })
    )
    .catch((error) => console.log(error));
};

exports.postProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }
  if (!req.file) {
    const error = new Error("Input file is required!");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    image: `/${req.file.path.replace(/\\/g, "/")}`,
  });
  return product
    .save()
    .then((product) =>
      res
        .status(201)
        .json({ message: "Product added successfully!", product: product })
    )
    .catch((err) => {
      const error = new Error(err.message ? err.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};

exports.editProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }
  let image;
  if (req.file) {
    image = `/${req.file.path.replace(/\\/g, "/")}`;
  }

  const productId = req.params.productId;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  Product.findById({ _id: productId })
    .then((product) => {
      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        clearImage(product.image);
        product.image = image;
      }

      return product.save();
    })
    .then((productData) => {
      res.status(200).json({
        message: "Product updated successfully!",
        productId: productData._id.toString(),
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findByIdAndDelete({ _id: productId })
    .then((product) => {
      if (!product) {
        const error = new Error("Product not found!");
        error.statusCode = 404;
        throw error;
      }
      // Assuming clearImage is a function to delete the product image
      clearImage(product.image);

      res.status(200).json({
        message: "Product deleted successfully!",
        productId: product._id.toString(),
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};
