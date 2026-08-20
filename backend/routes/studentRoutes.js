import express from "express";
import {
  createStudent,
  getStudents,
  updateStudent,
  updateMarks,
  updateTuitionFeeStatus,
  updateTransportationFeeStatus,
  getRiskOverview,
} from "../controllers/studentController.js";
import { predictRisk } from "../controllers/predictionController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// static routes MUST come before any "/:id" routes,
// otherwise Express will treat "overview" as if it were an :id
router.get("/overview", requireAuth, requireRole("school-admin"), getRiskOverview);

router.post("/", requireAuth, requireRole("fee-coordinator"), createStudent);
router.get("/", requireAuth, getStudents);

router.patch("/:id", requireAuth, requireRole("school-admin", "fee-coordinator"), updateStudent);
router.patch("/:id/marks", requireAuth, requireRole("teacher"), updateMarks);
router.patch("/:id/tuition-fee-status", requireAuth, requireRole("fee-coordinator"), updateTuitionFeeStatus);
router.patch("/:id/transportation-fee-status", requireAuth, requireRole("fee-coordinator"), updateTransportationFeeStatus);
router.post("/:id/predict", requireAuth, predictRisk);

export default router;