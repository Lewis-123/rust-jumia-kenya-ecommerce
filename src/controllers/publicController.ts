import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import Product, { IProductDocument } from "../models/Product";

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getHomePage = async (req: Request, res: Response): Promise<void> => {
  const featuredProducts = await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  res.render("pages/home", {
    title: "Home | Kenya Ecommerce Store",
    description: "Browse affordable products available in the Kenyan market.",
    featuredProducts,
  });
};

export const getAboutPage = (req: Request, res: Response): void => {
  res.render("pages/about", {
    title: "About Us | Kenya Ecommerce Store",
    description:
      "Learn more about Kenya Ecommerce Store and how we help customers browse Kenyan market products.",
  });
};

export const getShopPage = async (req: Request, res: Response): Promise<void> => {
  const search = String(req.query.search || "").trim();
  const selectedCategory = String(req.query.category || "").trim();

  const filter: FilterQuery<IProductDocument> = {
    isActive: true,
  };

  if (search) {
    const safeSearch = escapeRegex(search);
    const searchRegex = new RegExp(safeSearch, "i");

    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { category: searchRegex },
    ];
  }

  if (selectedCategory) {
    filter.category = new RegExp(`^${escapeRegex(selectedCategory)}$`, "i");
  }

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

  const categories = (await Product.distinct("category", {
    isActive: true,
  })) as string[];

  const cleanCategories = categories
    .filter((category) => category && category.trim().length > 0)
    .sort((a, b) => a.localeCompare(b));

  res.render("pages/shop", {
    title: "Shop Products | Kenya Ecommerce Store",
    description:
      "Explore products, prices, and product information from the Kenyan market.",
    products,
    categories: cleanCategories,
    search,
    selectedCategory,
    productCount: products.length,
  });
};

export const getSingleProductPage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).lean();

  if (!product) {
    res.status(404).render("pages/not-found", {
      title: "Product Not Found | Kenya Ecommerce Store",
      description: "The requested product could not be found.",
    });
    return;
  }

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    category: product.category,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  res.render("pages/product", {
    title: `${product.name} | Kenya Ecommerce Store`,
    description: product.description,
    product,
    relatedProducts,
  });
};

export const getContactPage = (req: Request, res: Response): void => {
  res.render("pages/contact", {
    title: "Contact Us | Kenya Ecommerce Store",
    description:
      "Contact Kenya Ecommerce Store for customer support, product questions, or business inquiries.",
  });
};