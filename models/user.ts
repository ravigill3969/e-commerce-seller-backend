import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface ISeller extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  businessName: string;
  businessDescription?: string;
  businessLogo?: string;
  businessId: string;
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialMedia?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  isVerified: boolean;
  isSuspended: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  lastLogin?: Date;
  comparePassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  createPasswordResetToken(): string;
}

const sellerSchema: Schema<ISeller> = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
    trim: true,
    maxlength: [50, "First name cannot exceed 50 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter your last name"],
    trim: true,
    maxlength: [50, "Last name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  phone: {
    type: String,
    validate: {
      validator: function (v: string) {
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: "Please enter a valid phone number",
    },
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  businessName: {
    type: String,
    required: [true, "Please enter your business name"],
    unique: true,
    trim: true,
    maxlength: [100, "Business name cannot exceed 100 characters"],
  },
  businessDescription: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  businessLogo: {
    type: String,
    default: "default-logo.jpg",
  },
  businessId: {
    type: String,
    required: true,
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  socialMedia: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
  },
  totalProducts: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

sellerSchema.index({ email: 1 });
sellerSchema.index({ businessName: 1 });

sellerSchema.pre<ISeller>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

sellerSchema.methods.comparePassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

sellerSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const Seller = mongoose.model<ISeller>("Seller", sellerSchema);

export default Seller;
