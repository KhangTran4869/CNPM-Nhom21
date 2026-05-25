import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
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
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
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

export default mongoose.model("Schedule", scheduleSchema);