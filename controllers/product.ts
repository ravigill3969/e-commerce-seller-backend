import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/asyncHandler";

export const addProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productName, price, stockQuantity, category, brand, desccription } = req.body;

    
  }
);
