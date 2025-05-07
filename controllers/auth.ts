import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/sendResponse";
import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import { catchAsync } from "../utils/asyncHandler";

const refreshToken = (userId: string) => {
  const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "30d" });
};

const accessToken = (userId: string) => {
  const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "3d" });
};

const sendResponseWithCookie = async (
  res: Response,
  userId: string,
  message: string
) => {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const token = accessToken(userId);

  const refreshTokenForRedis = refreshToken(userId);

  await redis.set(`${userId}-token`, refreshTokenForRedis);

  res
    .cookie("access-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 3,
    })
    .status(200)
    .json({ success: true, message });
};

export const googleOAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, picture } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      sendResponseWithCookie(res, user._id, "LoggedIn successfully!");
      return;
    }

    const rUser = await User.create({
      name,
      email,
      picture,
      password: crypto.randomUUID(),
    });

    if (!rUser) {
      sendResponse("Failed!", 403, false, res);
      return;
    }

    sendResponseWithCookie(res, rUser._id, "Registered successfully!");
  }
);
