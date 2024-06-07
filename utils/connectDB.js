import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  // process.on("uncaughtException", (err) => {
  //   console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  //   console.log(err.name, err.message);
  //   process.exit(1);
  // });

  const DB = process.env.MONGO_URL.replace("<PASSWORD>", process.env.MONGO_PASSWORD);
  try {
    const connect = await mongoose.connect(DB);
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(`ERROR : ${error.message}`);
    process.exit(1);
  }

  // process.on("unhandledRejection", (err) => {
  //   console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  //   console.log(err.name, err.message);
  //   server.close(() => {
  //     process.exit(1);
  //   });
  // });

  // process.on("SIGTERM", () => {
  //   console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  //   server.close(() => {
  //     console.log("💥 Process terminated!");
  //   });
  // });
};

export default connectDB;
