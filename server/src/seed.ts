import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27018/greentech";

const ADMIN_EMAIL = "admin@greenverse.com";
const ADMIN_PASSWORD = "Admin123!";
const ADMIN_NAME = "Admin";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log("Admin account already exists:", ADMIN_EMAIL);
      process.exit(0);
    }

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin account created:", ADMIN_EMAIL);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
