import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "./utils/errorHandler";
import { AppError } from "./utils/AppError";

dotenv.config({});

process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

if (!process.env.MONGO_DB_URI) {
  console.error("❌ MONGO_DB_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_DB_URI!)
  .then(() => {
    console.log("--- coneected to mongoDB successfully!" + " " + "---");
  })
  .catch((err) => {
    console.error("🔴 MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/seller/auth", authRouter);

app.all("/*splat", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`--- server is running on port ${PORT} ---`);
});

process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
