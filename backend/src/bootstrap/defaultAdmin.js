import Role from "../models/Role.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import { hashPassword } from "../utils/password.js";

export const ensureDefaultAdmin = async () => {
  if (process.env.SEED_DEFAULT_ADMIN === "false") return;

  const adminRole = await Role.findOneAndUpdate(
    { code: "ADMIN" },
    {
      code: "ADMIN",
      name: "Phòng đào tạo",
      is_deleted: false,
    },
    { upsert: true, new: true },
  );

  await User.findOneAndUpdate(
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

  console.log("Default admin is ready: admin / 123456");
};

export const ensureDefaultDepartments = async () => {
  if (process.env.SEED_DEFAULT_DEPARTMENTS === "false") return;

  const defaults = [
    { code: "CNTT", name: "Công nghệ thông tin" },
    { code: "KHMT", name: "Khoa học máy tính" },
    { code: "HTTT", name: "Hệ thống thông tin" },
  ];

  for (const item of defaults) {
    await Department.findOneAndUpdate(
      { code: item.code },
      {
        ...item,
        status: "active",
        is_deleted: false,
      },
      { upsert: true, new: true },
    );
  }

  console.log("Default departments are ready");
};
