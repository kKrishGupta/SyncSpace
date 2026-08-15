const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env")
});

const mongoose = require("mongoose");
const User = require("../models/User");

const createDevUser = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in Backend/.env");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const existingUser = await User.findOne({
      email: "dev@syncspace.local"
    });

    if (existingUser) {
      console.log("Development user already exists:");
      console.log(existingUser);

      await mongoose.disconnect();
      return;
    }

    const user = await User.create({
      name: "Krish Gupta",
      email: "dev@syncspace.local"
    });

    console.log("Development user created:");
    console.log(user);

    await mongoose.disconnect();

    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Failed to create development user:", error);

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
};

createDevUser();