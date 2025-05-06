import User from "../models/user";
import Seller from "../models/user";
import { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/sendResponse";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, picture } = req.body;
    const user = await User.create({
      name,
      email,
      picture,
    });

    console.log(user);

    if (!user) {
      sendResponse("Failed!", 403, false, res);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Registed successfully!!",
    });
  } catch (error) {
    console.log(error);
    sendResponse("Internal server error!", 500, false, res);
  }
};

// 8UEIy1ohXUIiEoYt
