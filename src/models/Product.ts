import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  imageUrl: string;
  productUrl?: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  source: "manual" | "apify-jumia";
  sourceId?: string;
}

export interface IProductDocument extends IProduct, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters long."],
      maxlength: [150, "Product name cannot exceed 150 characters."],
    },

    slug: {
      type: String,
      required: [true, "Product slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
      minlength: [10, "Product description must be at least 10 characters long."],
      maxlength: [2000, "Product description cannot exceed 2000 characters."],
    },

    price: {
      type: Number,
      required: [true, "Product price is required."],
      min: [1, "Product price must be greater than zero."],
    },

    originalPrice: {
      type: Number,
      min: [1, "Original price must be greater than zero."],
    },

    category: {
      type: String,
      required: [true, "Product category is required."],
      trim: true,
      maxlength: [80, "Category cannot exceed 80 characters."],
    },

    brand: {
      type: String,
      trim: true,
      maxlength: [80, "Brand cannot exceed 80 characters."],
    },

    imageUrl: {
      type: String,
      required: [true, "Product image is required."],
      trim: true,
    },

    productUrl: {
      type: String,
      trim: true,
    },

    stock: {
      type: Number,
      required: [true, "Product stock is required."],
      min: [0, "Stock cannot be negative."],
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      enum: ["manual", "apify-jumia"],
      default: "manual",
    },

    sourceId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text", category: "text" });
productSchema.index({ category: 1 });
productSchema.index({ source: 1, sourceId: 1 });

const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", productSchema);

export default Product;