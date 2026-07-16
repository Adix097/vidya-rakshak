import express from "express";
import {
  createAssignment,
  getAssignments,
  markSubmitted,
} from "../controllers/assignmentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("teacher"), createAssignment);
router.get("/", requireAuth, getAssignments);
router.post("/submit", requireAuth, requireRole("teacher"), markSubmitted);

export default router;
