import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";
import { sendVerificationCodeEmail } from "../services/emailService";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getVerificationExpiry = (): Date => {
  return new Date(Date.now() + 15 * 60 * 1000);
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
    formData: {
      fullName: "",
      email: "",
    },
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
    const confirmPassword = String(req.body.confirmPassword || "");

    const formData = {
      fullName,
      email,
    };

    if (fullName.length < 2) {
      res.status(400).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "Full name must be at least 2 characters long.",
        formData,
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "Please enter a valid email address.",
        formData,
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "Password must be at least 8 characters long.",
        formData,
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "Password and confirm password must match.",
        formData,
      });
      return;
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin && existingAdmin.isVerified) {
      res.status(409).render("pages/register", {
        title: "Admin Registration | Kenya Ecommerce Store",
        description: "Register an admin account to manage ecommerce products.",
        error: "An admin account with this email already exists.",
        formData,
      });
      return;
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeHash = await bcrypt.hash(verificationCode, 12);

    let admin;

    if (existingAdmin && !existingAdmin.isVerified) {
      existingAdmin.fullName = fullName;
      existingAdmin.email = email;
      existingAdmin.password = password;
      existingAdmin.verificationCodeHash = verificationCodeHash;
      existingAdmin.verificationExpiresAt = getVerificationExpiry();
      existingAdmin.isVerified = false;

      admin = await existingAdmin.save();
    } else {
      admin = await Admin.create({
        fullName,
        email,
        password,
        verificationCodeHash,
        verificationExpiresAt: getVerificationExpiry(),
        isVerified: false,
      });
    }

    await sendVerificationCodeEmail({
      to: email,
      fullName,
      code: verificationCode,
    });

    req.session.pendingAdminId = admin._id.toString();
    req.session.successMessage =
      "A verification code has been sent to your email address.";

    res.redirect("/verify-email");
  } catch (error) {
    res.status(500).render("pages/register", {
      title: "Admin Registration | Kenya Ecommerce Store",
      description: "Register an admin account to manage ecommerce products.",
      error:
        "Registration failed. Please check your email settings and try again.",
      formData: {
        fullName: req.body.fullName || "",
        email: req.body.email || "",
      },
    });
  }
};

export const getVerifyEmailPage = (req: Request, res: Response): void => {
  if (!req.session.pendingAdminId) {
    res.redirect("/register");
    return;
  }

  res.render("pages/verify-email", {
    title: "Verify Email | Kenya Ecommerce Store",
    description: "Verify your admin account using the email code.",
    error: null,
  });
};

export const verifyAdminEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const code = String(req.body.code || "").trim();
    const pendingAdminId = req.session.pendingAdminId;

    if (!pendingAdminId) {
      res.redirect("/register");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      res.status(400).render("pages/verify-email", {
        title: "Verify Email | Kenya Ecommerce Store",
        description: "Verify your admin account using the email code.",
        error: "Please enter the 6-digit verification code.",
      });
      return;
    }

    const admin = await Admin.findById(pendingAdminId).select(
      "+verificationCodeHash"
    );

    if (!admin) {
      res.redirect("/register");
      return;
    }

    if (
      !admin.verificationExpiresAt ||
      admin.verificationExpiresAt.getTime() < Date.now()
    ) {
      res.status(400).render("pages/verify-email", {
        title: "Verify Email | Kenya Ecommerce Store",
        description: "Verify your admin account using the email code.",
        error: "Verification code has expired. Please register again.",
      });
      return;
    }

    const codeMatches = await admin.compareVerificationCode(code);

    if (!codeMatches) {
      res.status(400).render("pages/verify-email", {
        title: "Verify Email | Kenya Ecommerce Store",
        description: "Verify your admin account using the email code.",
        error: "Invalid verification code.",
      });
      return;
    }

    admin.isVerified = true;
    admin.verificationCodeHash = undefined;
    admin.verificationExpiresAt = undefined;

    await admin.save();

    req.session.adminId = admin._id.toString();
    req.session.adminName = admin.fullName;
    delete req.session.pendingAdminId;

    req.session.successMessage = "Email verified successfully.";

    res.redirect("/admin/dashboard");
  } catch (error) {
    res.status(500).render("pages/verify-email", {
      title: "Verify Email | Kenya Ecommerce Store",
      description: "Verify your admin account using the email code.",
      error: "Verification failed. Please try again.",
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

    const admin = await Admin.findOne({ email }).select(
      "+password +verificationCodeHash"
    );

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

    if (!admin.isVerified) {
      const verificationCode = generateVerificationCode();

      admin.verificationCodeHash = await bcrypt.hash(verificationCode, 12);
      admin.verificationExpiresAt = getVerificationExpiry();

      await admin.save();

      await sendVerificationCodeEmail({
        to: admin.email,
        fullName: admin.fullName,
        code: verificationCode,
      });

      req.session.pendingAdminId = admin._id.toString();
      req.session.successMessage =
        "Your account is not verified. A new code has been sent to your email.";

      res.redirect("/verify-email");
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