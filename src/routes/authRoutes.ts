import express from "express";

import {
  getLoginPage,
  getRegisterPage,
  getVerifyEmailPage,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  verifyAdminEmail,
} from "../controllers/authController";

import { redirectIfAuthenticated } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/login", redirectIfAuthenticated, getLoginPage);
router.post("/login", redirectIfAuthenticated, loginAdmin);

router.get("/register", redirectIfAuthenticated, getRegisterPage);
router.post("/register", redirectIfAuthenticated, registerAdmin);

router.get("/verify-email", redirectIfAuthenticated, getVerifyEmailPage);
router.post("/verify-email", redirectIfAuthenticated, verifyAdminEmail);

router.post("/logout", logoutAdmin);
router.get("/logout", logoutAdmin);

export default router;