import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
