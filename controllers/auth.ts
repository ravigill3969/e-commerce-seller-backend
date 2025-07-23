import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/sendResponse";
import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { redisF } from "../utils/redis";

export const refreshToken = (userId: string) => {
  const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "30d" });
};

export const accessToken = (userId: string) => {
  const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "3d" });
};

export const sendResponseWithCookie = async (
  res: Response,
  userId: string,
  message: string
) => {
  const redis = redisF();

  console.log("yes");

  const token = accessToken(userId);
  const rToken = refreshToken(userId);

  await redis.set(`${userId}-token`, rToken, { ex: 60 * 60 * 24 * 30 });

  res
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 3,
    })
    .cookie("refreshToken", rToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
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

export const verifyUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.userId);

    if (!user) {
      next(new AppError("User nolonger exist!", 404));
      return;
    }

    res.status(200).json({
      message: "verified!",
      success: true,
      userId: user._id,
    });
  }
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res
      .cookie("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
      })
      .cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
      })
      .status(200)
      .json({ success: true, message: "logout sucess" });
    sendResponse("success", 200, true, res);
  }
);
