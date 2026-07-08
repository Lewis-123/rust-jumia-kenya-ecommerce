import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import slugify from "../utils/slugify";
import { runJumiaKenyaScraper, ApifyJumiaItem } from "../services/apifyService";

const createUniqueSlug = async (
  name: string,
  currentProductId?: string
): Promise<string> => {
  const baseSlug = slugify(name) || "product";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingProduct = await Product.findOne({ slug });

    if (
      !existingProduct ||
      (currentProductId && existingProduct._id.toString() === currentProductId)
    ) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const parseNumber = (value: unknown): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const extractPrice = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const cleanedValue = value.replace(/[^\d.]/g, "");
  const parsedValue = Number(cleanedValue);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? Math.round(parsedValue)
    : undefined;
};

const extractImageUrl = (item: ApifyJumiaItem): string | undefined => {
  if (item.imageUrl) return item.imageUrl;
  if (item.image_url) return item.image_url;
  if (item.image) return item.image;
  if (item.thumbnail) return item.thumbnail;

  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }

  return undefined;
};

const extractProductUrl = (item: ApifyJumiaItem): string | undefined => {
  return item.productUrl || item.product_url || item.url || item.link;
};

const extractCategory = (
  item: ApifyJumiaItem,
  fallbackCategory: string
): string => {
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    return item.categories[item.categories.length - 1];
  }

  return item.category || fallbackCategory;
};

export const getAdminProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  res.render("admin/products", {
    title: "Manage Products | Kenya Ecommerce Store",
    description: "Admin product management page.",
    products,
  });
};

export const getNewProductForm = (req: Request, res: Response): void => {
  res.render("admin/add-product", {
    title: "Add Product | Kenya Ecommerce Store",
    description: "Add a new ecommerce product.",
    error: null,
  });
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const category = String(req.body.category || "").trim();
    const brand = String(req.body.brand || "").trim();
    const productUrl = String(req.body.productUrl || "").trim();

    const price = parseNumber(req.body.price);
    const originalPrice = parseOptionalNumber(req.body.originalPrice);
    const stock = parseNumber(req.body.stock);

    const isFeatured = req.body.isFeatured === "on";
    const isActive = req.body.isActive === "on";

    if (!name || name.length < 2) {
      throw new Error("Product name must be at least 2 characters long.");
    }

    if (!description || description.length < 10) {
      throw new Error("Product description must be at least 10 characters long.");
    }

    if (!category) {
      throw new Error("Product category is required.");
    }

    if (price <= 0) {
      throw new Error("Product price must be greater than zero.");
    }

    if (stock < 0) {
      throw new Error("Product stock cannot be negative.");
    }

    if (!req.file) {
      throw new Error("Product image is required.");
    }

    const slug = await createUniqueSlug(name);
    const imageUrl = `/uploads/${req.file.filename}`;

    await Product.create({
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      brand,
      imageUrl,
      productUrl,
      stock,
      isFeatured,
      isActive,
      source: "manual",
    });

    res.redirect("/admin/products");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Product could not be created.";

    res.status(400).render("admin/add-product", {
      title: "Add Product | Kenya Ecommerce Store",
      description: "Add a new ecommerce product.",
      error: errorMessage,
    });
  }
};

