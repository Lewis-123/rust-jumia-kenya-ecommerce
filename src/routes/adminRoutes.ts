import express from "express";
import { getAdminDashboard } from "../controllers/adminController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.use(requireAuth);

router.get("/dashboard", getAdminDashboard);

export default router;