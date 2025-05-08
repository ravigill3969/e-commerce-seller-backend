import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/asyncHandler";
import { uploadToCloudinary } from "../utils/cloudinary";

export const addProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productName, price, stockQuantity, category, brand, desccription } =
      req.body;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[];

    const filesArray: Express.Multer.File[] = Array.isArray(files)
      ? files
      : Object.values(files).flat();

    const urls = await uploadToCloudinary(filesArray);

    console.log(urls)
  }
);
