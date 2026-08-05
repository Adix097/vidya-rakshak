import express from "express";
import { predictRisk } from "../controllers/predictionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:id/predict", requireAuth, predictRisk);

export default router;
