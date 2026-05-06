import mongoose from "mongoose";
import User from "../models/User";

async function seed() {
    const MONGODB_URI = process.env.MONGODB_URI as string;
  await mongoose.connect(MONGODB_URI);

  await User.findOneAndUpdate(
    { email: "admin@scrrs.com" },
    {
      name: "System Admin",
      email: "admin@scrrs.com",
      password: "Admin@123",
      role: "admin",
    },
    { upsert: true, new: true }
  );
  process.exit(0);
}

seed();