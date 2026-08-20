import express from "express";
import { getClasses, createClass } from "../controllers/classController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getClasses);
router.post("/", requireAuth, requireRole("school-admin"), createClass);

export default router;