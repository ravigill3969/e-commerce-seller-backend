import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "./asyncHandler";
import { AppError } from "./AppError";
import { Redis } from "@upstash/redis";
import { redisF } from "./redis";
import {
  accessToken,
  refreshToken,
  sendResponseWithCookie,
} from "../controllers/auth";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export interface JwtPayloadWithUserId {
  userId: string;
}

//access token
export const verifyAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new AppError("Unauthorized! Token missing.", 401));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayloadWithUserId;

      req.userId = decoded.userId;

      if (!decoded) {
        verifyRefreshToken;
      }

      next();
    } catch (err) {
      return next(new AppError("Unauthorized! Invalid token.", 401));
    }
  }
);

// refresh token
export const verifyRefreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const redis = redisF();

    const token = req.cookies.refreshToken;

    if (!token) {
      throw new AppError("Refresh token not found.", 401);
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayloadWithUserId;

      const rToken = redis.get(`${decoded.userId}-token`);

      if (rToken !== token) {
        return next(new AppError("Refresh token mismatch or expired", 403));
      }

      sendResponseWithCookie(res, decoded.userId, "Token refreshed!");
    } catch (err) {
      return next(new AppError("Unauthorized! Invalid token.", 401));
    }
  }
);
