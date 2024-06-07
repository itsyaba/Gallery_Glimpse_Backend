import path from "path";

import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/connectDB.js";
import { fileURLToPath } from "url";
const port = process.env.PORT || 3000;
dotenv.config();

import userRoutes from "./routes/userRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

import AppError from "./middleware/errorMiddleware.js";
import globalErrorHandler from "./controllers/errorController.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// if (process.env.NODE_ENV === "production") {
//   const __dirname = path.resolve();
//   console.log("PRODUCTION");
//   app.use("/uploads", express.static("/var/data/uploads"));
//   app.use(express.static(path.join(__dirname, "/client/dist")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
//   );
// } else {
//   console.log("DEVELOPMENT");
//   app.get("/", (req, res) => {
//     res.send("API is running....");
//   });
// }

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods:["GET" , "POST" , "PUT" , "DELETE","OPTIONS"] ,
  allowedHeaders:["Content-Type", "Authorization","Access-Control-Allow-Origin","X-Requested-With"]
}

app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  //     app.use(cors())
}

app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);


app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
  next(new AppError(`Can Not Find ${req.originalUrl} On This Server!!!`, 404));
});

app.use(globalErrorHandler);

app.listen(port, () =>
  console.log(`Server Running in ${process.env.NODE_ENV} Mode On Port ${port}!`)
);
