import express from "express";

import {
  getLoginPage,
  getRegisterPage,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/authController";

import { redirectIfAuthenticated } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/login", redirectIfAuthenticated, getLoginPage);
router.post("/login", redirectIfAuthenticated, loginAdmin);

router.get("/register", redirectIfAuthenticated, getRegisterPage);
router.post("/register", redirectIfAuthenticated, registerAdmin);

router.post("/logout", logoutAdmin);
router.get("/logout", logoutAdmin);

export default router;