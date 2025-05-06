import User from "../models/user";
import Seller from "../models/user";
import { Request, Response, NextFunction } from "express";

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

    console.log(user)

    if(!user){
        
    }
  } catch (error) {
    console.log(error);
  }
};

// 8UEIy1ohXUIiEoYt
