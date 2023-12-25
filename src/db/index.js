import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  try {
  } catch (error) {
    console.log("MONGODB connection failed!");
    process.exit(1);
  }
};

export default connectDB;
