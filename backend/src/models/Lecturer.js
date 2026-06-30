import mongoose from "mongoose";

const lecturerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    degree: {
      type: String,
      trim: true,
      default: null,
    },

    faculty: {
      type: String,
      trim: true,
      default: "Khoa Công nghệ thông tin",
    },

    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    max_hours: {
      type: Number,
      default: 180,
    },

    // Bổ sung: Số giờ đã dạy thực tế của giảng viên (do giảng viên cập nhật hoặc hệ thống tính toán)
    taught_hours: {
      type: Number,
      default: 0,
    },

    // Bổ sung: Khai báo nguyện vọng giảng dạy của giảng viên (môn yêu thích, buổi muốn dạy...)
    preferences: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BUSY", "INACTIVE"],
      default: "ACTIVE",
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Lecturer = mongoose.model("Lecturer", lecturerSchema);

export default Lecturer;
