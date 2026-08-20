import express from "express";
import {
  markAttendance,
  markHoliday,
  getAttendance,
  getAttendanceHistory,
} from "../controllers/attendanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// specific route before any dynamic ones
router.get("/history", requireAuth, getAttendanceHistory);

router.post("/", requireAuth, requireRole("teacher"), markAttendance);
router.post("/holiday", requireAuth, requireRole("teacher"), markHoliday);
router.get("/", requireAuth, getAttendance);

export default router;