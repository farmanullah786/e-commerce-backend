// createSuperuser.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user"); // Replace with the actual path

const dbUrl = "mongodb://127.0.0.1:27017/ecommerse";

async function createSuperuser() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingSuperuser = await User.findOne({ email: "admin@admin.com" });

    if (existingSuperuser) {
      console.log("Superuser already exists.");
      return;
    }

    const superuser = new User({
      name: "Malak Farman Khan",
      email: "admin@admin.com",
      password: await bcrypt.hash("admin", 12),
      is_staff: true,
      // Add other necessary fields
    });

    await superuser.save();

    console.log("Superuser created successfully.");
  } catch (error) {
    console.error("Error creating superuser:", error);
  } finally {
    mongoose.disconnect();
  }
}

createSuperuser();
