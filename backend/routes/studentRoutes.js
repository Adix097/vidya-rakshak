import express from "express";
import {
  createStudent,
  getStudents,
  updateMarks,
  updateTuitionFeeStatus,
  updateTransportationFeeStatus,
  getRiskOverview,
} from "../controllers/studentController.js";
import { getStudentFeatures } from "../controllers/featuresController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("fee-coordinator"), createStudent);
router.get("/", requireAuth, getStudents);
router.patch("/:id/marks", requireAuth, requireRole("teacher"), updateMarks);
router.patch(
  "/:id/tution-fee-status",
  requireAuth,
  requireRole("fee-coordinator"),
  updateTuitionFeeStatus,
);
router.patch(
  "/:id/transportation-fee-status",
  requireAuth,
  requireRole("fee-coordinator"),
  updateTransportationFeeStatus,
);
router.get('/overview', requireAuth, requireRole('school-admin'), getRiskOverview);
router.get("/:id/features", requireAuth, getStudentFeatures);

export default router;
