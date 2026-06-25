import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import { connectDB } from "./config/db.js";
import Assignment from "./models/Assignment.js";
import Class from "./models/Class.js";
import Course from "./models/Course.js";
import Department from "./models/Department.js";
import Lecturer from "./models/Lecturer.js";
import LecturerAvailability from "./models/LecturerAvailability.js";
import Role from "./models/Role.js";
import Room from "./models/Room.js";
import Schedule from "./models/Schedule.js";
import Semester from "./models/Semester.js";
import User from "./models/User.js";
import { hashPassword } from "./utils/password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

await connectDB();

const adminRole = await Role.findOneAndUpdate(
  { code: "ADMIN" },
  { code: "ADMIN", name: "Phòng đào tạo", is_deleted: false },
  { upsert: true, new: true },
);

const lecturerRole = await Role.findOneAndUpdate(
  { code: "LECTURER" },
  { code: "LECTURER", name: "Giảng viên", is_deleted: false },
  { upsert: true, new: true },
);

const admin = await User.findOneAndUpdate(
  { username: "admin" },
  {
    username: "admin",
    password_hash: await hashPassword("123456"),
    role_id: adminRole._id,
    status: "ACTIVE",
    is_deleted: false,
  },
  { upsert: true, new: true },
);

const department = await Department.findOneAndUpdate(
  { code: "CNTT" },
  {
    code: "CNTT",
    name: "Công nghệ thông tin",
    status: "active",
    is_deleted: false,
  },
  { upsert: true, new: true },
);

const course = await Course.findOneAndUpdate(
  { code: "CNPM" },
  {
    code: "CNPM",
    name: "Công nghệ phần mềm",
    credits: 3,
    department_id: department._id,
    is_deleted: false,
  },
  { upsert: true, new: true },
);

const semester = await Semester.findOneAndUpdate(
  { name: "HK1 2026-2027" },
  {
    name: "HK1 2026-2027",
    start_date: new Date("2026-09-01"),
    end_date: new Date("2027-01-15"),
    is_deleted: false,
  },
  { upsert: true, new: true },
);

const roomA = await Room.findOneAndUpdate(
  { name: "A101" },
  { name: "A101", capacity: 80, is_deleted: false },
  { upsert: true, new: true },
);

const roomB = await Room.findOneAndUpdate(
  { name: "B202" },
  { name: "B202", capacity: 60, is_deleted: false },
  { upsert: true, new: true },
);

const lecturers = [];
for (const item of [
  ["gv001", "GV001", "Nguyễn Văn A"],
  ["gv002", "GV002", "Trần Thị B"],
  ["gv003", "GV003", "Lê Văn C"],
]) {
  const [username, code, name] = item;
  const user = await User.findOneAndUpdate(
    { username },
    {
      username,
      password_hash: await hashPassword("123456"),
      role_id: lecturerRole._id,
      status: "ACTIVE",
      is_deleted: false,
    },
    { upsert: true, new: true },
  );
  const lecturer = await Lecturer.findOneAndUpdate(
    { code },
    {
      code,
      name,
      email: `${username}@example.com`,
      phone: "0909000000",
      degree: "ThS",
      department_id: department._id,
      user_id: user._id,
      max_hours: 120,
      status: "ACTIVE",
      is_deleted: false,
    },
    { upsert: true, new: true },
  );
  lecturers.push(lecturer);
}

const assignedClass = await Class.findOneAndUpdate(
  { code: "CNPM01" },
  {
    code: "CNPM01",
    course_id: course._id,
    semester_id: semester._id,
    status: "ASSIGNED",
    max_students: 60,
    is_deleted: false,
  },
  { upsert: true, new: true },
);

const openClass = await Class.findOneAndUpdate(
  { code: "CNPM02" },
  {
    code: "CNPM02",
    course_id: course._id,
    semester_id: semester._id,
    status: "OPEN",
    max_students: 50,
    is_deleted: false,
  },
  { upsert: true, new: true },
);

await Schedule.findOneAndUpdate(
  { class_id: assignedClass._id, day_of_week: 2, start_period: 1 },
  {
    class_id: assignedClass._id,
    day_of_week: 2,
    start_period: 1,
    end_period: 3,
    room_id: roomA._id,
    is_deleted: false,
  },
  { upsert: true, new: true },
);

await Schedule.findOneAndUpdate(
  { class_id: openClass._id, day_of_week: 4, start_period: 4 },
  {
    class_id: openClass._id,
    day_of_week: 4,
    start_period: 4,
    end_period: 6,
    room_id: roomB._id,
    is_deleted: false,
  },
  { upsert: true, new: true },
);

await LecturerAvailability.findOneAndUpdate(
  { lecturer_id: lecturers[1]._id, day_of_week: 4, start_period: 4 },
  {
    lecturer_id: lecturers[1]._id,
    day_of_week: 4,
    start_period: 4,
    end_period: 6,
    status: "FREE",
    is_deleted: false,
  },
  { upsert: true, new: true },
);

await Assignment.findOneAndUpdate(
  { class_id: assignedClass._id, lecturer_id: lecturers[0]._id },
  {
    class_id: assignedClass._id,
    lecturer_id: lecturers[0]._id,
    status: "APPROVED",
    assigned_by: admin._id,
    note: "Dữ liệu mẫu",
    is_deleted: false,
  },
  { upsert: true, new: true },
);

console.log("Seeded assignment sample data");
await mongoose.disconnect();
