import express from "express";
import { getClasses } from "../controllers/classController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getClasses);

export default router;
