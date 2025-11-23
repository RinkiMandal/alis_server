import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const mongoUrl = process.env.DB_URL;
const mongoUrl ='mongodb://localhost:27017/cakedata'


export const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
  }
};
