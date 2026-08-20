import express from "express";
import { createAccount, getAccounts, updateAccount } from "../controllers/accountController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("school-admin"), createAccount);
router.get("/", requireAuth, requireRole("school-admin"), getAccounts);
router.patch("/:id", requireAuth, requireRole("school-admin"), updateAccount);

export default router;