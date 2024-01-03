const { body } = require("express-validator");
const User = require("../models/user");

const validateField = (fieldName) => [
  body(fieldName)
    .trim()
    .isString()
    .notEmpty()
    .withMessage({
      message: `${fieldName} field is required!`,
      statusCode: 422,
    })
    .isLength({ min: 5 })
    .withMessage({
      message: `${fieldName} should be at least 5 characters long!`,
      statusCode: 422,
    }),
];
const requiredField = (fieldName) => [
  body(fieldName)
    .trim()
    .isString()
    .notEmpty()
    .withMessage({
      message: `${fieldName} field is required!`,
      statusCode: 422,
    }),
];

const emailValidation = () => [
  body("email")
    .trim()
    .notEmpty()
    .withMessage({ message: "Email field is required!", statusCode: 422 })
    .isEmail()
    .withMessage({ message: "Your Email is not valid!", statusCode: 422 }),
];
const signUpEmailValidation = () => [
  body("email")
    .trim()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject({
            message: "A user with this E-mail already exists!",
            statusCode: 409,
          });
        }
        return value;
      });
    }),
];

const confirmPasswordValidation = () => [
  body("confirm_password")
    .trim()
    .isString()
    .notEmpty()
    .withMessage({
      message: `Confirm password field is required!`,
      statusCode: 422,
    })
    .isLength({ min: 5 })
    .withMessage({
      message: `Confirm password should be at least 5 characters long!`,
      statusCode: 422,
    })

    .custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject({
          message: "Password and confirm password should be the same!",
          statusCode: 400,
        });
      }
      return value;
    }),
];

module.exports = {
  validateField,
  requiredField,
  emailValidation,
  signUpEmailValidation,
  confirmPasswordValidation,
};
