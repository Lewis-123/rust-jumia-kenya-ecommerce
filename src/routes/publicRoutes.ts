import express from "express";

import {
  getAboutPage,
  getContactPage,
  getHomePage,
  getLoginPage,
  getRegisterPage,
  getShopPage,
  getSingleProductPage,
} from "../controllers/publicController";

const router = express.Router();

router.get("/", getHomePage);
router.get("/about", getAboutPage);
router.get("/shop", getShopPage);
router.get("/shop/:slug", getSingleProductPage);
router.get("/contact", getContactPage);
router.get("/login", getLoginPage);
router.get("/register", getRegisterPage);

export default router;