import express from "express";
import {
  createAccount,
  getAccounts,
} from "../controllers/accountController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("school-admin"), createAccount);
router.get("/", requireAuth, requireRole("school-admin"), getAccounts);

export default router;
