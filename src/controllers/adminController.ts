import { Request, Response } from "express";
import Product from "../models/Product";

export const getAdminDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });
  const hiddenProducts = await Product.countDocuments({ isActive: false });
  const featuredProducts = await Product.countDocuments({ isFeatured: true });
  const importedProducts = await Product.countDocuments({ source: "apify-jumia" });
  const manualProducts = await Product.countDocuments({ source: "manual" });

  const categories = await Product.distinct("category");

  const recentProducts = await Product.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.render("admin/dashboard", {
    title: "Admin Dashboard | Kenya Ecommerce Store",
    description: "Secure admin dashboard for managing ecommerce products.",
    totalProducts,
    activeProducts,
    hiddenProducts,
    featuredProducts,
    importedProducts,
    manualProducts,
    categoryCount: categories.length,
    recentProducts,
  });
};