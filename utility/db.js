import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const mongoUrl = process.env.DB_URL;
const mongoUrl ='mongodb://root:Ali_serverNewDbPass2@127.0.0.1:27017/mydb?authSource=admin'


export const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
  }
};
