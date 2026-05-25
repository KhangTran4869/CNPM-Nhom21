import mongoose from "mongoose";

const lecturerAvailabilitySchema = new mongoose.Schema(
  {
    lecturer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      default: null,
    },
    day_of_week: {
      type: Number,
      default: null,
    },
    start_period: {
      type: Number,
      default: null,
    },
    end_period: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      default: "available",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model(
  "LecturerAvailability",
  lecturerAvailabilitySchema,
);
