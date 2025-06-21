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
  },
);

export const getCurrentUserProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await Product.find({ sellerID: req.userId });

    res.status(200).json({
      message: "Products reterieved successfully!",
      success: true,
      products,
    });
  },
);

export const getProductWithIdForSeller = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id });

    if (!product) {
      next(new AppError("Unable to find requested product!", 404));
      return;
    }

    console.log(product.sellerID, req.userId);

    if (product.sellerID.toString() !== req.userId) {
      next(new AppError("Product donot belong to this user!", 404));
      return;
    }

    res.status(200).json({
      message: "product reterived successfully!",
      product,
      success: true,
    });
  },
);

export const editProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      productName,
      price,
      stockQuantity,
      category,
      brand,
      description,
      mediaReceived,
    } = req.body;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[];

    const product = await Product.findById(id);

    if (!product) {
      next(new AppError("Unable to find requested product!", 404));
      return;
    }

    if (product.sellerID.toString() !== req.userId) {
      next(new AppError("Product donot belong to this user!", 404));
      return;
    }

    let newImages;

    if (files) {
      const filesArray: Express.Multer.File[] = Array.isArray(files)
        ? files
        : Object.values(files).flat();

      newImages = await uploadToCloudinary(filesArray);
    }

    const allMedia = [...(mediaReceived || []), ...(newImages || [])];

    product.productName = productName;
    product.price = price;
    product.stockQuantity = stockQuantity;
    product.category = category;
    product.brand = brand;
    product.description = description;
    product.photoURLs = allMedia;

    await product.save();

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
    });
  },
);
