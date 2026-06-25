import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import { connectDB } from "./config/db.js";
import Role from "./models/Role.js";
import User from "./models/User.js";
import { hashPassword } from "./utils/password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

await connectDB();

const adminRole = await Role.findOneAndUpdate(
  { code: "ADMIN" },
  {
    code: "ADMIN",
    name: "Phòng đào tạo",
    is_deleted: false,
  },
  { upsert: true, new: true },
);

const password_hash = await hashPassword("123456");

await User.findOneAndUpdate(
  { username: "admin" },
  {
    username: "admin",
    password_hash,
    role_id: adminRole._id,
    status: "ACTIVE",
    is_deleted: false,
  },
  { upsert: true, new: true },
);

console.log("Seeded admin user: admin / 123456");
await mongoose.disconnect();
