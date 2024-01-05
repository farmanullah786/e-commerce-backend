const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");

const User = require("../models/user");
const {
  validateField,
  emailValidation,
  signUpEmailValidation,
  confirmPasswordValidation,
} = require("../validations/commonValidations");

const authController = require("../controllers/auth");
const authenticateToken = require("../middleware/is-auth");

const router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
var upload = multer({ storage: storage });

router.post(
  "/signup",
  [
    ...validateField("name"),
    ...emailValidation(),
    ...signUpEmailValidation(),
    ...validateField("password"),
    ...confirmPasswordValidation(),
  ],
  authController.createUser
);
router.post(
  "/signin",
  [...emailValidation(), ...validateField("password")],
  authController.signInUser
);
router.get("/login-user", authenticateToken, authController.getUser);

router.put(
  "/update-user",
  authenticateToken,
  [
    ...validateField("name"),
    ...emailValidation(),
    body("email")
    .trim()
    .custom(async (value, { req }) => {
      const user = req.user;
      
      try {
        const existingUser = await User.findOne({ email: value });
          if (
            (existingUser && existingUser.email === user.email) ||
            !existingUser
          ) {
            return value;
          }
          if (existingUser && existingUser.email !== user.email) {
            // If the email exists and belongs to a different user
            return Promise.reject({
              message: "A user with this E-mail already exists!",
              statusCode: 409,
            });
          }
        } catch (error) {
          throw new Error("Server error while checking email availability.");
        }
      }),
  ],
  authenticateToken,
  authController.updateUser
);

router.post(
  "/forgot-password",
  [...emailValidation()],
  authController.forgotPassword
);
router.post(
  "/reset-password",
  [...validateField("password"), ...confirmPasswordValidation()],
  authController.resetPassword
);

router.get("/notifications", authenticateToken, authController.getNotifications);

router.delete(
  "/delete-notification/:notificationId",
  authenticateToken,
  authController.deleteNotification
);
module.exports = router;
