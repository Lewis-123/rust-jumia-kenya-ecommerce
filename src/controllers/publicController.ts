import { Request, Response } from "express";
import Product from "../models/Product";
import ContactMessage from "../models/ContactMessage";
import { sendContactMessageEmail } from "../services/emailService";

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const getHomePage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const featuredProducts = await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const popularProducts = await Product.find({
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const fallbackFeaturedProducts =
    featuredProducts.length > 0 ? featuredProducts : popularProducts.slice(0, 4);

  res.render("pages/home", {
    title: "Home | Kenya Ecommerce Store",
    description: "Browse affordable products available in the Kenyan market.",
    featuredProducts: fallbackFeaturedProducts,
    popularProducts,
  });
};

export const getAboutPage = (req: Request, res: Response): void => {
  res.render("pages/about", {
    title: "About Us | Kenya Ecommerce Store",
    description:
      "Learn more about Kenya Ecommerce Store and how we help customers browse Kenyan market products.",
  });
};

export const getShopPage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const search = String(req.query.search || "").trim();
  const selectedCategory = String(req.query.category || "").trim();

  const filter: Record<string, unknown> = {
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
  const slug = String(req.params.slug || "");

  const product = await Product.findOne({
    slug,
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
    formData: {
      name: "",
      email: "",
      message: "",
    },
    error: null,
  });
};

export const submitContactForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fullName = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const message = String(req.body.message || "").trim();

    const formData = {
      name: fullName,
      email,
      message,
    };

    if (fullName.length < 2) {
      res.status(400).render("pages/contact", {
        title: "Contact Us | Kenya Ecommerce Store",
        description:
          "Contact Kenya Ecommerce Store for customer support, product questions, or business inquiries.",
        formData,
        error: "Full name must be at least 2 characters long.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).render("pages/contact", {
        title: "Contact Us | Kenya Ecommerce Store",
        description:
          "Contact Kenya Ecommerce Store for customer support, product questions, or business inquiries.",
        formData,
        error: "Please enter a valid email address.",
      });
      return;
    }

    if (message.length < 10) {
      res.status(400).render("pages/contact", {
        title: "Contact Us | Kenya Ecommerce Store",
        description:
          "Contact Kenya Ecommerce Store for customer support, product questions, or business inquiries.",
        formData,
        error: "Message must be at least 10 characters long.",
      });
      return;
    }

    await ContactMessage.create({
      fullName,
      email,
      message,
    });

    await sendContactMessageEmail({
      fullName,
      email,
      message,
    });

    req.session.successMessage =
      "Your message has been sent successfully. We will get back to you soon.";

    res.redirect("/contact");
  } catch (error) {
    res.status(500).render("pages/contact", {
      title: "Contact Us | Kenya Ecommerce Store",
      description:
        "Contact Kenya Ecommerce Store for customer support, product questions, or business inquiries.",
      formData: {
        name: req.body.name || "",
        email: req.body.email || "",
        message: req.body.message || "",
      },
      error:
        "Message could not be sent. Please check the email settings and try again.",
    });
  }
};