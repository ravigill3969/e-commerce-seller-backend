import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/asyncHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import Product from "../models/product";
import { AppError } from "../utils/AppError";

export const addProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productName, price, stockQuantity, category, brand, description } =
      req.body;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[];

    if (!files) {
      next(new AppError("Images are required!", 403));
      return;
    }

    const filesArray: Express.Multer.File[] = Array.isArray(files)
      ? files
      : Object.values(files).flat();

    const urls = await uploadToCloudinary(filesArray);

    const product = await Product.create({
      productName,
      stockQuantity,
      price,
      category,
      brand,
      description,
      photoURLs: urls,
      sellerID: req.userId,
    });

    if (!product) {
      next(new AppError("Unable to create product, try again later!", 500));
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product created successfully!",
    });
  }
);

export const getCurrentUserProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await Product.find({ sellerID: req.userId });

    res.status(200).json({
      message: "Products reterieved successfully!",
      success: true,
      products,
    });
  }
);

export const editProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      productName,
      price,
      stockQuantity,
      category,
      brand,
      description,
      imageURLs,
    } = req.body;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[];

    let newImages;

    if (files) {
      const filesArray: Express.Multer.File[] = Array.isArray(files)
        ? files
        : Object.values(files).flat();

      newImages = await uploadToCloudinary(filesArray);
    }

    if (newImages) {
      imageURLs.push(newImages);
    }

    
  }
);
