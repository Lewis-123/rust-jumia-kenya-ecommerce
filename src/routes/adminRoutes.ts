import express from "express";
import { getAdminDashboard } from "../controllers/adminController";
import { requireAuth } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getEditProductForm,
  getImportProductsPage,
  getNewProductForm,
  importProductsFromApify,
  updateProduct,
} from "../controllers/productController";

const router = express.Router();

router.use(requireAuth);

router.get("/dashboard", getAdminDashboard);

router.get("/products", getAdminProducts);
router.get("/products/import", getImportProductsPage);
router.post("/products/import", importProductsFromApify);

router.get("/products/new", getNewProductForm);
router.post("/products", upload.single("image"), createProduct);

router.get("/products/:id/edit", getEditProductForm);
router.post("/products/:id", upload.single("image"), updateProduct);

router.post("/products/:id/delete", deleteProduct);

export default router;