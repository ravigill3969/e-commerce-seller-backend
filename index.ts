import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config({});

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
app.use(express.json());

app.use("/seller/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log("--- server is running" + " " + process.env.PORT + " " + "---");
});
