import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("Missing MONGODB_CONNECTION_STRING in backend/.env");
    }

    await mongoose.connect(connectionString);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
