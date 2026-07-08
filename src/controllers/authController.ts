import { Request, Response } from "express";
import Admin from "../models/Admin";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const getLoginPage = (req: Request, res: Response): void => {
  res.render("pages/login", {
    title: "Admin Login | Kenya Ecommerce Store",
    description: "Admin login page for managing ecommerce products.",
    error: null,
  });
};

export const getRegisterPage = (req: Request, res: Response): void => {
  res.render("pages/register", {
    title: "Admin Registration | Kenya Ecommerce Store",
    description: "Register an admin account to manage ecommerce products.",
    error: null,
  });
};

export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (fullName.length < 2) {
      res.status(400).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "Full name must be at least 2 characters long.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "Please enter a valid email address.",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "Password must be at least 8 characters long.",
      });
      return;
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      res.status(409).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "An admin account with this email already exists.",
      });
      return;
    }

    const admin = await Admin.create({
      fullName,
      email,
      password,
    });

    req.session.adminId = admin._id.toString();
    req.session.adminName = admin.fullName;

    res.redirect("/admin/dashboard");
  } catch (error) {
    res.status(500).render("pages/register", {
      title: "Admin Registration | Kenya Ecommerce Store",
      description: "Register an admin account to manage ecommerce products.",
      error: "Registration failed. Please try again.",
    });
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!isValidEmail(email) || password.length < 1) {
      res.status(400).render("pages/login", {
        title: "Admin Login | Kenya Ecommerce Store",
        description: "Admin login page for managing ecommerce products.",
        error: "Please enter a valid email and password.",
      });
      return;
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      res.status(401).render("pages/login", {
        title: "Admin Login | Kenya Ecommerce Store",
        description: "Admin login page for managing ecommerce products.",
        error: "Invalid email or password.",
      });
      return;
    }

    const passwordMatches = await admin.comparePassword(password);

    if (!passwordMatches) {
      res.status(401).render("pages/login", {
        title: "Admin Login | Kenya Ecommerce Store",
        description: "Admin login page for managing ecommerce products.",
        error: "Invalid email or password.",
      });
      return;
    }

    req.session.adminId = admin._id.toString();
    req.session.adminName = admin.fullName;

    res.redirect("/admin/dashboard");
  } catch (error) {
    res.status(500).render("pages/login", {
      title: "Admin Login | Kenya Ecommerce Store",
      description: "Admin login page for managing ecommerce products.",
      error: "Login failed. Please try again.",
    });
  }
};

export const logoutAdmin = (req: Request, res: Response): void => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};