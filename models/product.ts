import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  price: number;
  stockQuantity: number;
  category: string;
  brand: string;
  description: string;
  photoURLs: string[];
  sellerID: mongoose.Types.ObjectId;
  isActive: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    productName: { type: String, required: true },
    sellerID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    photoURLs: [{ type: String }],
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
