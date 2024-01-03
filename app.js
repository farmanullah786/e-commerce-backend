const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

const app = express();

const DIR = path.join(__dirname, 'images');
const filteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
    },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const sanitizedOriginalname = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
    // cb(null, new Date().toISOString()+"-"+file.originalname);
    cb(null, `${timestamp}-${sanitizedOriginalname}`)
    
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

app.use(bodyParser.json());
app.use(
  multer({ storage: filteStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/default", express.static(path.join(__dirname, "default")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);

app.use((error, req, res, next) => {
  console.log("Request Body:", req.body);
  console.log("Error:", error.stack);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ status: status, message: message });
});

// app.use((error, req, res, next) => {
//   console.error("Error:", error.stack);
//   const status = error.statusCode || 500;
//   const message = error.message || "Internal Server Error";
//   res.status(status).json({ status, message });
// });

const port = 8080; // Replace with your desired port number
const dbUrl = "mongodb://127.0.0.1:27017/ecommerse";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.log("Error connecting to MongoDB:", err));
