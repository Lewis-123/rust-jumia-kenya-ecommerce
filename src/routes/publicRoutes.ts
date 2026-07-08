import express from "express";

import {
  getAboutPage,
  getContactPage,
  getHomePage,
  getShopPage,
  getSingleProductPage,
  submitContactForm,
} from "../controllers/publicController";

const router = express.Router();

router.get("/", getHomePage);
router.get("/about", getAboutPage);
router.get("/shop", getShopPage);
router.get("/shop/:slug", getSingleProductPage);
router.get("/contact", getContactPage);
router.post("/contact", submitContactForm);

export default router;