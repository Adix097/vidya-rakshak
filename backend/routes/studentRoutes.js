import express from "express";
import {
  createStudent,
  getStudents,
  updateMarks,
  updateFeeStatus,
} from "../controllers/studentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("fee-coordinator"), createStudent);
router.get("/", requireAuth, getStudents);
router.patch("/:id/marks", requireAuth, requireRole("teacher"), updateMarks);
router.patch(
  "/:id/fee-status",
  requireAuth,
  requireRole("fee-coordinator"),
  updateFeeStatus,
);

export default router;
