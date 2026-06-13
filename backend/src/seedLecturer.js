import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Department from "./models/Department.js";
import Lecturer from "./models/Lecturer.js";
import Role from "./models/Role.js";
import User from "./models/User.js";
import { hashPassword } from "./utils/password.js";

dotenv.config();

await connectDB();

const lecturerRole = await Role.findOneAndUpdate(
  { code: "LECTURER" },
  {
    code: "LECTURER",
    name: "Giảng viên",
    is_deleted: false,
  },
  { upsert: true, returnDocument: "after" },
);

const department = await Department.findOneAndUpdate(
  { code: "CNTT" },
  {
    code: "CNTT",
    name: "Công nghệ thông tin",
    status: "active",
    is_deleted: false,
  },
  { upsert: true, returnDocument: "after" },
);

const user = await User.findOneAndUpdate(
  { username: "gv001" },
  {
    username: "gv001",
    password_hash: await hashPassword("123456"),
    role_id: lecturerRole._id,
    status: "ACTIVE",
    is_deleted: false,
  },
  { upsert: true, returnDocument: "after" },
);

await Lecturer.findOneAndUpdate(
  { code: "GV001" },
  {
    code: "GV001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0909000000",
    degree: "ThS",
    department_id: department._id,
    user_id: user._id,
    max_hours: 120,
    status: "ACTIVE",
    is_deleted: false,
  },
  { upsert: true, returnDocument: "after" },
);

console.log("Seeded lecturer user: gv001 / 123456");
await mongoose.disconnect();
