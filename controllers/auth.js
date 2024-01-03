const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { clearImage } = require("../helper/clearImage");

exports.createUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashPw) => {
      const user = new User({
        name,
        email,
        password: hashPw,
      });
      return user.save();
    })
    .then((user) => {
      res.status(201).json({
        message: "User created successfully!",
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};

exports.signInUser = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }

  let loadedUser;

  User.findOne({ email: email })
    .then((user) => {
      if (user === null) {
        const error = new Error("Hey you have unauthorized with this email!");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error(
          "Hey you have unauthorized with this password!"
        );
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          userId: loadedUser._id.toString(),
          email: loadedUser.email,
          name: loadedUser.name,
          image: loadedUser.image,
        },
        "malakfarmankhan786",
        { expiresIn: "1h" }
      );
      return token;
    })
    .then((token) => {
      res.status(200).json({
        message: "successfully login!",
        access_token: token,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getUser = (req, res, next) => {
  const userId = req.params.userId;

  User.findOne({ _id: userId })
    .then((user) => {
      if (user === null) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({
        message: "User Profile!",
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateUser = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;

  let image;
  if (req.file) {
    image = `/${req.file.path.replace(/\\/g, "/")}`;
  }

  const userId = req.user._id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }

  if (password === "") {
    const error = new Error(`Password field is required!`);
    error.statusCode = 422;
    throw error;
  }

  if (password && password.toString().length < 5) {
    const error = new Error(`Password should be at least 5 characters long!`);
    error.statusCode = 422;
    throw error;
  }
  if (confirm_password === "") {
    const error = new Error(`Confirm password field is required!`);
    error.statusCode = 422;
    throw error;
  }
  if (confirm_password && confirm_password.toString().length < 5) {
    const error = new Error(
      `Confirm password should be at least 5 characters long!`
    );
    error.statusCode = 422;
    throw error;
  }
  if (confirm_password && password && confirm_password !== password) {
    const error = new Error(
      `Password and confirm password should be the same!`
    );
    error.statusCode = 422;
    throw error;
  }

  let loadedUser;
  User.findOne({ _id: userId })
    .then((user) => {
      if (!user) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      loadedUser.email = email;
      loadedUser.name = name;

      // Check if password is provided and meets the length requirement
      if (password && password.toString().length >= 5) {
        // Hash the password asynchronously
        return bcrypt.hash(password, 12);
      }

      return Promise.resolve(null); // Resolve with null if no password update is needed
    })
    .then((hashPassword) => {
      // If hashPassword is not null, it means a new password is provided
      if (hashPassword !== null) {
        loadedUser.password = hashPassword;
      }

      // Save the user object

      if (image !== undefined) {
        if (image !== loadedUser.image) {
          clearImage(loadedUser.image);
        }
        loadedUser.image = image;
      }
      return loadedUser.save();
    })
    .then((savedUser) => {
      // Send the response after saving the user
      res.status(200).json({
        message: "Profile successfully updated!",
        user: {
          _id: savedUser._id.toString(),
          name: savedUser.name,
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.forgotPassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      const error = new Error("Error occur in crypto");
      error.statusCode = 422;
      throw error;
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          const error = new Error("User with this email not exists!");
          error.statusCode = 404;
          throw error;
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((userResult) => {
        res.status(200).json({
          message: `${userResult.name} check your email inbox reset password link has been sent`,
          token: token,
        });
      })
      .catch((err) => {
        const error = new Error(err?.message ? err?.message : "Server Error");
        error.statusCode = err.statusCode ? err.statusCode : 500;
        next(error);
      });
  });
};
exports.resetPassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((errorObj, index) => {
      const error = new Error(errorObj.msg.message);
      error.statusCode = errorObj.msg.statusCode;
      throw error;
    });
  }
  const token = req.body.token;
  const password = req.body.password;
  let resetUser;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        const error = new Error("Your token has been expired!");
        error.statusCode = 422;
        throw error;
      }
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashPw) => {
      resetUser.password = hashPw;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((user) => {
      res.status(201).json({
        message: "Password changed successfully!",
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      const error = new Error(err?.message ? err?.message : "Server Error");
      error.statusCode = err.statusCode ? err.statusCode : 500;
      next(error);
    });
};
