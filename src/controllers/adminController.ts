import { Request, Response } from "express";
import Product from "../models/Product";

export const getAdminDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });
  const featuredProducts = await Product.countDocuments({ isFeatured: true });

  res.render("admin/dashboard", {
    title: "Admin Dashboard | Kenya Ecommerce Store",
    description: "Secure admin dashboard for managing ecommerce products.",
    totalProducts,
    activeProducts,
    featuredProducts,
  });
};