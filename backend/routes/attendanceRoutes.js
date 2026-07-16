import express from "express";
import {
  markAttendance,
  getAttendance,
} from "../controllers/attendanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("teacher"), markAttendance);
router.get("/", requireAuth, getAttendance);

export default router;