export const getEditProductForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.redirect("/admin/products");
    return;
  }

  const product = await Product.findById(productId).lean();

  if (!product) {
    res.redirect("/admin/products");
    return;
  }

  res.render("admin/edit-product", {
    title: "Edit Product | Kenya Ecommerce Store",
    description: "Edit an existing ecommerce product.",
    product,
    error: null,
  });
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.redirect("/admin/products");
      return;
    }

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      res.redirect("/admin/products");
      return;
    }

    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const category = String(req.body.category || "").trim();
    const brand = String(req.body.brand || "").trim();
    const productUrl = String(req.body.productUrl || "").trim();

    const price = parseNumber(req.body.price);
    const originalPrice = parseOptionalNumber(req.body.originalPrice);
    const stock = parseNumber(req.body.stock);

    const isFeatured = req.body.isFeatured === "on";
    const isActive = req.body.isActive === "on";

    if (!name || name.length < 2) {
      throw new Error("Product name must be at least 2 characters long.");
    }

    if (!description || description.length < 10) {
      throw new Error("Product description must be at least 10 characters long.");
    }

    if (!category) {
      throw new Error("Product category is required.");
    }

    if (price <= 0) {
      throw new Error("Product price must be greater than zero.");
    }

    if (stock < 0) {
      throw new Error("Product stock cannot be negative.");
    }

    const slug = await createUniqueSlug(name, productId);

    const updateData: Record<string, unknown> = {
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      brand,
      productUrl,
      stock,
      isFeatured,
      isActive,
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(productId, updateData, {
      runValidators: true,
    });

    res.redirect("/admin/products");
  } catch (error) {
    const product = await Product.findById(productId).lean();

    if (!product) {
      res.redirect("/admin/products");
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Product could not be updated.";

    res.status(400).render("admin/edit-product", {
      title: "Edit Product | Kenya Ecommerce Store",
      description: "Edit an existing ecommerce product.",
      product,
      error: errorMessage,
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = req.params.id;

  if (mongoose.Types.ObjectId.isValid(productId)) {
    await Product.findByIdAndDelete(productId);
  }

  res.redirect("/admin/products");
};

export const getImportProductsPage = (req: Request, res: Response): void => {
  res.render("admin/import-products", {
    title: "Import Jumia Products | Kenya Ecommerce Store",
    description: "Import Kenyan market products from Jumia using the Apify API.",
    error: null,
    success: null,
    importedCount: null,
  });
};

export const importProductsFromApify = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchQuery = String(req.body.searchQuery || "").trim();
    const category = String(req.body.category || "").trim();

    if (!searchQuery || searchQuery.length < 2) {
      throw new Error("Please enter a product search term.");
    }

    if (!category || category.length < 2) {
      throw new Error("Please enter a category for the imported products.");
    }

    const items = await runJumiaKenyaScraper(searchQuery);

    let importedCount = 0;

    for (const item of items) {
      const name = String(
        item.title || item.name || item.productName || ""
      ).trim();

      const price =
        extractPrice(item.priceNumeric) ||
        extractPrice(item.price) ||
        extractPrice(item.currentPrice) ||
        extractPrice(item.priceText);

      const originalPrice =
        extractPrice(item.oldPriceNumeric) ||
        extractPrice(item.originalPrice) ||
        extractPrice(item.oldPrice) ||
        extractPrice(item.oldPriceText);

      const imageUrl = extractImageUrl(item);
      const productUrl = extractProductUrl(item);
      const importedCategory = extractCategory(item, category);
      const sourceId = item.sku || productUrl || name;

      if (!name || !price || !imageUrl) {
        continue;
      }

      const existingProduct = await Product.findOne({
        $or: [{ sourceId }, ...(productUrl ? [{ productUrl }] : [])],
      });

      if (existingProduct) {
        continue;
      }

      const slug = await createUniqueSlug(name);

      await Product.create({
        name,
        slug,
        description: `Imported from Jumia Kenya. This product was found under the search term "${searchQuery}".`,
        price,
        originalPrice,
        category: importedCategory,
        brand: item.brand || "",
        imageUrl,
        productUrl: productUrl || "",
        stock: 10,
        isFeatured: false,
        isActive: true,
        source: "apify-jumia",
        sourceId,
      });

      importedCount += 1;
    }

    res.render("admin/import-products", {
      title: "Import Jumia Products | Kenya Ecommerce Store",
      description: "Import Kenyan market products from Jumia using the Apify API.",
      error: null,
      success: `${importedCount} products imported successfully.`,
      importedCount,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Product import failed.";

    res.status(400).render("admin/import-products", {
      title: "Import Jumia Products | Kenya Ecommerce Store",
      description: "Import Kenyan market products from Jumia using the Apify API.",
      error: errorMessage,
      success: null,
      importedCount: null,
    });
  }
};