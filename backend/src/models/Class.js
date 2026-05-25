import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    semester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      default: null,
    },
    status: {
      type: String,
      default: "active",
    },
    max_students: {
      type: Number,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Class", classSchema);